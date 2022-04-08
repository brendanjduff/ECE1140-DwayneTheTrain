//constants
const int NUM_BLOCKS = 150;
const int NUM_MISC_INPUTS = 16;

const int NUM_SWITCHES = 6;
const int NUM_CROSSINGS = 1;
const int NUM_STATIONS = 12;

//inputs
bool bo[NUM_BLOCKS];              //block occupancy
bool bb[NUM_BLOCKS];              //block broken
bool misc[NUM_MISC_INPUTS];       //miscellaneous inputs

//outputs
bool switches[NUM_SWITCHES];      //switches 1-6
bool crossings[NUM_CROSSINGS];    //crossings; ignored for iteration 3
bool stationLights[NUM_STATIONS]; //12 stations

//packet reading state
const int PACKET_SIZE = 4;
int readCount = 0;

void processByte(byte value) {
  //set bo, bb, and misc as function of readCount and value

  if(readCount < 4) {
    for(int i = 0; i < 8; i++) {
      bo[readCount*8 + i] = (value >> i) & 1;
    }
  }
}

void updateOutputs() {
  waysideA();
  //waysideB();
  //waysideC();
  //waysideD();
}

void waysideA() {
  switches[4] = bo[11];
}

void waysideB() {
  switches[3] = bo[28];
}

void waysideC() {
  switches[0] = 0; 
  switches[5] = 0;
}

void waysideD() {
  switches[1] = bo[26];
  switches[2] = bo[99];
}

void sendOutputs() {
  byte outputData[4];
  
  for(int i = 0; i < NUM_SWITCHES; i++) {
    Serial.write(switches[i]);
  }
  
  for(int i = 0; i < NUM_CROSSINGS; i++) {
    Serial.write(crossings[i]);
  }

  for(int i = 0; i < NUM_STATIONS; i++) {
    Serial.write(crossings[i]);
  }
}

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
}

void loop() {
  byte value;
  
  if(Serial.available()) {
    value = Serial.read();
    //Serial.write(value+1);
    processByte(value);
    
    readCount++;
    if(readCount >= PACKET_SIZE) {
      readCount %= PACKET_SIZE;

      //all needed inputs read, now update outputs
      updateOutputs();
      sendOutputs();
    }
  }
}
