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
            <span className='bold'>Dist. Travelled:</span> {mToFt(this.props.train.outputDistanceTravelled).toFixed(2)} ft <br />
            <span className='bold'>Open Pax. Cap:</span> {this.props.train.outputOpenPaxCap} persons <br />
            <span className='bold'>Deboarding Pax.:</span> {this.props.train.outputDeboardingPax} persons <br />
          </Card.Text>
        </Card.Body>
      </Card>
    )
  }
}
