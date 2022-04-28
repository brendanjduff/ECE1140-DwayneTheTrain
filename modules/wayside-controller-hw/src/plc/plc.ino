/*
 * J. Kent Wirant
 * April 28, 2022
 * Wayside Controller (Hardware)
 * Programmable Logic Controller (Arduino)
 */

//=======================//
// TRANSMISSION PROTOCOL //
//=======================//

/*
 *    Communication occurs in packet frames: a sequence of related packets.
 *    A Packet Frame may have one or more packets of different lengths.
 *    
 *    (<> means required, [] means sometimes there, number of bytes is after dash)
 *      
 *    Packet Format: <CMD-1>[<LEN-2><DAT-X>]<CHK-1>
 *      CMD: Type of packet. If MSB is 0, more packets will follow for the current frame.
 *           If MSB is 1, no more packets will follow for the current frame.
 *      LEN: A 2-byte little endian number indicating the number of bytes X in the DAT field. 
 *           Present only for PROGRAM, INPUT, OUTPUT, and CONTINUE commands. Not present 
 *           for NAK or ACK commands.
 *      DAT: The data stream associated with the packet. Format depends on command type.
 *      CHK: A 1-byte checksum for the packet. The checksum is chosen so that the sum of
 *           all bytes in the packet is equal to 0x00 mod 256.
 *           
 *    DAT Format:
 *      PROGRAM: <nSw-1><nCr-1><nLt-1><nMo-1><nOc-1><nOp-1><nMi-1><indices-Y><nInstr-2><instr-Z>
 *        nSw:     Number of switches controlled by this PLC.
 *        nCr:     Number of crossings controlled by this PLC.
 *        nLt:     Number of station lights controlled by this PLC.
 *        nMo:     Number of miscellaneous outputs controlled by this PLC.
 *        nOc:     Number of block occupancies read by this PLC.
 *        nOp:     Number of block operational statuses read by this PLC.
 *        nMi:     Number of miscellaneous inputs controlled by this PLC.
 *        indices: A series of Y=(nSw+nCr+nLt+nMo+nOc+nOp+nMi) bytes with the input/output
 *                 indices present in input and output streams. The order of indices is
 *                 referenced when decoding input and output streams. nSw indices appear
 *                 first for the switches, then nCr for the crossings, and so on based on 
 *                 the order specified above.
 *        nInstr:  A 2-byte little-endian value Z indicating the number of instruction bytes
 *                 following this field.
 *        instr:   Z bytes of instructions and their arguments, if applicable. See the 
 *                 Instruction Format section below for details.
 *      INPUT: <bits-U>
 *        bits:    A series of bits corresponding to the input indices specified by a PROGRAM
 *                 command. The first nOc bits represent the values of program-specified
 *                 block occupancies, then the next nOp bits represent the values of
 *                 block operational statuses, and the next nMi bits represent the 
 *                 values of miscellaneous inputs. The bit order is little endian and
 *                 LSB-first. There are U=ceil[(nOc+nOp+nMi)/8] bytes in this DAT field.
 *      OUTPUT: <bits-V>
 *        bits:    A series of bits corresponding to the output indices specified by a PROGRAM
 *                 command. The first nSw bits represent the values of program-specified
 *                 switches, then the next nCr bits represent the values of crossings, the 
 *                 next nLt bits represent the values of lights at stations, and the next nMo 
 *                 bits represent the values of miscellaneous outputs. The bit order is little 
 *                 endian and LSB-first. There are V=ceil[(nSw+nCr+nLt+nMo)/8] bytes in this 
 *                 DAT field.
 *      CONTINUE: <bytes-W>
 *        bytes:   The CONTINUE command uses the same data format of the most recent
 *                 non-CONTINUE packet frame.
 *                 
 *    Instruction Format: <OPCODE-1>[index-1]
 *      OPCODE:    A byte representing the instruction operation and instruction argument
 *                 type, if applicable. The four least significant bits indicate the
 *                 operation, and the four most significant bits indicate the argument type.
 *                 Operations include LD, ST, OR, AND, and NOT. Arguments types include FALSE,
 *                 TRUE, SW, CR, LT, MO, OC, OP, MI, and INTERMEDIATE. Argument types are 
 *                 used only for LD and ST instructions and are ignored in other cases.
 *                 Protocol constants are declared later in this source file; please view 
 *                 them for details.
 *      index:     An index into the array of the argument type specified in the OPCODE field.
 *                 This field is present only for LD and ST instructions. In the case of a
 *                 FALSE or TRUE argument type, the value of this field is not used.
 *      
 */

//===========//
// CONSTANTS //
//===========//

//Protocol constants: commands
#define CMD_PROGRAM   (0x7F) //reprogram PLC
#define CMD_INPUT     (0x7C) //update inputs
#define CMD_OUTPUT    (0x7A) //output request
#define CMD_CONTINUE  (0x75) //continuation of previous packet frame
#define CMD_NAK       (0x73) //negative acknowledge (retransmit request)
#define CMD_ACK       (0x70) //acknowledge (transmission successful)
#define CMD_FLAG_LAST (0x80) //XOR with this to indicate final packet in frame

//Protocol constants: instruction operations
#define INSTR_OP_LD     (0x02) //must XOR an instruction argument type with this
#define INSTR_OP_ST     (0x03) //must XOR an instruction argument type with this
#define INSTR_OP_OR     (0x04)
#define INSTR_OP_AND    (0x05)
#define INSTR_OP_NOT    (0x06)

//Protocol constants: instruction argument types
#define INSTR_ARG_FALSE (0x20)
#define INSTR_ARG_TRUE  (0x30)
#define INSTR_ARG_SW    (0x40)
#define INSTR_ARG_CR    (0x50)
#define INSTR_ARG_LT    (0x60)
#define INSTR_ARG_MO    (0x70)
#define INSTR_ARG_OC    (0x80)
#define INSTR_ARG_OP    (0x90)
#define INSTR_ARG_MI    (0xA0)
#define INSTR_ARG_OTHER (0xB0) //intermediate variable

//memory size constants
const int MAX_NUMBER_OF_VARS = 256;
const int MAX_PROGRAM_SIZE = 4096;
const int EXECUTION_STACK_SIZE = 512;

//serial I/O constants
#define MAX_PACKET_SIZE (48)

//==============//
// PROGRAM DATA //
//==============//

//program data, including input indices, output indices, and instructions 
byte program[MAX_PROGRAM_SIZE];

//output indices first, input indices second, instructions last
unsigned short inputStartIndex = 0;
unsigned short instrStartIndex = 0;

//programmed number of inputs and outputs
byte nSw = 0;
byte nCr = 0;
byte nLt = 0;
byte nMo = 0;
byte nOc = 0;
byte nOp = 0;
byte nMi = 0;
byte nIm = 0;

//=================//
// EXECUTION STATE //
//=================//

//inputs
bool oc[MAX_NUMBER_OF_VARS];  //block occupancy
bool op[MAX_NUMBER_OF_VARS];  //block operational
bool mi[MAX_NUMBER_OF_VARS];  //miscellaneous inputs

//outputs
bool sw[MAX_NUMBER_OF_VARS];  //switches
bool cr[MAX_NUMBER_OF_VARS];  //crossings
bool lt[MAX_NUMBER_OF_VARS];  //station lights
bool mo[MAX_NUMBER_OF_VARS];  //miscellaneous outputs

//intermediate variables
bool im[MAX_NUMBER_OF_VARS];

//execution stack; operand and operation results are stored here
bool execStack[EXECUTION_STACK_SIZE];

//==================//
// SERIAL I/O STATE //
//==================//

byte frameType = 0;

//===========//
// FUNCTIONS //
//===========//

void processByte(byte);

void setup() {
  Serial.setTimeout(50);
  Serial.begin(9600);
}

void loop() {
  byte value;
  
  if(Serial.available()) {
    value = Serial.read();
    Serial.write(value+1);
    //processByte(value);
  }
}

void processByte(byte value) {

}
