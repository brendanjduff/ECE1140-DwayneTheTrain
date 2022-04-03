import React from 'react'
import { Card } from 'react-bootstrap'
import { mToFt } from './UnitConversion'

export default class OutputCardTrackModel extends React.Component {
  render () {
    return (
      <Card>
        <Card.Body>
          <Card.Title>Track Model Outputs</Card.Title>
          <Card.Text>
            <strong>Δdistance:</strong> {mToFt(this.props.io.distance).toFixed(2)} ft <br />
            <strong>Occupancy:</strong> {this.props.io.passengers} persons <br/>
            <strong>Max Boarding Pax.:</strong> {this.props.io.maxBoardingPax} persons <br />
            <strong>Deboarding Pax.:</strong> {this.props.io.deboardingPax} persons <br />
          </Card.Text>
        </Card.Body>
      </Card>
    )
  }
}
