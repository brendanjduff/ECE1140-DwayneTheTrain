export default class Block {
  constructor (num) {
    this.blockNum = num
    this.isOccupied = false
    this.inMaintenance = false
  }

  updateOccupancy () { 
    this.isOccupied = !(this.isOccupied)
  }

  updateMaintenance () { 
    this.inMaintenance = !(this.inMaintenance)
  }
}