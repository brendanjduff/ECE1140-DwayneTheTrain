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
        grade: 0 // As a fraction
      },
      outputs: {
        distance: 0, // m
        passengers: 0,
        maxBoardingPax: 0,
        deboardingPax: 0
      }
    }
    this.thru = {
      speedCmd: 0, // m/s
      authorityCmd: 0, // blocks
      station: '',
      rightPlatform: false,
      leftPlatform: false,
      underground: false
    }
    this.phys = {
      grade: 0 // As a fraction
    }
    this.stopping = {
      time: 0,
      duration: 15, // seconds
      boarded: false
    }
  }

  // Load information received from the track model during clock cycle 1
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

  // Process inputs from the track model
  procTrackInputs () {
    this.phys.grade = this.trackIntf.inputs.grade
    // If signal pickup failure, will not read commanded speed or authority
    if (this.state.signalPickup) {
      this.thru.speedCmd = this.trackIntf.inputs.speedCmd
      this.thru.authorityCmd = this.trackIntf.inputs.authorityCmd
    }
    this.thru.station = this.trackIntf.inputs.station
    this.thru.rightPlatform = this.trackIntf.inputs.rightPlatform
    this.thru.leftPlatform = this.trackIntf.inputs.leftPlatform
    this.thru.underground = this.trackIntf.inputs.underground
  }

  // Process outputs that will be sent to train controller
  procControlOutputs () {
    this.controllerIntf.outputs.velocity = this.state.velocity
    // If at station, send commanded speed of zero until the train has stopped for 15 seconds
    if (this.thru.station && this.stopping.time < this.stopping.duration) {
      this.controllerIntf.outputs.speedCmd = 0
    } else {
      this.controllerIntf.outputs.speedCmd = this.thru.speedCmd
    }
    this.controllerIntf.outputs.authorityCmd = this.thru.authorityCmd
    this.controllerIntf.outputs.station = this.thru.station
    this.controllerIntf.outputs.rightPlatform = this.thru.rightPlatform
    this.controllerIntf.outputs.leftPlatform = this.thru.leftPlatform
    this.controllerIntf.outputs.underground = this.thru.underground
    this.controllerIntf.outputs.engineFailure = !this.state.engineStatus
    this.controllerIntf.outputs.brakeFailure = !this.state.brakeStatus
    this.controllerIntf.outputs.signalFailure = !this.state.signalPickup
  }

  // Create output object for message to train controllers
  getControlOutputs () {
    const out = this.controllerIntf.outputs
    out.id = this.trainId
    return out
  }

  // Load information received from the train controller during clock cycle 1
  receiveControlInput (data) {
    this.controllerIntf.inputs.powerCmd = data.powerCmd
    this.controllerIntf.inputs.emergencyBrake = data.emergencyBrake
    this.controllerIntf.inputs.serviceBrake = data.serviceBrake
    this.controllerIntf.inputs.leftDoors = data.leftDoors
    this.controllerIntf.inputs.rightDoors = data.rightDoors
    this.controllerIntf.inputs.lights = data.lights
    this.controllerIntf.inputs.temperature = data.temperature
  }

  // Process inputs from the train controller and from user
  procControlAndUserInputs () {
    this.state.powerCmd = this.controllerIntf.inputs.powerCmd
    // Emergency brake may also be activated by the passenger
    this.state.emergencyBrake = this.controllerIntf.inputs.emergencyBrake || this.user.emergencyBrake
    this.state.serviceBrake = this.controllerIntf.inputs.serviceBrake
    this.state.leftDoors = this.controllerIntf.inputs.leftDoors
    this.state.rightDoors = this.controllerIntf.inputs.rightDoors
    this.state.lights = this.controllerIntf.inputs.lights
    this.state.temperature = this.controllerIntf.inputs.temperature
    // Controlled by Murphy
    this.state.engineStatus = !this.user.engineFailure
    this.state.brakeStatus = !this.user.brakeFailure
    this.state.signalPickup = !this.user.signalFailure
  }

  // Process physics so that the train goes
  updatePhysics (dt) {
    const lastA = this.state.acceleration
    const lastV = this.state.velocity
    
    // Decelerate at constant rate
    if (this.state.emergencyBrake && this.state.brakeStatus) {
      this.state.acceleration = this.vehicle.ebrakeAcc
      this.state.power = 0
    } else if (this.state.serviceBrake && this.state.brakeStatus) {
      this.state.acceleration = this.vehicle.sbrakeAcc
      this.state.power = 0
    } else {
      if (this.state.engineStatus) {
        // power ramp and restrict to maximum
        this.state.power = Math.min(this.state.power + ((this.vehicle.maxPower * dt) / motorStartingTime), this.state.powerCmd, this.vehicle.maxPower)
      } else { 
        // if engine failure, power is zero
        this.state.power = 0
      }

      // Intermediate physics values
      const mass = this.vehicle.mass + (paxMass * (this.state.passengers + this.state.crew))
      const N = mass * g // normal force
      const maxTractiveEffort = u * N // Max force due to friction between wheels and steel rails
      const motorForce = this.state.power / Math.max(lastV, 1) // Prevent near infinite acceleration when starting from stop
      const rollingFriction = Crr * N
      const gradeResistance = this.phys.grade * N
      const Af = this.vehicle.width * this.vehicle.height
      const fAero = 0.5 * rho * Cd * Af * lastV * lastV // Aerodynamic drag
      const resistiveForce = rollingFriction + gradeResistance + fAero // Rolling friction, aerodynamic drag, and grade
      const totalForce = Math.min(motorForce, maxTractiveEffort) - resistiveForce

      // Calculate accelleration
      this.state.acceleration = Math.min(totalForce / mass, this.vehicle.maxAcc)
    }
    if (this.state.velocity < 1e-5 && this.state.acceleration < 0) {
      this.state.acceleration = 0
    }
    // Calculate velocity
    this.state.velocity = Math.max(Math.min(lastV + (dt / 2) * (this.state.acceleration + lastA), this.vehicle.maxVel), 0)
    if (this.state.velocity >= this.vehicle.maxVel - 1e-5) {
      this.state.acceleration = 0
    }
  }

  // Process outputs that will be sent to track model
  procTrackOutputs (dt) {
    this.trackIntf.outputs.distance = this.state.velocity * dt
    this.trackIntf.outputs.passengers = this.state.passengers

    // generate random deboardingPax if there are passengers on board and
    if (this.trackIntf.outputs.maxBoardingPax === 0 && this.trackIntf.outputs.deboardingPax === 0 && this.state.passengers > 0) {
      this.trackIntf.outputs.deboardingPax = Math.floor(Math.random() * this.state.passengers)
    }

    // manage stopping
    if ((this.thru.station && this.state.velocity > 0 && this.stopping.time < this.stopping.duration) || !this.thru.station) {
      this.stopping.time = 0
    } else if (this.state.velocity < 1e-5) {
      this.stopping.time += dt
    }

    // manage stopping
    if ((this.thru.station && this.state.velocity > 0 && this.stopping.time < this.stopping.duration) || !this.thru.station) {
      this.stopping.time = 0
      this.stopping.boarded = false
    } else if (this.state.velocity < 1e-5) {
      this.stopping.time += dt
    }

    // if stopped and doors and platforms match, then passengers can board and send max to track model
    if (((this.thru.leftPlatform && this.state.leftDoors) || (this.thru.rightPlatform && this.state.rightDoors)) && this.state.velocity === 0 && !this.stopping.boarded) {
      this.trackIntf.outputs.maxBoardingPax = this.vehicle.paxCap - this.state.passengers + this.trackIntf.outputs.deboardingPax
    } else {
      this.trackIntf.outputs.maxBoardingPax = 0
    }

    // if passengers received,
    if (this.trackIntf.inputs.boardingPax > 0) {
      this.state.passengers = Math.min(this.state.passengers - this.trackIntf.outputs.deboardingPax + this.trackIntf.inputs.boardingPax, this.vehicle.paxCap)
      this.trackIntf.outputs.deboardingPax = 0
      this.trackIntf.outputs.maxBoardingPax = 0
      this.stopping.boarded = true
    }
  }

  // Create output object for message to track model
  getTrackOutputs () {
    const out = this.trackIntf.outputs
    out.id = this.trainId
    return out
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
