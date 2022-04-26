import React from 'react'
import { Col, Button, InputGroup } from 'react-bootstrap'
import SmartTextInput from './SmartTextInput'
const { ipcRenderer } = window.require('electron')

export default class Timing extends React.Component {
  constructor (props) {
    super(props)
    this.state = { clock: false, mult: 1, time: 0 }
  }

  componentDidMount () {
    ipcRenderer.on('fetchTiming', (event, arg) => {
      this.setState({ clock: arg.clock, mult: arg.mult, time: arg.time })
    })
    this.intervalId = setInterval(() => { ipcRenderer.send('requestTiming') }, 1000 / updateRate)
  }

  componentWillUnmount () {
    ipcRenderer.removeAllListeners('fetchTiming')
    clearInterval(this.intervalId)
  }

  render () {
    return (
      <>
        <Col xs={4}>
          <Button variant={this.state.clock ? 'danger' : 'success'} size='sm' style={{ marginBottom: 10 + 'px' }} onClick={() => ipcRenderer.send('setClock', !this.state.clock)}>
            {this.state.clock ? 'Pause' : 'Start'}
          </Button>
        </Col>
        <Col xs={3}>
          <InputGroup size='sm'>
            <InputGroup.Text>Mult </InputGroup.Text>
            <SmartTextInput default={this.state.mult} channel='setMult' validate={/^[1-9]|(10)$/} style={{ textAlign: 'right', width: 50 + 'px' }} />
            <InputGroup.Text>x</InputGroup.Text>
          </InputGroup>
        </Col>
        <Col xs={1} />
        <Col xs={4}>
          <p style={{ marginTop: 2 + 'px' }}><span className='bold'>Time: </span>{Math.floor(this.state.time / 3600)}:{(Math.floor(this.state.time / 60) % 60).toFixed(0).padStart(2, '0')}:{(this.state.time % 60).toFixed(1).padStart(4, '0')} </p>
        </Col>
      </>
    )
  }
}
