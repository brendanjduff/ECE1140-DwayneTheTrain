import React from 'react'
import { Container, Row, Col, Card } from 'react-bootstrap'
import Schedule from './Schedule'
const { ipcRenderer } = window.require('electron')

export default class App extends React.Component { //set state initial values here
  constructor(props) {
    super(props)
    this.state = {
      block: 'yard',
      arrivalHrs: '00', 
      arrivalMin: '00',
      departureHrs: '00',
      departureMin: '00',
      speed: 0,
      authority: 0,
      destination: ''
    }
  }

  componentDidMount () { //mount states here
    ipcRenderer.on('fetchData', (event, arg) => {
      this.setState({ 
        block: arg.block, 
        arrivalHrs: arg.arrivalHrs,
        arrivalMin: arg.arrivalMin,
        departureHrs: arg.departureHrs,
        departureMin: arg.departureMin,
        speed: arg.speed,
        authority: arg.authority,
        destination: arg.destination
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
        <Col><Schedule block={this.state.block} arrivalHrs={this.state.arrivalHrs} arrivalMin={this.state.arrivalMin} departureHrs={this.state.departureHrs} departureMin={this.state.departureMin} speed={this.state.speed * 2.237} authority={this.state.authority} destination={this.state.destination} /></Col>
        {/*<Col><Card><Track /></Card></Col>*/}
        {/*<Col><Card>3 of three</Card></Col> */}
      </Row>
    </Container>
  </>
  )
}
}

