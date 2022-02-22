import React from 'react'
import { Card, Row, Col, InputGroup, FormControl, Form } from 'react-bootstrap'
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
                  <SmartTextInput default={this.props.train.inputPower} channel='setPower' validate={new RegExp('^([0-9]*(\.([0-9])+)?)$')} />
                  <InputGroup.Text>μW</InputGroup.Text>
                </InputGroup>
              </Col>
            </Row>
            <Row className='noVertical'>
              <Col xs={6} className='noVertical'>
                E-Brake
              </Col>
              <Col xs={6} className='noVertical'>
                <Form>
                  <Form.Check type='switch' defaultChecked={this.props.train.inputEBrake} onChange={e => { ipcRenderer.send('setEmergencyBrake', e.target.checked) }} />
                </Form>
              </Col>
            </Row>
            <Row className='noVertical'>
              <Col xs={6} className='noVertical'>
                Service Brake
              </Col>
              <Col xs={6} className='noVertical'>
                <Form>
                  <Form.Check type='switch' defaultChecked={this.props.train.inputSBrake} onChange={e => { ipcRenderer.send('setServiceBrake', e.target.checked) }} />
                </Form>
              </Col>
            </Row>
            <Row className='noVertical'>
              <Col xs={6} className='noVertical'>
                Open Doors
              </Col>
              <Col xs={6} className='noVertical'>
                <Form>
                  <Form.Check type='checkbox' inline label='Left' defaultChecked={this.props.train.inputLeftDoors} onChange={e => { ipcRenderer.send('setLeftDoors', e.target.checked) }} />
                  <Form.Check type='checkbox' inline label='Right' defaultChecked={this.props.train.inputRightDoors} onChange={e => { ipcRenderer.send('setRightDoors', e.target.checked) }} />
                </Form>
              </Col>
            </Row>
            <Row className='noVertical'>
              <Col xs={6} className='noVertical'>
                Turn on Lights
              </Col>
              <Col xs={6} className='noVertical'>
                <Form>
                  <Form.Check type='switch' defaultChecked={this.props.train.inputLights} onChange={e => { ipcRenderer.send('setLights', e.target.checked) }} />
                </Form>
              </Col>
            </Row>
            <Row className='noVertical'>
              <Col xs={6} className='noVertical'>
                Temperature
              </Col>
              <Col xs={6} className='noVertical'>
                <InputGroup size='sm' style={{ padding: 1 + 'px' }}>
                  <SmartTextInput default={this.props.train.inputTemp} channel='setTemperature' validate={new RegExp('^([0-9]{2})$')} />
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
