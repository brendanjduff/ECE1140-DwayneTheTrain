export default class TrainModel {
  constructor (id) {
    this.trainId = id
    this.vehicle = blackpoolFlexity2
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
      crew: 2,
      passengers: 0
    }
    this.user = {
      engineFailure: false, // true: failure
      brakeFailure: false, // true: failure
      signalFailure: false, // true: failure
      emergencyBrake: false
    }
    this.ctrllr = {
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
        underground: false
      }
    }
    this.track = {
      inputs: {
        boardingPax: 0,
        speedCmd: 0,
        authorityCmd: 0,
        station: '',
        rightPlatform: false,
        leftPlatform: false,
        underground: false
      },
      outputs: {
        distance: 0,
        maxBoardingPax: 222,
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
  }

  update (dt) {
    this.procInputs()
    this.physics(dt)
    this.procOutputs(dt)
  }

  procInputs () {
    // Read inputs from train controller
    this.state.powerCmd = this.ctrllr.inputs.powerCmd
    this.state.emergencyBrake = this.ctrllr.inputs.emergencyBrake || this.user.emergencyBrake
    this.state.serviceBrake = this.ctrllr.inputs.serviceBrake
    this.state.leftDoors = this.ctrllr.inputs.leftDoors
    this.state.rightDoors = this.ctrllr.inputs.rightDoors
    this.state.lights = this.ctrllr.inputs.lights
    this.state.temperature = this.ctrllr.inputs.temperature

    // Read inputs from track model
    if (this.state.signalPickup) {
      this.thru.speedCmd = this.track.inputs.speedCmd
      this.thru.authorityCmd = this.track.inputs.authorityCmd
    }
    this.thru.station = this.track.inputs.station
    this.thru.rightPlatform = this.track.inputs.rightPlatform
    this.thru.leftPlatform = this.track.inputs.leftPlatform
    this.thru.underground = this.track.inputs.underground

    // Read inputs from user
    this.state.engineStatus = !this.user.engineFailure
    this.state.brakeStatus = !this.user.brakeFailure
    this.state.signalPickup = !this.user.signalFailure
  }

  physics (dt) {
    const lastA = this.state.acceleration
    const lastV = this.state.velocity

    if (this.state.engineStatus && !this.state.emergencyBrake && !this.state.serviceBrake) {
      this.state.power = Math.min(this.state.power + ((this.vehicle.maxPower * dt) / motorStartingTime), this.state.powerCmd, this.vehicle.maxPower)
    } else {
      this.state.power = 0
    }

    if (this.state.emergencyBrake && this.state.brakeStatus) {
      this.state.acceleration = this.vehicle.ebrakeAcc
    } else if (this.state.serviceBrake && this.state.brakeStatus) {
      this.state.acceleration = this.vehicle.sbrakeAcc
    } else {
      const Af = this.vehicle.width * this.vehicle.height
      const fAero = 0.5 * rho * Cd * Af * lastV * lastV
      const mass = this.vehicle.mass + (paxMass * (this.state.passengers + this.state.crew))
      const fFriction = mu * mass
      this.state.acceleration = /* Math.min( */(((this.state.power / Math.max(lastV, 1)) - fAero - fFriction) / (mass))/*, /*this.vehicle.maxAcc) */
    }
    this.state.velocity = Math.max(/* Math.min( */lastV + (dt / 2) * (this.state.acceleration + lastA)/*, this.vehicle.maxVel) */, 0)
  }

  procOutputs (dt) {
    // Write outputs to train controller
    this.ctrllr.outputs.velocity = this.state.velocity
    this.ctrllr.outputs.speedCmd = this.thru.speedCmd
    this.ctrllr.outputs.authorityCmd = this.thru.authorityCmd
    this.ctrllr.outputs.station = this.thru.station
    this.ctrllr.outputs.rightPlatform = this.thru.rightPlatform
    this.ctrllr.outputs.leftPlatform = this.thru.leftPlatform
    this.ctrllr.outputs.underground = this.thru.underground

    // Write outputs to track model
    this.track.outputs.distance = this.state.velocity * dt
  }

  procPassengers () {
    if (((this.thru.leftPlatform && this.state.leftDoors) || (this.thru.rightPlatform && this.state.rightDoors)) && this.state.velocity === 0) {
      this.state.passengers = Math.min(this.state.passengers - this.track.outputs.deboardingPax + this.track.inputs.boardingPax, this.vehicle.paxCap)
      this.track.outputs.deboardingPax = Math.floor(Math.random() * this.state.passengers)
      this.track.outputs.maxBoardingPax = this.vehicle.paxCap - this.state.passengers + this.track.outputs.deboardingPax
    }
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

const Cd = 1.8
const rho = 1.225 // kg/m^3
const motorStartingTime = 4 // seconds to reach full power
const paxMass = 80 // kg
const mu = 0.5 // coefficient of friction between steel wheels and rails
