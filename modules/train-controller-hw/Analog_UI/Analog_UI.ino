#include "LiquidCrystal_I2C.h"
#include <Wire.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

const int  Speed_Up_button = 2;
const int  Speed_Down_button = 25;
const int  Temperature_Up_button = 4;
const int  Temperature_Down_button = 5;
const int  KP_Up_button   = 6;
const int  KP_Down_button = 23;
const int  KI_Up_button = 8;
const int  KI_Down_button = 9;
const int  Tunnel_Lights_button = 10;
const int  Left_Door_button = 11;
const int  Right_Door_button = 12;
const int  Hand_Brake_button = 24;
const int  Emergency_Brake_button = 22; 
const int Driver_Mode_button = 26;
const int Automatic_Mode_button = 27;
const int Engine_Failure = 28;
const int Brake_Failure = 29;
const int Third_Failure = 30;

//avoid Pins 7 and 13
//incoming from Train Module
//Place Holders

int err;
int cumErr;

//*****KEY******//
//Input Value = 0;//
//Input Button Up = 0;//
//Activate action for Button Up = 0;//
//Input Button Down = 0;//
//Activate action for Button Down = 0;//
//Up || Down val = 0;//
//*******OR******//
//Input Value = 0;//
//Input Button = 0;//
//Activate action for Button = 0;//
//actual button val = 0;//

//Speed Variables
int SPD = 0;
int SPDButtonState_Up = 0;
int LastSPDButtonState_Up = 0;
int SPDButtonState_Down = 0; 
int LastSPDButtonState_Down = 0;
bool SPDButton = false;

//Temperature Variables
int TMP = 70; 
int TMPButtonState_Up = 0;
int LastTMPButtonState_Up = 0;
int TMPButtonState_Down = 0; 
int LastTMPButtonState_Down = 0;
bool TMPButton = false;

//KP Variables
long KP = 100000; 
int KPButtonState_Up = 0;
int LastKPButtonState_Up = 0;
int KPButtonState_Down = 0; 
int LastKPButtonState_Down = 0;
bool KPButton = false;

//KI Variables
long KI = 0; 
int KIButtonState_Up = 0;
int LastKIButtonState_Up = 0;
int KIButtonState_Down = 0; 
int LastKIButtonState_Down = 0;
bool KIButton = false;

//Emergency Brake Variables
bool EBR = false;
int EBRButtonState = 0; 
int LastEBRButtonState = 0;
bool EBRButton = false;

//Hand Brake Variables
bool HBR = false;
int HBRButtonState = 0; 
int LastHBRButtonState = 0;
bool HBRButton = false;

//Left Door Variables
bool LDR = false;
int LDRButtonState = 0; 
int LastLDRButtonState = 0;
bool LDRButton = false;

//Right Door Variables
bool RDR = false;
int RDRButtonState = 0; 
int LastRDRButtonState = 0;
bool RDRButton = false;

//Tunnel Light Variables
bool TL = false;
int TLButtonState = 0; 
int LastTLButtonState = 0;
bool TLButton = false;

//Driver/Engineer Variables
bool DM = false;
int DMButtonState = 0; 
int LastDMButtonState = 0;
bool DMButton = false;

//Automatic/Manual Variables
bool AM = false;
int AMButtonState = 0; 
int LastAMButtonState = 0;
bool AMButton = false;

int CMDSpd, ACTSpd;
int SpdLim = 1000;
int Authority = 1;
bool Beacon_Lights, Beacon_LDoor, Beacon_RDoor;

//LED vars
bool Engine_Fail_Flag, Brake_Fail_Flag, Third_Fail_Flag;
int IntTunnelLights, IntRDoors, IntLDoors, IntStation;


void setup()
{
  Serial.begin(9600);
  lcd.begin();
  lcd.backlight();
  pinMode( Speed_Up_button, INPUT_PULLUP);
  pinMode( Speed_Down_button, INPUT_PULLUP);
  pinMode( Temperature_Up_button, INPUT_PULLUP);
  pinMode( Temperature_Down_button, INPUT_PULLUP);
  pinMode( KP_Up_button, INPUT_PULLUP);
  pinMode( KP_Down_button, INPUT_PULLUP);
  pinMode( KI_Up_button, INPUT_PULLUP);
  pinMode( KI_Down_button, INPUT_PULLUP);
  pinMode( Hand_Brake_button, INPUT_PULLUP);
  pinMode( Emergency_Brake_button, INPUT_PULLUP);
  pinMode( Right_Door_button, INPUT_PULLUP);
  pinMode( Left_Door_button, INPUT_PULLUP);
  pinMode( Driver_Mode_button, INPUT_PULLUP);
  pinMode( Automatic_Mode_button, INPUT_PULLUP);
  pinMode( Engine_Failure, OUTPUT);
  pinMode( Brake_Failure, OUTPUT);
  pinMode( Third_Failure, OUTPUT);
  CMDSpd = 5;
  ACTSpd = 0;
  EBR = false;
}

void loop()
{
  //calcPower(CMDSpd, ACTSpd, cumErr, err);
  //Check all button states
  if(Serial.available()){
    String ser_input = (String)Serial.readString();
    char * token1 = strtok(ser_input.c_str(), ",");
    CMDSpd = ((String)token1).toInt();
    char * token2 = strtok(NULL, ",");
    ACTSpd = ((String)token2).toInt();
    char * token3 = strtok(NULL, ",");
    Authority = ((String)token3).toInt();
    char * token4 = strtok(NULL, ",");
    Engine_Fail_Flag = ((String)token4).toInt();
    char * token5 = strtok(NULL, ",");
    Brake_Fail_Flag = ((String)token5).toInt();
    char * token6 = strtok(NULL, ",");
    Third_Fail_Flag = ((String)token6).toInt();
    char * token7 = strtok(NULL, ",");
    IntTunnelLights = ((String)token7).toInt();
    char * token8 = strtok(NULL, ",");
    IntRDoors = ((String)token8).toInt();
    char * token9 = strtok(NULL, ",");
    IntLDoors = ((String)token9).toInt();
    //char * token10 = strtok(NULL, ",");
    //IntStation = ((String)token10).toInt();
  }
   calcPower(CMDSpd, ACTSpd);
   CSPDUp(); 
   CSPDDown();
   CTMPUp();
   CTMPDown();
   CEBr();
   CHBr();
   CLDr();
   CRDr();
   CKPUp();
   CKPDown();
   CKIUp();
   CKIDown();
   CTL();
   CDM();
   CAM();
   //if button was clicked
   if(IntStation != 0){
    announceStation();
   }
   if(Engine_Fail_Flag == false){
      digitalWrite(Engine_Failure, LOW);
   }
   else{
      digitalWrite(Engine_Failure, HIGH);
   }
   
   if(Brake_Fail_Flag == false){
      digitalWrite(Brake_Failure, LOW);
   }
   else{
      digitalWrite(Brake_Failure, HIGH);
   }

   if(Third_Fail_Flag == false){
      digitalWrite(Third_Failure, LOW);
   }
   else{
      digitalWrite(Third_Failure, HIGH);
   }
   //if Manual is On
   if(AM != 1){
      //if Speed button is clicked
      if(SPDButton){
          SPDButton = false;
          delay(50);
      }
      //if Temperature button is clicked
      if(TMPButton){
          TMPButton = false;
          delay(50);
      }
      //if kP button is clicked
      if(KPButton){
          KPButton = false;
          delay(50);
      }
      //if kI button is clicked
      if(KIButton){
          KIButton = false;
          delay(50);
      }
      //if Emergency break is clicked
      if(EBRButton){
        EBRButton = false;
        delay(50);
      }
      //if Hand Brake is clicked
      if(HBRButton){
        HBRButton = false;
        delay(50);
      }
      //if Left Door Button is clicked
      if(LDRButton){
        LDRButton = false;
        delay(50);
      }
      //if Right Door button is clicked
      if(RDRButton){
        RDRButton = false;
        delay(50);
      }
      //if tunnel lights button is clicked
      if(TLButton){
        TLButton = false;
        delay(50);
      }
      //if User button is clicked
      if(DMButton){
        DMButton = false;
        delay(50);
      }
      //if Mode button is clicked
      if(AMButton){
        AMButton = false;
        delay(50);
      }
   }
   //actually works here, doesnt work if other one does not exist
   //fixed this bug^^
   if(AM == 1){
   SPD = CMDSpd;
   if(CMDSpd == 0){
      if(!HBR) {
        HBR = true;
        Serial.print("sBrake:1;");
      } 
   } else if (HBR) {
     HBR = false;
     Serial.print("sBrake:0;");
   }
   if(Authority == 0){
      if(!EBR) {
        EBR = true;
        Serial.print("eBrake:1;");
      }
   } else if (EBR) {
     EBR = false;
     Serial.print("eBrake:0;");
   }
   if((int)TL != IntTunnelLights){
      if(IntTunnelLights == 1){
        TL = true;
        Serial.print("Lights:1;");
      } else {
        TL = false;
        Serial.print("Lights:0;");
      }
   }
   if((int)LDR != IntLDoors){
      if(IntLDoors == 1 && ACTSpd == 0){
        LDR = true;
        Serial.print("lDoors:1;");
      } else if (LDR) {
        LDR = false;
        Serial.print("lDoors:0;");
      }
   } else if (ACTSpd != 0 && LDR) {
     LDR = false;
     Serial.print("lDoors:0;");
   }
   if((int)RDR != IntRDoors){
      if(IntRDoors == 1 && ACTSpd == 0){
        RDR = true;
        Serial.print("rDoors:1;");
      } else if (RDR) {
        RDR = false;
        Serial.print("rDoors:0;");
      }
   } else if (ACTSpd != 0 && RDR) {
     RDR = false;
     Serial.print("rDoors:0;");
   }
   }
   lcd.clear();
   lcd.print("CMD:");
   lcd.print(CMDSpd);
   lcd.print(" ACT:");
   lcd.print(ACTSpd);
   lcd.print(" A:");
   lcd.print(Authority);
   delay(50);
}


//Speed Up
void CSPDUp()
{
  if(DM == false){
  SPDButtonState_Up = digitalRead(Speed_Up_button);
  if (SPDButtonState_Up != LastSPDButtonState_Up) {
    if (SPDButtonState_Up == LOW) {
      if(SPD < CMDSpd){
        SPD++;
      }
      SPDButton = true;
      lcd.setCursor(0, 1);
      lcd.print("Speed: ");
      lcd.print(SPD);
      lcd.print("m/s");
      delay(50);
    } 
    else {
    }
    delay(50); //delay to avoid issues
  }
//save Button State
  LastSPDButtonState_Up = SPDButtonState_Up;
}
}
//Speed Down
void CSPDDown()
{
  if(DM == false){
  SPDButtonState_Down = digitalRead(Speed_Down_button);
  if (SPDButtonState_Down != LastSPDButtonState_Down) {
    if (SPDButtonState_Down == LOW) {
      if(SPD < 45){
        SPD--;
      }
      SPDButton = true;
      lcd.setCursor(0, 1);
      lcd.print("Speed: ");
      lcd.print(SPD);
      lcd.print("m/s");
      delay(50);
    } 
    else {
    }
    delay(50); //delay to avoid issues
  }
  //save button state
  LastSPDButtonState_Down = SPDButtonState_Down;
}
}
//Power Commands
int max_train_weight, min_train_weight, max_power, min_power;
void calcPower(int cmdSpd, int actSpd){
  //max_cap_weight = 20000;
  //train_weight = 40000;
  max_train_weight = 60000;
  //accepted_var = 20000;
  min_train_weight = 20000;
  max_power = .5 * SPD * max_train_weight * max_train_weight;
  min_power = .5 * SPD * min_train_weight * min_train_weight;
  err = cmdSpd - actSpd;
  cumErr = cumErr + err;
  //if(KP*err+KI*cumErr < 480000 && KP*err+KI*cumErr < max_power && KP*err+KI*cumErr > min_power){
  if(KP*err+KI*cumErr < 480000){
    int PWR = KP*err+KI*cumErr;
    Serial.print("Power:");
    Serial.print(PWR);
    Serial.print(";");
  }
  if(KP*err+KI*cumErr > 480000){
    int PWR = 480000;
    Serial.print("Power:");
    Serial.print(PWR);
    Serial.print(";");
  }
}
//Temp
void CTMPUp()
{
  TMPButtonState_Up = digitalRead(Temperature_Up_button);
  if (TMPButtonState_Up != LastTMPButtonState_Up) {
    if (TMPButtonState_Up == LOW) {
      if(TMP < 80){
        TMP++;
      }
      TMPButton = true;
      Serial.print("Temp:");
      Serial.print(TMP);
      Serial.print(";");
      lcd.setCursor(0, 1);
      lcd.print("Temp:");
      lcd.print(TMP);
      lcd.print("F");
    } 
    else {
    }
    delay(50); //delay to avoid issues
  }
//save Button State
  LastTMPButtonState_Up = TMPButtonState_Up;
}

void CTMPDown()
{
  TMPButtonState_Down = digitalRead(Temperature_Down_button);
  if (TMPButtonState_Down != LastTMPButtonState_Down) {
    if (TMPButtonState_Down == LOW) {
      if(TMP > 55){
        TMP--;
      }
      TMPButton = true;
      Serial.print("Temp:");
      Serial.print(TMP);
      Serial.print(";");
      lcd.setCursor(0, 1);
      lcd.print("Temp:");
      lcd.print(TMP);
      lcd.print("F");
    } 
    else {
    }
    delay(200); //delay to avoid issues
  }
  //save button state
  LastTMPButtonState_Down = TMPButtonState_Down;
}
//KP commands
void CKPUp()
{
  if(DM == true){
  KPButtonState_Up = digitalRead(KP_Up_button);
  if (KPButtonState_Up != LastKPButtonState_Up) {
    if (KPButtonState_Up == LOW) {
      KP++;
      KPButton = true;
    } 
    else {
    }
    lcd.setCursor(0, 1);
    lcd.print("kP: ");
    lcd.println(KP);
    delay(50); //delay to avoid issues
  }
//save Button State
  LastKPButtonState_Up = KPButtonState_Up;
}
}

void CKPDown()
{
  if(DM == true){
  KPButtonState_Down = digitalRead(KP_Down_button);
  if (KPButtonState_Down != LastKPButtonState_Down) {
    if (KPButtonState_Down == LOW) {
      KP--;
      KPButton = true;
    }
    lcd.setCursor(0, 1); 
    lcd.print("kP: ");
    lcd.println(KP);
    delay(50); //delay to avoid issues
  }
  //save button state
  LastKPButtonState_Down = KPButtonState_Down;
}
}
//Ki Commands
void CKIUp()
{
  if(DM == true){
  KIButtonState_Up = digitalRead(KI_Up_button);
  if (KIButtonState_Up != LastKIButtonState_Up) {
    if (KIButtonState_Up == LOW) {
      KI++;
      KIButton = true;
    } 
    else {
    }
    lcd.setCursor(0, 1);
    lcd.print("kI: ");
    lcd.println(KI);
    delay(50); //delay to avoid issues
  }
//save Button State
  LastKIButtonState_Up = KIButtonState_Up;
}
}

void CKIDown()
{
  if(DM == true){
  KIButtonState_Down = digitalRead(KI_Down_button);
  if (KIButtonState_Down != LastKIButtonState_Down) {
    if (KIButtonState_Down == LOW) {
      KI--;
      KIButton = true;
    } 
    else {
    }
    lcd.setCursor(0, 1);
    lcd.print("kI: ");
    lcd.print(KI);
    delay(50); //delay to avoid issues
  }
  //save button state
  LastKIButtonState_Down = KIButtonState_Down;
}
}
//Emergency brake Command
void CEBr()
{
  EBRButtonState = digitalRead(Emergency_Brake_button);
  if (EBRButtonState != LastEBRButtonState) {
    if (EBRButtonState == LOW) {
      EBR = not(EBR);
      EBRButton = true;
      Serial.print("eBrake:");
      lcd.setCursor(0, 1);
      lcd.print("Emergency Brake");
      delay(50);
      if(EBR == 1){
        Serial.print("1;");
        lcd.print("On");
      }
      if(EBR == 0){
        Serial.print("0;");
        lcd.print("Off");
      }
    } 
    else {
    }
    delay(50); //delay to avoid issues
  }
  //save button state
  LastEBRButtonState = EBRButtonState;
}
//Hand Brake Command
void CHBr()
{
  HBRButtonState = digitalRead(Hand_Brake_button);
  if (HBRButtonState != LastHBRButtonState) {
    if (HBRButtonState == LOW) {
      HBR = not(HBR);
      HBRButton = true;
      lcd.setCursor(0, 1);
      Serial.print("sBrake:");
      lcd.print("sBrake: ");
      if(HBR == 1){
        lcd.print("On");
        Serial.print("1;");
      }
      if(HBR == 0){
        lcd.print("Off");
        Serial.print("0;");
      }
    } 
    else {
    }
    delay(50); //delay to avoid issues
  }
  //save button state
  LastHBRButtonState = HBRButtonState;
}
//Door Commands
void CLDr()
{
  LDRButtonState = digitalRead(Left_Door_button);
  if (LDRButtonState != LastLDRButtonState) {
    if (LDRButtonState == LOW) {
      LDR = not(LDR);
      LDRButton = true;
      lcd.setCursor(0, 1);
      Serial.print("lDoors:");
      lcd.print("lDoors: ");
      if(LDR == 1){
        Serial.print("1;");
        lcd.print("Open");
      }
      if(LDR == 0){
        Serial.print("0;");
        lcd.print("Closed");
      }
    } 
    else {
    }
    delay(50); //delay to avoid issues
  }
  //save button state
  LastLDRButtonState = LDRButtonState;
}

void CRDr()
{
  RDRButtonState = digitalRead(Right_Door_button);
  if (RDRButtonState != LastRDRButtonState) {
    if (RDRButtonState == LOW) {
      RDR = not(RDR);
      RDRButton = true;
      lcd.setCursor(0, 1);
      Serial.print("rDoors:");
      lcd.print("rDoors: ");
      if(RDR == 1){
        Serial.print("1;");
        lcd.print("Open");
      }
      if(RDR == 0){
        Serial.print("0;");
        lcd.print("Closed");
      }
    } 
    else {
    }
    delay(50); //delay to avoid issues
  }
  //save button state
  LastRDRButtonState = RDRButtonState;
}
//Lights Command
void CTL()
{
  TLButtonState = digitalRead(Tunnel_Lights_button);
  if (TLButtonState != LastTLButtonState) {
    if (TLButtonState == LOW) {
      TL = not(TL);
      TLButton = true;
      lcd.setCursor(0, 1);
      Serial.print("Lights:");
      lcd.print("Lights: ");
      if(TL == 1){
        Serial.print("1;");
        lcd.print("On");
      }
      if(TL == 0){
        Serial.print("0;");
        lcd.print("Off");
      }
    } 
    else {
    }
    delay(50); //delay to avoid issues
  }
  //save button state
  LastTLButtonState = TLButtonState;
}
//announce station function
void announceStation(){
  if(IntStation == 0){
  }
  if(IntStation == 1){
    lcd.setCursor(0, 1);
    lcd.print("POPLAR");
  }
  if(IntStation == 2){
    lcd.setCursor(0, 1);
    lcd.print("CASTLE SHANNON");
  }
  if(IntStation == 3){
    lcd.setCursor(0, 1);
    lcd.print("DORMONT");
  }
  if(IntStation == 4){
    lcd.setCursor(0, 1);
    lcd.print("GLENBURY");
  }
  if(IntStation == 5){
    lcd.setCursor(0, 1);
    lcd.print("OVERBROOK");
  }
  if(IntStation == 6){
    lcd.setCursor(0, 1);
    lcd.print("INGLEWOOD");
  }
  if(IntStation == 7){
    lcd.setCursor(0, 1);
    lcd.print("CENTRAL");
  }
  if(IntStation == 8){
    lcd.setCursor(0, 1);
    lcd.print("SHADYSIDE");
  }
  if(IntStation == 9){
    lcd.setCursor(0, 1);
    lcd.print("HERRON AVE");
  }
  if(IntStation == 10){
    lcd.setCursor(0, 1);
    lcd.print("SWISSVALE");
  }
  if(IntStation == 11){
    lcd.setCursor(0, 1);
    lcd.print("PENN STATION");
  }
  if(IntStation == 12){
    lcd.setCursor(0, 1);
    lcd.print("STELL PLAZA");
  }
  if(IntStation == 13){
    lcd.setCursor(0, 1);
    lcd.print("FIRST AVE");
  }
  if(IntStation == 14){
    lcd.setCursor(0, 1);
    lcd.print("STATION SQUARE");
  }
  if(IntStation == 15){
    lcd.setCursor(0, 1);
    lcd.print("SOUTH HILLS JUNTION");
  }
  if(IntStation == 16){
    lcd.setCursor(0, 1);
    lcd.print("PIONEER");
  }
  if(IntStation == 17){
    lcd.setCursor(0, 1);
    lcd.print("EDGEBROOK");
  }
  if(IntStation == 18){
    lcd.setCursor(0, 1);
    lcd.print("MT LEBANON");
  }
  if(IntStation == 19){
    lcd.setCursor(0, 1);
    lcd.print("WHITED");
  }
  if(IntStation == 20){
    lcd.setCursor(0, 1);
    lcd.print("SOUTH BANK");
  }
  if(IntStation == 21){
    lcd.setCursor(0, 1);
    lcd.print("STATION");
  }
  //if(SPD == 0){//and if At_station = true
  //  if(EBR == false){
  //  lcd.setCursor(0, 1);
  //  lcd.print("Arrived At Station");
  //  }
}
//User Mode Command
void CDM()
{
  DMButtonState = digitalRead(Driver_Mode_button);
  if (DMButtonState != LastDMButtonState) {
    if (DMButtonState == LOW) {
      DM = not(DM);
      DMButton = true;
      lcd.setCursor(0, 1);
      lcd.print("User Mode: ");
      if(DM == 1){
        lcd.print("Engineer");
      }
      if(DM == 0){
        lcd.print("Driver");
      }
    } 
    else {
    }
    delay(50); //delay to avoid issues
  }
  //save button state
  LastDMButtonState = DMButtonState;
}

void CAM()
{
  AMButtonState = digitalRead(Automatic_Mode_button);
  if (AMButtonState != LastAMButtonState) {
    if (AMButtonState == LOW) {
      AM = not(AM);
      AMButton = true;
      lcd.setCursor(0,1);
      lcd.print("Control Mode: ");
      if(AM == 1){
        lcd.print("Automatic");
      }
      if(AM == 0){
        lcd.print("Manual");
      }
    } 
    else {
    }
    delay(50); //delay to avoid issues
  }
  //save button state
  LastAMButtonState = AMButtonState;
}
