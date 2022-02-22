import React from 'react'
import { Row, Col, Card, Form } from 'react-bootstrap'
const { ipcRenderer } = window.require('electron')

export default class FailureControls extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {
    return (
      <Card>
        <Form>
          <Card.Body>
            <Card.Title>System Failure</Card.Title>
            <Card.Text>
              <Row className='noVertical'>
                <Col xs={6} className='noVertical'>
                  Engine
                </Col>
                <Col xs={6} className='noVertical'>
                  <Form.Check type='switch' defaultChecked={this.props.train.inputEngineFailure} onChange={e => { ipcRenderer.send('setEngineFailure', e.target.checked) }} />
                </Col>
              </Row>
              <Row className='noVertical'>
                <Col xs={6} className='noVertical'>
                  Brakes
                </Col>
                <Col xs={6} className='noVertical'>
                  <Form.Check type='switch' defaultChecked={this.props.train.inputBrakeFailure} onChange={e => { ipcRenderer.send('setBrakeFailure', e.target.checked) }} />
                </Col>
              </Row>
              <Row className='noVertical'>
                <Col xs={6} className='noVertical'>
                  Signal Pickup
                </Col>
                <Col xs={6} className='noVertical'>
                  <Form.Check type='switch' defaultChecked={this.props.train.inputSignalFailure} onChange={e => { ipcRenderer.send('setSignalFailure', e.target.checked) }} />
                </Col>
              </Row>
            </Card.Text>
          </Card.Body>
        </Form>
      </Card>
    )
  }
}
