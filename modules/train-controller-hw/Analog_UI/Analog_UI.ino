
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

//avoid Pins 7 and 13
//incoming from Train Module
//Place Holders

int err;
int cumErr;

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
int KP = 25000; 
int KPButtonState_Up = 0;
int LastKPButtonState_Up = 0;
int KPButtonState_Down = 0; 
int LastKPButtonState_Down = 0;
bool KPButton = false;

//KI Variables
int KI = 0; 
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

//Tunnel Light Variables
bool DM = false;
int DMButtonState = 0; 
int LastDMButtonState = 0;
bool DMButton = false;

//A/M Variables
bool AM = false;
int AMButtonState = 0; 
int LastAMButtonState = 0;
bool AMButton = false;

int CMDSpd, ACTSpd;

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
  pinMode( Automatic_Mode_button, INPUT_PULLUP);
  CMDSpd = 0;
  ACTSpd = 0;
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
   if(SPDButton){
      announceStation();
       SPDButton = false;
       delay(50);
   }
   if(TMPButton){
      TMPButton = false;
      delay(50);
   }
  if(KPButton){
      KPButton = false;
      delay(50);
   }
   if(KIButton){
      KIButton = false;
      delay(50);
   }
   if(EBRButton){
    EBRButton = false;
    delay(50);
   }
   if(HBRButton){
    HBRButton = false;
    delay(50);
   }
   if(LDRButton){
    LDRButton = false;
    delay(50);
   }
   if(RDRButton){
    RDRButton = false;
    delay(50);
   }
   if(TLButton){
    TLButton = false;
    delay(50);
   }
   if(DMButton){
    DMButton = false;
    delay(50);
   }
   if(AMButton){
    AMButton = false;
    delay(50);
   }
   lcd.clear();
   lcd.print("CMD: ");
   lcd.print(CMDSpd);
   lcd.print(" ACT: ");
   lcd.print(ACTSpd);
   delay(50);
}


//Speed Up
void CSPDUp()
{
  if(DM == false){
  SPDButtonState_Up = digitalRead(Speed_Up_button);
  if (SPDButtonState_Up != LastSPDButtonState_Up) {
    if (SPDButtonState_Up == LOW) {
      if(SPD < 44){
        SPD++;
      }
      SPDButton = true;
      lcd.setCursor(0, 1);
      lcd.print("Speed: ");
      lcd.print(SPD);
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
      if(SPD > 0){
        SPD--;
      }
      SPDButton = true;
      lcd.setCursor(0, 1);
      lcd.print("Speed: ");
      lcd.print(SPD);
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
void calcPower(int cmdSpd, int actSpd){
  err = cmdSpd - actSpd;
  cumErr = cumErr + err;
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
      lcd.print(";");
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
    } 
    else {
    }
    delay(200); //delay to avoid issues
  }
  //save button state
  LastTMPButtonState_Down = TMPButtonState_Down;
}

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

void announceStation(){
  if(SPD == 0){
    if(EBR == false){
    lcd.setCursor(0, 1);
    lcd.print("Arrived At Station");
    }
  }
}

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
