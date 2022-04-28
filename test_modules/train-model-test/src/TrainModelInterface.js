import { mphToMs } from './UnitConversion'

export default class TrainModelInterface {
  constructor (id, hw) {
    this.trainId = id
    this.hw = hw
    this.trackIntf = {
      inputs: {
        id: id,
        boardingPax: 0,
        speedCmd: mphToMs(10),
        authorityCmd: 3,
        station: '',
        rightPlatform: false,
        leftPlatform: false,
        underground: false,
        grade: 0
      },
      outputs: {
        distance: 0,
        passengers: 0,
        maxBoardingPax: 222,
        deboardingPax: 0
      }
    }
    this.trainIntf = {
      inputs: {
        id: id,
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
        engineFailure: false,
        brakeFailure: false,
        signalFailure: false,
        station: '',
        rightPlatform: false,
        leftPlatform: false,
        underground: false
      }
    }
  }
}
