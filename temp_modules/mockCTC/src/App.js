import React from 'react'
import { Row, Col, Button, InputGroup } from 'react-bootstrap'
import SmartTextInput from './SmartTextInput'
const { ipcRenderer } = window.require('electron')

export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = { trains: [] }
  }

  componentDidMount () {
    ipcRenderer.on('fetch', (event, arg) => {
      this.setState({ trains: arg })
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
        <Row>
          <Col xs='auto'>
            <InputGroup size='sm' style={{ marginTop: 5 + 'px' }}>
              <Button variant='primary' style={{ marginBottom: 10 + 'px' }} onClick={() => ipcRenderer.send('createTrain', true)}>
                Create Train
              </Button>
              <SmartTextInput default={1} channel='setNewId' validate={/^[0-9]*$/} style={{ textAlign: 'right', width: 40 + 'px', height: 31 + 'px' }} />
              <InputGroup.Text style={{ height: 31 + 'px' }}>id</InputGroup.Text>
            </InputGroup>
          </Col>
        </Row>
        <Row>
          <Col><h5 style={{ marginTop: 7 + 'px' }}>Active Trains: {this.state.trains.join(' ,')}</h5></Col>
        </Row>
      </>
    )
  }
}
