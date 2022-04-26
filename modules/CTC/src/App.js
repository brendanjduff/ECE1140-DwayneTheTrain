import React from 'react'
import { Container, Row, Col, Card } from 'react-bootstrap'
import Schedule from './Schedule'
import Track from './Track'
import Switch from './Switch'
const { ipcRenderer } = window.require('electron')

export default class App extends React.Component { // set state initial values here
  constructor (props) {
    super(props)
    this.state = {
      t: false,
      list: [],
      green: [],
      red: [],
      redAuth: [],
      redSpeed: [],
      greenAuth: [],
      greenSpeed: []
    }
  }

  componentDidMount () { // mount states here
    ipcRenderer.on('fetchData', (event, arg) => {
      this.setState({
        t: arg.t,
        list: arg.list,
        green: arg.occupancyListGreenLine,
        red: arg.occupancyListRedLine,
        redAuth: arg.redLineAuthority,
        redSpeed: arg.redLineSpeed,
        greenAuth: arg.greenLineAuthority,
        greenSpeed: arg.greenLineSpeed
      })
    })
    this.intervalId = setInterval(() => { ipcRenderer.send('requestData') }, 1000 / 20)
  }

  componentWillUnmount () {
    ipcRenderer.removeAllListeners('fetchData')
    clearInterval(this.intervalId)
  }

  render () {
    return (
      <>
        <Container fluid>
          <Row>
            <Col><Schedule t={this.state.t} /></Col>
            <Col><Track g={this.state.green} r={this.state.red} rAuth={this.state.redAuth} rSpeed={this.state.redSpeed} gAuth={this.state.greenAuth} gSpeed={this.state.greenSpeed} /></Col>
            <Col><Switch /></Col>
          </Row>
        </Container>
      </>
    )
  }
}
