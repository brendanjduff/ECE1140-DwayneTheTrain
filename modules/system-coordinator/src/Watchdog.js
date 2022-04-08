import React from 'react'
import { Row, Col, Badge } from 'react-bootstrap'
const { ipcRenderer } = window.require('electron')

export default class Watchdog extends React.Component {
  constructor (props) {
    super(props)
    this.state = { modules: { trainModel: false } }
  }

  componentDidMount () {
    ipcRenderer.on('fetchWatchdog', (event, arg) => {
      this.setState({ modules: arg })
    })
    this.intervalId = setInterval(() => { ipcRenderer.send('requestWatchdog') }, 1000 / updateRate)
  }

  componentWillUnmount () {
    ipcRenderer.removeAllListeners('fetchWatchdog')
    clearInterval(this.intervalId)
  }

  render () {
    return (
      <>
        <Row>
          <Col><h4><Badge bg={this.state.modules.ctc ? 'success' : 'danger'} style={{ fontWeight: 'normal' }}>CTC Office</Badge></h4></Col>
          <Col><h4><Badge bg={this.state.modules.waysideSW ? 'success' : 'danger'} style={{ fontWeight: 'normal' }}>Wayside Controller (SW)</Badge></h4></Col>
          <Col><h4><Badge bg={this.state.modules.waysideHW ? 'success' : 'danger'} style={{ fontWeight: 'normal' }}>Wayside Controller (HW)</Badge></h4></Col>
          <Col><h4><Badge bg={this.state.modules.trackModel ? 'success' : 'danger'} style={{ fontWeight: 'normal' }}>Track Model</Badge></h4></Col>
          <Col><h4><Badge bg={this.state.modules.trainModel ? 'success' : 'danger'} style={{ fontWeight: 'normal' }}>Train Model</Badge></h4></Col>
          <Col><h4><Badge bg={this.state.modules.controllerSW ? 'success' : 'danger'} style={{ fontWeight: 'normal' }}>Train Controller (SW)</Badge></h4></Col>
          <Col><h4><Badge bg={this.state.modules.controllerHW ? 'success' : 'danger'} style={{ fontWeight: 'normal' }}>Train Controller (HW)</Badge></h4></Col>
        </Row>
      </>
    )
  }
}
