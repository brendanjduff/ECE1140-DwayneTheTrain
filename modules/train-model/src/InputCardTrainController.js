import React from 'react'
import { Card, Row, Col, InputGroup, Form } from 'react-bootstrap'
import { toKilo } from './UnitConversion'
import SmartTextInput from './SmartTextInput'
const { ipcRenderer } = window.require('electron')

export default class InputCardTrainController extends React.Component {
  render () {
    return (
      <Card>
        <Card.Body>
          <Card.Title>Train Controller Inputs</Card.Title>
          <Card.Text>
            <Row className='noVertical'>
              <Col xs={6} className='noVertical'>
                Power
              </Col>
              <Col xs={6} className='noVertical'>
                <InputGroup size='sm' style={{ padding: 1 + 'px' }}>
                  <SmartTextInput default={toKilo(this.props.io.powerCmd).toFixed(0)} channel='setPower' validate={/^([0-9]{1,3})$/} />
                  <InputGroup.Text>kW</InputGroup.Text>
                </InputGroup>
              </Col>
            </Row>
            <Row className='noVertical'>
              <Col xs={6} className='noVertical'>
                E-Brake
              </Col>
              <Col xs={6} className='noVertical'>
                <Form key={this.props.io.emergencyBrake}>
                  <Form.Check type='switch' defaultChecked={this.props.io.emergencyBrake} onChange={e => { ipcRenderer.send('setEmergencyBrake', e.target.checked) }} />
                </Form>
              </Col>
            </Row>
            <Row className='noVertical'>
              <Col xs={6} className='noVertical'>
                Service Brake
              </Col>
              <Col xs={6} className='noVertical'>
                <Form>
                  <Form.Check type='switch' defaultChecked={this.props.io.serviceBrake} onChange={e => { ipcRenderer.send('setServiceBrake', e.target.checked) }} />
                </Form>
              </Col>
            </Row>
            <Row className='noVertical'>
              <Col xs={6} className='noVertical'>
                Open Doors
              </Col>
              <Col xs={6} className='noVertical'>
                <Form>
                  <Form.Check type='checkbox' inline label='Left' defaultChecked={this.props.io.leftDoors} onChange={e => { ipcRenderer.send('setLeftDoors', e.target.checked) }} />
                  <Form.Check type='checkbox' inline label='Right' defaultChecked={this.props.io.rightDoors} onChange={e => { ipcRenderer.send('setRightDoors', e.target.checked) }} />
                </Form>
              </Col>
            </Row>
            <Row className='noVertical'>
              <Col xs={6} className='noVertical'>
                Turn on Lights
              </Col>
              <Col xs={6} className='noVertical'>
                <Form>
                  <Form.Check type='switch' defaultChecked={this.props.io.lights} onChange={e => { ipcRenderer.send('setLights', e.target.checked) }} />
                </Form>
              </Col>
            </Row>
            <Row className='noVertical'>
              <Col xs={6} className='noVertical'>
                Temperature
              </Col>
              <Col xs={6} className='noVertical'>
                <InputGroup size='sm' style={{ padding: 1 + 'px' }}>
                  <SmartTextInput default={this.props.io.temperature} channel='setTemperature' validate={/^([0-9]{2})$/} />
                  <InputGroup.Text>°F</InputGroup.Text>
                </InputGroup>
              </Col>
            </Row>
          </Card.Text>
        </Card.Body>
      </Card>
    )
  }
}
