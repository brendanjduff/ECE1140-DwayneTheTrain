import React from 'react'
import { Row, Col, Button, InputGroup, FormControl } from 'react-bootstrap'
import SmartTextInput from './SmartTextInput'
const { ipcRenderer } = window.require('electron')

export default class TestHeader extends React.Component {
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
      <Row>
        <Col xs='auto'>
          <Button variant='primary' size='sm' style={{ marginBottom: 10 + 'px' }} onClick={() => ipcRenderer.send('createTrain', true)}>
            Create Train
          </Button>
        </Col>
        <Col xs='auto'>
          <Button variant={this.state.clock ? 'danger' : 'success'} size='sm' style={{ marginBottom: 10 + 'px' }} onClick={() => ipcRenderer.send('setClock', !this.state.clock)}>
            {this.state.clock ? 'Pause' : 'Start'}
          </Button>
        </Col>
        <Col xs='auto'>
          <InputGroup size='sm' style={{ marginTop: 5 + 'px' }}>
            <InputGroup.Text>Clock Speed </InputGroup.Text>
            <SmartTextInput default={this.state.mult} channel='setMult' validate={new RegExp('^(([1-5]{1}?[0-9]{1})|(60)|[1-9]{1}|(([0-9]{1})?\.[0-9]))$')} style={{ textAlign: 'right', width: 50 + 'px'}}/>
            <InputGroup.Text>x</InputGroup.Text>
          </InputGroup>
        </Col>
        <Col xs='auto'>
          <p style={{ marginTop: 7 + 'px' }}><span className='bold'>Time: </span>{
          Math.floor(this.state.time / 60)}:{
          (this.state.time % 60).toFixed(1).padStart(4, '0')}</p>
        </Col>
      </Row>
    )
  }
}
