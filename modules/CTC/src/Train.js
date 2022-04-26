export default class Train {
  constructor () {
    this.trainID = 0
    this.greenLine = {
      speed: [],
      authority: []
    }
    this.redLine = {
      speed: [],
      authority: []
    }
    this.arrivalTimeHrs = 0
    this.arrivalTimeMinutes = 0
    this.departureTimeHrs = 0
    this.departureTimeMinutes = 0
    this.destination = ''
    this.blockNum = ''
    this.isDispatched = false
    this.line = true
  }

  calculateSpeedAuth () {
    const hour = this.arrivalTimeHrs - this.departureTimeHrs
    const min = this.arrivalTimeMinutes - this.departureTimeMinutes
    const sec = (hour * 3600) + (min * 60)
    let distance = 0

    switch (this.destination) { // make two arrays of all blocks, set each block  to 2 authority and speed limit
      case 'Shadyside':
        this.line = false
        break
      case 'Herron Ave':
        this.line = false
        break
      case 'Swissville':
        this.line = false
        break
      case 'Penn Station':
        this.line = false
        break
      case 'Steel Plaza':
        this.line = false
        break
      case 'First Ave':
        this.line = false
        break
      case 'Station Square':
        this.line = false
        break
      case 'South Hills Junction':
        this.line = false
        break
      case 'Pioneer':
        this.line = true
        break
      case 'Edgebrook':
        this.line = true
        break
      case 'Station':
        this.line = true
        break
      case 'Whited':
        this.line = true
        break
      case 'South Bank':
        this.line = true
        break
      case 'Central':
        this.line = true
        break
      case 'Inglewood':
        this.line = true
        break
      case 'Overbrook':
        this.line = true
        break
      case 'Glenbury':
        this.line = true
        break
      case 'Dormont':
        this.line = true
        break
      case 'Mt Lebanon':
        this.line = true
        break
      case 'Poplar':
        this.line = true
        break
      case 'Castle Shannon':
        this.line = true
        break
      default:
        distance = 0
    }

    // return speed and authority
    const interspeed = ((distance / sec) * 2.237).toFixed(3) // meters/s to miles/h
    if (interspeed <= 45) {
      // this.speed = 45
    } else {
      //
    }

    this.redLine.authority.fill(3)
    this.redLine.speed = [
      11.1, 11.1, 11.1, 11.1, 11.1, 4.5, 4.5, 4.5, 11.1, 11.1, 11.1, 11.1, 11.1, 11.1, 4.5, 4.5, 4.5, 19.4, 19.4, 4.5, 4.5, 4.5, 15.3, 4.5, 4.5, 4.5, 19.4, 19.4, 19.4, 19.4, 19.4, 19.4, 19.4, 4.5, 4.5, 4.5, 19.4, 19.4, 19.4, 19.4, 19.4, 19.4, 19.4, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5, 16.7, 15.3, 15.3, 15.3, 15.3, 15.3, 15.3, 15.3, 15.3, 4.5, 4.5, 4.5, 15.3, 15.3, 15.3, 15.3, 15.3, 15.3, 15.3, 15.3, 15.3, 15.3, 15.3, 15.3, 15.3, 15.3, 15.3
    ]
    this.greenLine.authority.fill(3)
    this.greenLine.speed = [
      4.5, 4.5, 4.5, 12.5, 12.5, 12.5, 12.5, 4.5, 4.5, 4.5, 12.5, 12.5, 19.4, 19.4, 4.5, 4.5, 4.5, 16.7, 16.7, 16.7, 4.5, 4.5, 4.5, 19.4, 19.4, 19.4, 8.3, 8.3, 8.3, 4.5, 4.5, 4.5, 8.3, 8.3, 8.3, 8.3, 8.3, 4.5, 4.5, 4.5, 8.3, 8.3, 8.3, 8.3, 8.3, 8.3, 4.5, 4.5, 4.5, 8.3, 8.3, 8.3, 8.3, 8.3, 8.3, 4.5, 4.5, 4.5, 8.3, 8.3, 8.3, 8.3, 19.4, 4.5, 4.5, 4.5, 11.1, 11.1, 11.1, 11.1, 11.1, 4.5, 4.5, 4.5, 11.1, 4.5, 4.5, 4.5, 19.4, 19.4, 19.4, 19.4, 19.4, 19.4, 19.4, 6.9, 4.5, 4.5, 4.5, 6.9, 6.9, 6.9, 6.9, 6.9, 4.5, 4.5, 4.5, 6.9, 6.9, 6.9, 7.2, 7.8, 7.8, 4.5, 4.5, 4.5, 7.8, 7.8, 7.8, 8.3, 8.3, 8.3, 4.5, 4.5, 4.5, 8.3, 4.2, 4.2, 4.2, 4.2, 4.2, 4.5, 4.5, 4.5, 5.6, 5.6, 5.6, 5.6, 5.6, 5.6, 4.5, 4.5, 4.5, 5.6, 5.6, 5.6, 5.6, 5.6, 5.6, 4.5, 4.5, 4.5, 5.6, 5.6, 5.6, 5.6, 5.6, 5.6, 5.6, 5.6
    ]
  }
}
