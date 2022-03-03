import React from 'react'
import { Row, Card, Form, Button } from 'react-bootstrap'
const { ipcRenderer } = window.require('electron')

export default class EmergencyBrakeCard extends React.Component {
  render () {
    return (
      <Card>
        <Form>
          <Card.Body style={{ paddingTop: 13 + 'px', paddingBottom: 13 + 'px' }}>
            <Card.Text>
              <Row className='noVertical'>
                <Button variant={this.props.ebrake ? 'secondary' : 'danger'} style={{ margin: 0 }} onClick={() => { ipcRenderer.send('setEmergencyBrakePax', !this.props.ebrake) }}><strong>{this.props.ebrake ? 'Disengage' : 'EMERGENCY BRAKE!'}</strong></Button>
              </Row>
            </Card.Text>
          </Card.Body>
        </Form>
      </Card>
    )
  }
}
