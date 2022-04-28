import React from 'react'
import {Button,Modal} from 'react-bootstrap'
import SmartTextInput from './SmartTextInput'
const { ipcRenderer } = window.require('electron')

export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = { ready: false }
  }
  
  componentDidMount () {
    ipcRenderer.on('fetchData', (event, arg) => {
      this.setState({ ready: arg.ready, greenLine: arg.greenLine, redLine: arg.redLine }
      )
    })
    this.intervalId = setInterval(() => { ipcRenderer.send('requestData') }, 50)
  }

  componentWillUnmount () {
    ipcRenderer.removeAllListeners('fetchData')
    clearInterval(this.intervalId)
  }
  
  render() { return(<div>
    <h1>{this.state.ready ? this.state.greenLine.name : ""}</h1>
    {this.state.ready ? this.state.greenLine.blocks.map((b)=><ReactBlock Block = {b} color = 'success' />) : ""}
    <h1>{this.state.ready ? this.state.redLine.name : ""}</h1>
    {this.state.ready ? this.state.redLine.blocks.map((b)=><ReactBlock Block = {b} color = 'danger'/>) : ""}
    <h2>Environment Temp: {this.state.ready? this.state.greenLine.envTemp : ""} ||| Heater: {this.state.ready ? this.state.greenLine.heaterStatus: ""}</h2>
    {this.state.ready ? <SmartTextInput default = {72} channel = 'EnvironmentTemp'/>: ""}
  </div>
  )}
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
      <Button size = "sm" variant={this.props.Block.isOccupied ? "primary" : this.props.color} onClick = {this.handleShow}>{this.props.Block.blockNum}</Button>
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
          Rail Status: {this.props.Block.railBroken ? "Broken" : "Functional"} |||
          Circuit Status: {this.props.Block.circuitBroken ? "Broken" : "Functional"} |||
          Power Status: {this.props.Block.hasPower ? "Powered" : "No Power"} <br/>
        </Modal.Body>
        <Modal.Footer>
          <Button variant={this.props.Block.railBroken ? "danger": "success" } onClick={() => { ipcRenderer.send('toggleRail',this.props.Block.blockNum) }}>
            Rail Status
          </Button>
          <Button variant={this.props.Block.circuitBroken? "danger": "success" } onClick={() => {ipcRenderer.send('toggleCircuit',this.props.Block.blockNum)}}>
            Circuit Status
          </Button>
          <Button variant={!this.props.Block.hasPower? "danger": "success" } onClick={() => {ipcRenderer.send('togglePower',this.props.Block.blockNum)}}>
            Power Status
          </Button>
          <Button variant="secondary" onClick={this.handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      </>
    )
  
  }
}