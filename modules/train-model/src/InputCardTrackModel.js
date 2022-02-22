import React from 'react'
import { Card, Row, Col, InputGroup, FormControl, Form } from 'react-bootstrap'
import SmartTextInput from './SmartTextInput'
const { ipcRenderer } = window.require('electron')

export default class InputCardTrackModel extends React.Component {
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

                  <SmartTextInput default={this.props.train.inputSpeedCmd} channel='setSpeedCmd' validate={new RegExp('^([0-9]*(\.([0-9])+)?)$')} />
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

                  <SmartTextInput default={this.props.train.inputAuthority} channel='setAuthority' validate={new RegExp('^([0-9]*)$')} />
                  <InputGroup.Text>blocks</InputGroup.Text>
                </InputGroup>
              </Col>
            </Row>
            <Form />
          </Card.Text>
        </Card.Body>
      </Card>
    )
  }
}

/* export default class TestDiscInputs extends React.Component {
  render () {
    return (
      <Card>
        <Card.Body>
          <Card.Title>Beacon Inputs</Card.Title>
          <Card.Text>
            <Row className='noVertical'>
              <Col xs={6} className='noVertical'>
                Station
              </Col>
              <Col xs={6} className='noVertical'>
                <InputGroup size='sm' style={{ padding: 1 + 'px' }}>
                  <FormControl placeholder='station name' style={{ textAlign: 'right' }} />
                </InputGroup>
              </Col>
            </Row>
            <Row className='noVertical'>
              <Col xs={6} className='noVertical'>
                Platforms
              </Col>
              <Col xs={6} className='noVertical'>
                <Form>
                  <Form.Check
                    inline
                    type='checkbox'
                    label='left'
                  />
                  <Form.Check
                    inline
                    type='checkbox'
                    label='right'
                  />
                </Form>
              </Col>
            </Row>
            <Row className='noVertical'>
              <Col xs={6} className='noVertical'>
                Underground
              </Col>
              <Col xs={6} className='noVertical'>
                <Form>
                  <Form.Check
                    type='switch'
                  />
                </Form>
              </Col>
            </Row>
            <Row>
              <Col xs={6} className='noVertical' />
              <Col xs={6} className='noVertical'>            <Button variant='primary' size='sm' className='noVertical'>Transmit Beacon</Button></Col>
            </Row>
            </Card.Text>
            <Card.Text>
            <Row className='noVertical'>
              <Col xs={6} className='noVertical'>
                Boarding Pax.
              </Col>
              <Col xs={6} className='noVertical'>
                <InputGroup size='sm' style={{ padding: 1 + 'px' }}>
                  <FormControl placeholder='0' style={{ textAlign: 'right' }} />
                  <InputGroup.Text className='noVertical'>persons</InputGroup.Text>
                </InputGroup>
              </Col>
            </Row>
            <Row className='noVertical'>
              <Col xs={6} className='noVertical' /><Col xs={6} className='noVertical'><Button variant='primary' size='sm' className='noVertical'>Board Passengers</Button>
                                                   </Col>
            </Row>
          </Card.Text>
        </Card.Body>
      </Card>
    )
  }
} */
