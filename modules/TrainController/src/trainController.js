export default class TrainController {
  constructor (id) {
    // Input Variables
    this.id = id
    this.cmdSpeed = 0
    this.mphCmd = 0
    this.actSpeed = 0
    this.mphAct = 0
    this.authority = 0
    this.kP = 10000
    this.kI = 0
    this.temp = 70
    this.speed = 0
    this.mphSpeed = 0
    this.engine = false
    this.brakes = false
    this.signal = false
    this.rightP = false
    this.leftP = false
    this.underG = false
    this.eBrake = false
    this.sBrake = false
    this.lights = false
    this.leftD = false
    this.rightD = false
    this.automatic = false
    this.location = 'Location'
    // Calculated Variables
    this.cumErr = 0
    this.err = 0
    this.power = 0
  }

  //Getters
  /*
  getEngine () {
    return this.engine
  }
  getBrakes () {
    return this.brakes
  }
  getSignal () {
    return this.signal
  } 
  */

  // UI Functions
  // Increase speed
  spdUp () {
    this.mphSpeed = Math.floor(this.mphSpeed + 1)
    if (this.mphSpeed > 43) {
      this.mphSpeed = 43
    }
    else if (this.mphSpeed > this.msToMph(this.cmdSpeed)) {
      this.mphSpeed = this.msToMph(this.cmdSpeed)
    }
    this.speed = this.mphToMs(this.mphSpeed)
    // console.log(this.speed)
    return this.mphSpeed
  }

  // Decrease speed
  spdDown () {
    this.mphSpeed = Math.ceil(this.mphSpeed - 1)
    if (this.mphSpeed < 0) {
      this.mphSpeed = 0
    }
    this.speed = this.mphToMs(this.mphSpeed)
    // console.log(this.speed)
    return this.mphSpeed
  }

  // Emergency Brake
  emerBrake () {
    this.eBrake = !this.eBrake
    return this.eBrake
  }

  // Service Brake
  serBrake () {
    this.sBrake = !this.sBrake
    return this.sBrake
  }

  // Increase temperature
  tempUp () {
    this.temp = this.temp + 1
    if (this.temp > 80) {
      this.temp = 80
    }
    // console.log(this.temp)
    return this.temp
  }

  // Decrease temperature
  tempDown () {
    this.temp = this.temp - 1
    if (this.temp < 62) {
      this.temp = 62
    }
    // console.log(this.temp)
    return this.temp
  }

  // Turn lights on/off
  lightsOnOff (e) {
    // console.log("lights" + e)
    this.lights = e
    return this.lights
  }

  // Left door
  leftDoor (e) {
    // console.log("ldoor" + e)
    this.leftD = e
    return this.leftD
  }

  // Right door
  rightDoor (e) {
    // console.log("rdoor" + e)
    this.rightD = e
    return this.rightD
  }

  // Send location
  showLocation () {
    if (this.spd === 0 && this.eBrake === false) {
      return this.location
    }
  }

  // Engineer Only Functions
  // Increase Kp
  KpUp () {
    this.kP = this.kP + 1
    // console.log(this.kP)
    return this.kP
  }

  // Decrease Kp
  KpDown () {
    this.kP = this.kP - 1
    if (this.kP < 0) {
      this.kP = 0
    }
    // console.log(this.kP)
    return this.kP
  }

  // Increase Ki
  KiUp () {
    this.kI = this.kI + 1
    // console.log(this.kI)
    return this.kI
  }

  // Decrease Ki
  KiDown () {
    this.kI = this.kI - 1
    if (this.kI < 0) {
      this.kI = 0
    }
    // console.log(this.kI)
    return this.kI
  }

  // Tester Only Functions
  // Increase authority
  authorityUp () {
    this.authority = this.authority + 1
    return this.authority
  }

  // Decrease authority
  authorityDown () {
    this.authority = this.authority - 1
    if (this.authority < 0) {
      this.authority = 0
    }
    return this.authority
  }

  // Increase actual speed
  actSpeedUp () {
    this.mphAct = Math.floor(this.mphAct + 1)
    this.actSpeed = this.mphToMs(this.mphAct)
    return this.mphAct
  }

  // Decrease actual speed
  actSpeedDown () {
    this.mphAct = Math.ceil(this.mphAct - 1)
    if (this.mphAct < 0) {
      this.mphAct = 0
    }
    this.actSpeed = this.mphToMs(this.mphAct)
    return this.mphAct
  }

  // Increase commanded speed
  cmdSpeedUp () {
    this.mphCmd = Math.floor(this.mphCmd + 1)
    this.cmdSpeed = this.mphToMs(this.mphCmd)
    return this.mphCmd
  }

  // Decrease commanded speed
  cmdSpeedDown () {
    this.mphCmd = Math.ceil(this.mphCmd - 1)
    if (this.mphCmd < 0) {
      this.mphCmd = 0
    }
    this.cmdSpeed = this.mphToMs(this.mphCmd)
    return this.mphCmd
  }

  // Choose automatic
  automaticMode () {
    this.automatic = true
    return this.automatic
  }

  // Choose manual
  manualMode () {
    this.automatic = false
    return this.automatic
  }

  // Backend Functions
  //Right platform
  rightPlat () {
    if(this.automatic == true && this.rightP == true && this.actSpeed == 0) {
      this.rightD = true
    }
    else {
      this.rightD = false
    }
  }
  //Left platform
  leftPlat () {
    if(this.automatic == true && this.leftP == true && this.actSpeed == 0) {
      this.leftD = true
    }
    else {
      this.leftD = false
    }
  }
  //Underground
  underGround () {
    if(this.automatic == true && this.underG == true) {
      this.lights = true
    }
    else {
      this.lights = false
    }
  }
  //Stop when authoriy is 0
  stop () {
    if (this.automatic && (this.authority === 0 || this.cmdSpeed === 0)) {
      this.sBrake = true
      this.speed = 0
    }
  }
  //Convert
  msToMph (val) {
    return val * 2.2369
  }
  //Convert back
  mphToMs (val) {
    return val / 2.2369
  }
  // Power Calculation
  powerCalc (err, cumErr, cmdSpeed) {
    this.err = this.speed - this.actSpeed
    this.cumErr = this.cumErr + this.err
    // this.power = this.err * this.kP + this.cumErr * this.kI
    const trainMass = 40000
    const humanMass = 20000
    const massRange = trainMass - humanMass
    const powLOW = 0.5 * speed * (trainMass - massRange)
    const powHIGH = 0.5 * speed * (trainMass + massRange)
    if (this.err * this.kP + this.cumErr * this.kI < 480000) {
      this.power = this.err * this.kP + this.cumErr * this.kI
      if (powHIGH > this.power && powLOW < this.power) {
        return this.power
      }
    }
    if (this.err * this.kP + this.cumErr * this.kI > 480000) {
      this.power = 480000
      return this.power
    }
  }

  getMessage () {
    return {
      id: this.id,
      powerCmd: this.power,
      emergencyBrake: this.eBrake,
      serviceBrake: this.sBrake,
      leftDoors: this.leftD,
      rightDoors: this.rightD,
      lights: this.lights,
      temperature: this.temp
    }
  }
}
