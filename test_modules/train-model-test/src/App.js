import React from 'react'
import { Container, Row, Col, Button } from 'react-bootstrap'
import Details from './Details'
import Timing from './Timing'
import Watchdog from './Watchdog'
const { ipcRenderer } = window.require('electron')

export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = { selTrain: { trainId: '' }, trains: [] }
  }

  componentDidMount () {
    ipcRenderer.on('fetch', (event, arg) => {
      this.setState({ selTrain: arg.sel, trains: arg.trains })
    })
    this.intervalId = setInterval(() => { ipcRenderer.send('request') }, 1000 / updateRate)
  }

  componentWillUnmount () {
    ipcRenderer.removeAllListeners('fetch')
    clearInterval(this.intervalId)
  }

  render () {
    return (
      <>
        <Container fluid>
          <Row>
            <Timing />
          </Row>
          <Row>
            <Col xs={4}>
              <Button variant='primary' size='sm' style={{ marginBottom: 10 + 'px' }} onClick={() => ipcRenderer.send('createTrain', true)}>
                Create Train (Software)
              </Button>
            </Col>
            <Col xs={4}>
              <Button variant='primary' size='sm' style={{ marginBottom: 10 + 'px' }} onClick={() => ipcRenderer.send('createTrainHW', true)}>
                Create Train (Hardware)
              </Button>
            </Col>
            <Watchdog />
          </Row>
        </Container>
        {this.state.trains.length > 0 ? <Details train={this.state.selTrain} trains={this.state.trains} /> : ''}
      </>
    )
  }
}
