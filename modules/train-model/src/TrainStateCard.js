import React from 'react'
import { Card } from 'react-bootstrap'
import { msToMph, ms2ToMphs, toKilo } from './UnitConversion'

export default class TrainStateCard extends React.Component {
  render () {
    return (
      <Card>
        <Card.Body>
          <Card.Title>Train State</Card.Title>
          <Card.Text>
            <strong>Velocity: </strong>{msToMph(this.props.trainState.velocity).toFixed(1)} mph<br />
            <strong>Acceleration: </strong>{ms2ToMphs(this.props.trainState.acceleration).toFixed(1)} mph/s<br />
            <strong>Power: </strong>{toKilo(this.props.trainState.power).toFixed(0)} kW<br />
            <strong>Engine Status: </strong><span style={{ color: (this.props.trainState.engineStatus ? 'black' : 'red') }}>{this.props.trainState.engineStatus ? '✓' : 'Failure'}</span><br />
            <strong>Brake Status: </strong><span style={{ color: (this.props.trainState.brakeStatus ? 'black' : 'red') }}>{this.props.trainState.brakeStatus ? '✓' : 'Failure'}</span><br />
            <strong>Signal Pickup: </strong><span style={{ color: (this.props.trainState.signalPickup ? 'black' : 'red') }}>{this.props.trainState.signalPickup ? '✓' : 'Failure'}</span><br />
            <strong>Emergency Brake: </strong>{this.props.trainState.emergencyBrake ? 'Active' : '✗'}<br />
            <strong>Service Brake: </strong>{this.props.trainState.serviceBrake ? 'Active' : '✗'}<br />
            <strong>Doors: </strong>{(this.props.trainState.leftDoors && this.props.trainState.rightDoors) ? 'All Open' : (this.props.trainState.rightDoors ? 'Right Open' : (this.props.trainState.leftDoors ? 'Left Open' : 'Closed'))}<br />
            <strong>Lights: </strong>{this.props.trainState.lights ? 'On' : 'Off'}<br />
            <strong>Temperature: </strong>{this.props.trainState.temperature}°F<br />
            <strong>Crew: </strong>{this.props.trainState.crew}<br />
            <strong>Passengers: </strong>{this.props.trainState.passengers}<br />
          </Card.Text>
        </Card.Body>
      </Card>
    )
  }
}
