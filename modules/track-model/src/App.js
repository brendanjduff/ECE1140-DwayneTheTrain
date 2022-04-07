import React from 'react'
import {Button,Modal} from 'react-bootstrap'

export default class App extends React.Component {
  render() { return(<div>
    <h1>{greenLine.name}</h1>
    <h2><Button size = "sm" variant="secondary" onClick = {()=> {demo1()}}>Start Demo A</Button>
    <Button size = "sm" variant="secondary" onClick = {()=> {demo2()}}>Start Demo B</Button>
    <Button size = "sm" variant="secondary" onClick = {()=> {resetBlocks()}}>Reset Occupancy</Button></h2>
    {greenBlocks.map((b)=><ReactBlock Block = {b} />)}
  </div>
  )}
  componentDidMount(){
    this.interval = setInterval(() => {this.forceUpdate()}, 50)
  }
  componentWillUnmount(){
    clearInterval(this.interval)
  }
}

class TrackLine {
  constructor(name){
    this.name = name;
  }
}

class Block{
  constructor(blockNum,length,grade,elevation,isBidirectional,speedLimit){
    this.blockNum = blockNum;
    this.length = length;
    this.grade = grade;
    this.elevation = elevation;
    this.isBidirecitonal = isBidirectional;
    this.speedLimit = speedLimit;

    this.isOpen = true;
    this.isOccupied = false;
    this.hasSwitch = false;
    this.hasStation = false;
    this.hasCrossing = false;
    this.hasTrafficLight = false;
    this.railBroken = false;
    this.circuitBroken = false;
    this.hasPower = true;
    this.heaterStatus = false;
  }
  toggleStatus(){
    this.isOpen = !this.isOpen;
  }
  toggleOccupation(){
    this.isOccupied = !this.isOccupied;
  }
  resetOccupation(){
    this.isOccupied = false;
  }
  toggleRail(){
    this.railBroken = !this.railBroken;
  }
  toggleCircuit(){
    this.circuitBroken = !this.circuitBroken;
  }
  togglePower(){
    this.hasPower = !this.hasPower;
  }
  toggleHeater(){
    this.heaterStatus = !this.heaterStatus;
  }
}
class ReactBlock extends React.Component{
  constructor(props){
    super(props)
    this.state = {show:false}

    this.handleClose = this.handleClose.bind(this)
    this.handleShow = this.handleShow.bind(this)

  }
  
  handleClose(){
    this.setState({show:false})
  }
  handleShow(){
    this.setState({show:true})
  }

  render(){
    return(
      <>
      <Button size = "sm" variant={this.props.Block.isOccupied ? "primary" : "secondary"} onClick = {this.handleShow}>{this.props.Block.blockNum}</Button>
      <Modal show={this.state.show} onHide={this.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Block {this.props.Block.blockNum}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Grade: {this.props.Block.grade}   |   Switch: {this.props.Block.hasSwitch ? "Yes" : "No"}<br/>
          Elevation: {this.props.Block.elevation}   |   Station: {this.props.Block.hasStation ? "Yes" : "No"}<br/>
          Length: {this.props.Block.length}   |   Crossing: {this.props.Block.hasCrossing ? "Yes" : "No"}<br/>
          Speed Limit: {this.props.Block.speedLimit}<br/>
          Bidirectional?: {this.props.Block.isBidirecitonal ? "Yes" : "No"}<br/>
          <br/>
          Status: {this.props.Block.isOpen ? "Open" : "Closed"}<br/>
          Occupancy: {this.props.Block.isOccupied ? "Occupied" : "Unoccupied"}<br/>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      </>
    )
  
  }
}

class Switch {
  constructor(position,source,op1,op2,beaconM){
    this.position = position;
    this.source = source;
    this.op1 = op1;
    this.op2 = op2;
    this.beaconM = beaconM
  }
  togglePosition(){
    this.position = !this.position;
    // if(position === false){
    //   return this.op1;
    // }
    // else{
    //   return this.op2;
    // }
  }
}
function sendBeacon(blockI){
  return blockI.beaconM
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function traverseBlocks(i, max, min, direction, delay) {
  console.log('Time: ' + Date.now() + ' Current iteration: ' + i)
  sleep(delay).then(() => {
    if(i !== blueSwitch.op1 || i !== blueSwitch.op2){
      greenBlocks[i].toggleOccupation()
      greenBlocks[i-1].toggleOccupation()
    }
    else{
      greenBlocks[i].toggleOccupation()
      greenBlocks[blueSwitch.source].toggleOccupation()
    }
    
    if(direction) {
      if(greenBlocks[i].hasSwitch === true){
        if(blueSwitch.position === false){
          i = blueSwitch.op1
        }
        else{
          i = blueSwitch.op2
        }
      }    
      else {
        i += 1
      }
    }
    else {
      if(i === blueSwitch.op1 || i === blueSwitch.op2){
        i = blueSwitch.source
      }
      else{
        i -= 1
      }
    }

    if(i > max || i < min)
      return;
    else traverseBlocks(i, max, min, direction,delay)})
}

function resetBlocks(){
  for(let i = 0; i < greenBlocks.size(); i++){
    greenBlocks[i].resetOccupation();
  }
}
function parseCSV(input) {
  var rows = input.split(/\r?\n/);
  var keys = rows.shift().split(",");
  return rows.map(function(row) {
      return row.split(",").reduce(function(map, val, i) {
          map[keys[i]] = val;
          return map;
      }, {});
  });
}
//=====================================================================================================
//console.log(parseCSV('D:/Documents/CodingPortfolio/electron-project-setup/my-app/csvtester.csv'))

var greenLine = new TrackLine('Green Line');
var greenBlocks = [];


for(let i = 0; i<151; i++){
  greenBlocks[i] = new Block(i,50,0,0,true,30)
}

greenBlocks[12].hasSwitch = true
var switch12 = new Switch(false,12,1,13)
greenBlocks[29].hasSwitch = true
var switch29 = new Switch(false,29,30,150)
greenBlocks[58].hasSwitch = true
var switch58 = new Switch(false,57,0,62)
greenBlocks[62].hasSwitch = true
var switch62 = new Switch(false,62,0,63)
greenBlocks[76].hasSwitch = true
var switch76 = new Switch(false,76,77,101)
greenBlocks[85].hasSwitch = true
var switch85 = new Switch(false,85,86,100)

greenBlocks[2].hasStation = true
greenBlocks[9].hasStation = true
greenBlocks[22].hasStation = true
greenBlocks[31].hasStation = true
greenBlocks[39].hasStation = true
greenBlocks[48].hasStation = true
greenBlocks[57].hasStation = true
greenBlocks[65].hasStation = true
greenBlocks[73].hasStation = true
greenBlocks[77].hasStation = true
greenBlocks[88].hasStation = true
greenBlocks[96].hasStation = true
greenBlocks[105].hasStation = true
greenBlocks[114].hasStation = true
greenBlocks[123].hasStation = true
greenBlocks[132].hasStation = true
greenBlocks[141].hasStation = true
// for(let i = 0; i<16; i++){
//   greenBlocks[i] = new Block(i,50,0,0,true,50);
//   if(i === 5){
//     greenBlocks[i].hasSwitch = true;
//   }
//   if(i === 10 || i === 15){
//     greenBlocks[i].hasStation = true;
//   }
// }

function demo1() {
  console.log("Demo A has begun")
  //yard to station B and back
  greenBlocks[0].toggleOccupation();
  console.log('yard occupied')
  traverseBlocks(1,10,0,true,1000)
  sleep(12000).then(()=> {traverseBlocks(10,10,1,false,1000)})
}

function demo2(){
  console.log("Demo B has begun")
  // //yard to station c and back
  blueSwitch.togglePosition();
  traverseBlocks(1,15,0,true,1000)
  sleep(12000).then(()=>{traverseBlocks(15,15,0,false,1000)})
}