export default class Train {
  constructor (id) {
    this.trainID = id
    this.speed = 0
    this.authority = []
    this.arrivalTimeHrs = '00'
    this.arrivalTimeMinutes = '00'
    this.departureTimeHrs = '00'
    this.departureTimeMinutes = '00'
    this.destination = ''
    this.blockNum = ''
    this.isDispatched = false
  }

  calculateSpeedAuth () {
      let hour = this.arrivalTimeHrs - this.departureTimeHrs
      let min = this.arrivalTimeMinutes - this.departureTimeMinutes
      let sec = (hour*3600) + (min*60)
      let distance = 0
      let distroA = 0
      let distroB = 0
      let distroC = 0
      let distroD = 0
      
      switch(this.destination) {
          case 'Dormont':
              distance = 1350
              distroA = 0
              distroB = 0
              distroC = 6
              distroD = 5
              break
          default:
              distance = 0
      }

      // return speed and authority
      let interspeed = ((distance/sec) * 2.237).toFixed(3) // meters/s to miles/h
      if(interspeed <= 45) {
          this.speed = 45
      } else {
          this.speed = interspeed
      }
      this.authority = [distroA, distroB, distroC, distroD]
  }
}
