import React from 'react'
import { Card, Row, Col, InputGroup, Button, Form, FormControl } from 'react-bootstrap'
import SmartTextInput from './SmartTextInput'
const { ipcRenderer } = window.require('electron')

export default class InputCardTrackModel extends React.Component {
  constructor (props) {
    super(props)
    this.station = this.props.io.station
    this.leftPlatform = this.props.io.leftPlatform
    this.rightPlatform = this.props.io.rightPlatform
    this.underground = this.props.io.underground
    this.boardingPax = 0
  }

  render () {
    return (
      <Card>
        <Card.Body>
          <Card.Title>Track Model Inputs</Card.Title>
          <Card.Text>
            <Row className='noVertical'>
              <Col xs={6} className='noVertical'>
                Sugg. Speed
              </Col>
              <Col xs={6} className='noVertical'>
                <InputGroup size='sm' style={{ padding: 1 + 'px' }}>
                  <SmartTextInput default={this.props.io.speedCmd} channel='setSpeedCmd' validate={/^([0-9]*([.]([0-9])+)?)$/} />
                  <InputGroup.Text>mph</InputGroup.Text>
                </InputGroup>
              </Col>
            </Row>
            <Row className='noVertical'>
              <Col xs={6} className='noVertical'>
                Authority
              </Col>
              <Col xs={6} className='noVertical'>
                <InputGroup size='sm' style={{ padding: 1 + 'px' }}>
                  <SmartTextInput default={this.props.io.authorityCmd} channel='setAuthority' validate={/^([0-9]*)$/} />
                  <InputGroup.Text>blocks</InputGroup.Text>
                </InputGroup>
              </Col>
            </Row>
            <Row className='noVertical'>
              <Col xs={6} className='noVertical'>
                Grade
              </Col>
              <Col xs={6} className='noVertical'>
                <InputGroup size='sm' style={{ padding: 1 + 'px' }}>
                  <SmartTextInput default={this.props.io.grade * 100} channel='setGrade' validate={/^[0-9]?(.[0-9])?$/} />
                  <InputGroup.Text>%</InputGroup.Text>
                </InputGroup>
              </Col>
            </Row>
            <hr class='solid' />
            <Row className='noVertical'>
              <Col className='noVertical'>
                Station
              </Col>
              <Col className='noVertical'>
                <FormControl size='sm' defaultValue={this.station} onClick={e => { e.target.value = '' }} onBlur={e => { this.station = e.target.value }} onKeyPress={e => { if (e.key === 'Enter') { e.target.blur() } }} />
              </Col>
            </Row>
            <Row className='noVertical'>
              <Col className='noVertical'>
                Platform
              </Col>
              <Col className='noVertical'>
                <Form.Check type='checkbox' inline label='Left' defaultChecked={this.leftPlatform} onChange={e => { this.leftPlatform = e.target.checked }} />
                <Form.Check type='checkbox' inline label='Right' defaultChecked={this.rightPlatform} onChange={e => { this.rightPlatform = e.target.checked }} />
              </Col>
            </Row>
            <Row className='noVertical'>
              <Col className='noVertical'>
                Underground
              </Col>
              <Col className='noVertical'>
                <Form.Check type='switch' defaultChecked={this.props.io.underground} onChange={e => { this.underground = e.target.checked }} />
              </Col>
            </Row>
            <Row className='noVertical'>
              <Col className='noVertical' />
              <Col className='noVertical'>
                <Button size='sm' onClick={() => { ipcRenderer.send('setBeacon', { station: this.station, leftPlatform: this.leftPlatform, rightPlatform: this.rightPlatform, underground: this.underground }) }}>
                  Submit
                </Button>
              </Col>
            </Row>
            <hr class='solid' />
            <Row className='noVertical'>
              <Col className='noVertical'>
                Boarding Passengers
              </Col>
              <Col className='noVertical'>
                <FormControl size='sm' defaultValue={0} onClick={e => { e.target.value = null }} onBlur={e => { if (/^[0-9]{1,3}$/.test(e.target.value)) { this.boardingPax = e.target.value } else { e.target.value = 0 } }} onKeyPress={e => { if (e.key === 'Enter') { e.target.blur() } }} />
              </Col>
            </Row>
            <Row className='noVertical'>
              <Col className='noVertical' />
              <Col className='noVertical'>
                <Button size='sm' onClick={() => { ipcRenderer.send('setPassengers', this.boardingPax) }}>
                  Submit
                </Button>
              </Col>
            </Row>
          </Card.Text>
        </Card.Body>
      </Card>
    )
  }
}
