export default class TrainModel {
  constructor (id, hw) {
    this.trainId = id
    this.vehicle = blackpoolFlexity2
    this.hardware = hw
    this.state = {
      velocity: 0, // m/s
      acceleration: 0, // m/s^2
      power: 0, // W
      powerCmd: 0, // W
      emergencyBrake: false,
      serviceBrake: false,
      leftDoors: false, // {open, closed}
      rightDoors: false, // {open, closed}
      lights: false, // {on, off}
      temperature: 68, // °Fahrenheit
      engineStatus: true, // false: failure
      brakeStatus: true, // false: failure
      signalPickup: true, // false: failure
      crew: 5,
      passengers: 0
    }
    this.user = {
      engineFailure: false, // true: failure
      brakeFailure: false, // true: failure
      signalFailure: false, // true: failure
      emergencyBrake: false
    }
    this.controllerIntf = {
      inputs: {
        powerCmd: 0, // W
        emergencyBrake: false,
        serviceBrake: false,
        leftDoors: false, // {open, closed}
        rightDoors: false, // {open, closed}
        lights: false, // {on, off}
        temperature: 68 // °Fahrenheit
      },
      outputs: {
        velocity: 0, // m/s
        speedCmd: 0, // m/s
        authorityCmd: 0, // blocks
        station: '',
        rightPlatform: false,
        leftPlatform: false,
        underground: false,
        engineFailure: false, // true: failure
        brakeFailure: false, // true: failure
        signalFailure: false // true: failure
      }
    }
    this.trackIntf = {
      inputs: {
        boardingPax: 0,
        speedCmd: 0,
        authorityCmd: 0,
        station: '',
        rightPlatform: false,
        leftPlatform: false,
        underground: false,
        grade: 0
      },
      outputs: {
        distance: 0,
        passengers: 0,
        maxBoardingPax: 0,
        deboardingPax: 0
      }
    }
    this.thru = {
      speedCmd: 0,
      authorityCmd: 0,
      station: '',
      rightPlatform: false,
      leftPlatform: false,
      underground: false
    }
    this.phys = {
      grade: 0
    }
  }

  receiveTrackInput (data) {
    this.trackIntf.inputs.speedCmd = data.speedCmd
    this.trackIntf.inputs.authorityCmd = data.authorityCmd
    this.trackIntf.inputs.station = data.station
    this.trackIntf.inputs.rightPlatform = data.rightPlatform
    this.trackIntf.inputs.leftPlatform = data.leftPlatform
    this.trackIntf.inputs.underground = data.underground
    this.trackIntf.inputs.grade = data.grade
    this.trackIntf.inputs.boardingPax = data.boardingPax
  }

  procTrackInputs () {
    // Read inputs from track model
    this.phys.grade = this.trackIntf.inputs.grade
    if (this.state.signalPickup) {
      this.thru.speedCmd = this.trackIntf.inputs.speedCmd
      this.thru.authorityCmd = this.trackIntf.inputs.authorityCmd
    }
    this.thru.station = this.trackIntf.inputs.station
    this.thru.rightPlatform = this.trackIntf.inputs.rightPlatform
    this.thru.leftPlatform = this.trackIntf.inputs.leftPlatform
    this.thru.underground = this.trackIntf.inputs.underground
  }

  procControlOutputs () {
    this.controllerIntf.outputs.velocity = this.state.velocity
    this.controllerIntf.outputs.speedCmd = this.thru.speedCmd
    this.controllerIntf.outputs.authorityCmd = this.thru.authorityCmd
    this.controllerIntf.outputs.station = this.thru.station
    this.controllerIntf.outputs.rightPlatform = this.thru.rightPlatform
    this.controllerIntf.outputs.leftPlatform = this.thru.leftPlatform
    this.controllerIntf.outputs.underground = this.thru.underground
    this.controllerIntf.outputs.engineFailure = !this.state.engineStatus
    this.controllerIntf.outputs.brakeFailure = !this.state.brakeStatus
    this.controllerIntf.outputs.signalFailure = !this.state.signalPickup
  }

  getControlOutputs () {
    const out = this.controllerIntf.outputs
    out.id = this.trainId
    return out
  }

  receiveControlInput (data) {
    this.controllerIntf.inputs.powerCmd = data.powerCmd
    this.controllerIntf.inputs.emergencyBrake = data.emergencyBrake
    this.controllerIntf.inputs.serviceBrake = data.serviceBrake
    this.controllerIntf.inputs.leftDoors = data.leftDoors
    this.controllerIntf.inputs.rightDoors = data.rightDoors
    this.controllerIntf.inputs.lights = data.lights
    this.controllerIntf.inputs.temperature = data.temperature
  }

  procControlAndUserInputs () {
    // Read inputs from train controller
    this.state.powerCmd = this.controllerIntf.inputs.powerCmd
    this.state.emergencyBrake = this.controllerIntf.inputs.emergencyBrake || this.user.emergencyBrake
    this.state.serviceBrake = this.controllerIntf.inputs.serviceBrake
    this.state.leftDoors = this.controllerIntf.inputs.leftDoors
    this.state.rightDoors = this.controllerIntf.inputs.rightDoors
    this.state.lights = this.controllerIntf.inputs.lights
    this.state.temperature = this.controllerIntf.inputs.temperature

    // Read inputs from user
    this.state.engineStatus = !this.user.engineFailure
    this.state.brakeStatus = !this.user.brakeFailure
    this.state.signalPickup = !this.user.signalFailure
  }

  updatePhysics (dt) {
    const lastA = this.state.acceleration
    const lastV = this.state.velocity

    if (this.state.emergencyBrake && this.state.brakeStatus) {
      this.state.acceleration = this.vehicle.ebrakeAcc
      this.state.power = 0
    } else if (this.state.serviceBrake && this.state.brakeStatus) {
      this.state.acceleration = this.vehicle.sbrakeAcc
      this.state.power = 0
    } else {
      if (this.state.engineStatus) {
        this.state.power = Math.min(this.state.power + ((this.vehicle.maxPower * dt) / motorStartingTime), this.state.powerCmd, this.vehicle.maxPower)
      } else {
        this.state.power = 0
      }

      const mass = this.vehicle.mass + (paxMass * (this.state.passengers + this.state.crew))
      const N = mass * g // normal force
      const maxTractiveEffort = u * N
      const motorForce = this.state.power / Math.max(lastV, 1)
      const rollingFriction = Crr * N
      const gradeResistance = this.phys.grade * N
      const Af = this.vehicle.width * this.vehicle.height
      const fAero = 0.5 * rho * Cd * Af * lastV * lastV
      const resistiveForce = rollingFriction + gradeResistance + fAero
      const totalForce = Math.min(motorForce, maxTractiveEffort) - resistiveForce

      this.state.acceleration = Math.min(totalForce / mass, this.vehicle.maxAcc)
    }
    if (this.state.velocity < 1e-5 && this.state.acceleration < 0) {
      this.state.acceleration = 0
    }
    this.state.velocity = Math.max(Math.min(lastV + (dt / 2) * (this.state.acceleration + lastA), this.vehicle.maxVel), 0)
    if (this.state.velocity >= this.vehicle.maxVel - 1e-5) {
      this.state.acceleration = 0
    }
  }

  procTrackOutputs (dt) {
    this.trackIntf.outputs.distance = this.state.velocity * dt
    this.trackIntf.outputs.passengers = this.state.passengers

    // generate random deboardingPax if there are passengers on board and 
    if(this.trackIntf.outputs.maxBoardingPax === 0 && this.trackIntf.outputs.deboardingPax === 0 && this.state.passengers > 0) {
      this.trackIntf.outputs.deboardingPax = Math.floor(Math.random() * this.state.passengers)
    }

    // if stopped and doors and platforms match, then passengers can board and send max to track model
    if (((this.thru.leftPlatform && this.state.leftDoors) || (this.thru.rightPlatform && this.state.rightDoors)) && this.state.velocity === 0) {
      this.trackIntf.outputs.maxBoardingPax = this.vehicle.paxCap - this.state.passengers + this.trackIntf.outputs.deboardingPax
    } else {
      this.trackIntf.outputs.maxBoardingPax = 0
    }

    // if passengers received, 
    if (this.trackIntf.inputs.boardingPax > 0) {
      this.state.passengers = Math.min(this.state.passengers - this.trackIntf.outputs.deboardingPax + this.trackIntf.inputs.boardingPax, this.vehicle.paxCap)
      this.trackIntf.outputs.deboardingPax = 0
      this.trackIntf.outputs.maxBoardingPax = 0
    }
  }

  getTrackOutputs () {
    const out = this.trackIntf.outputs
    out.id = this.trainId
    return out
  }

  testUpdate (dt) {
    this.procTrackInputs()
    this.procControlOutputs()
    this.procControlAndUserInputs()
    this.updatePhysics(dt)
    this.procTrackOutputs(dt)
  }
}

const blackpoolFlexity2 = {
  name: 'Flexity 2 (Blackpool)',
  length: 32.2, // m
  height: 3.42, // m
  width: 2.65, // m
  mass: 40900, // kg
  maxVel: 19.44, // m/s // remove?
  maxAcc: 1, // m/s^2 (assume double med acc. of 0.5) // remove?
  ebrakeAcc: -2.73, // m/s^2
  sbrakeAcc: -1.2, // m/s^2
  maxPower: 480000, // W
  paxCap: 222
}

// Constants used in physics calculations
const paxMass = 80 // kg
const g = 9.81 // m/s^2
const motorStartingTime = 4 // seconds to reach full power
const Crr = 0.0016 // Rolling resistance coefficient
const Cd = 1.8 // drag coefficient for train
const rho = 1.225 // density of air, kg/m^3
const u = 0.5 // coefficient of static friction between steel wheels and rails
