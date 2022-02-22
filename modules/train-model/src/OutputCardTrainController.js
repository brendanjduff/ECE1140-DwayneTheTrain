import React from 'react'
import { Card } from 'react-bootstrap'
import { msToMph } from './UnitConversion'

export default class OutputCardTrainController extends React.Component {
  render () {
    return (
      <Card>
        <Card.Body>
          <Card.Title>Train Controller Outputs</Card.Title>
          <Card.Text>
            <span className='bold'>Sugg. Speed:</span> {msToMph(this.props.train.outputSpeedCmd).toFixed(1)} mph <br />
            <span className='bold'>Authority:</span> {this.props.train.outputAuthorityCmd} blocks <br />
            <span className='bold'>Station:</span> {this.props.train.outputStationName} <br />
            <span className='bold'>Platform:</span> {(this.props.train.outputLeftPlatform ? 'Left' : '') + ((this.props.train.outputLeftPlatform && this.props.train.outputRightPlatform) ? '/' : '') + (this.props.train.outputRightPlatform ? 'Right' : '')} <br />
            <span className='bold'>Underground:</span> {this.props.train.outputUnderground ? 'Yes' : 'No'} <br />
          </Card.Text>
        </Card.Body>
      </Card>
    )
  }
}
