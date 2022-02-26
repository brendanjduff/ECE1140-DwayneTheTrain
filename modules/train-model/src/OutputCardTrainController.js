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
            <strong>Actual Speed</strong> {msToMph(this.props.io.velocity).toFixed(1)} mph <br />
            <strong>Speed Cmd:</strong> {msToMph(this.props.io.speedCmd).toFixed(1)} mph <br />
            <strong>Authority Cmd:</strong> {this.props.io.authorityCmd} blocks <br />
            <strong>Station:</strong> {this.props.io.station} <br />
            <strong>Platform:</strong> {(this.props.io.leftPlatform ? 'Left' : '') + ((this.props.io.leftPlatform && this.props.io.rightPlatform) ? '/' : '') + (this.props.io.rightPlatform ? 'Right' : '')} <br />
            <strong>Underground:</strong> {this.props.io.underground ? 'Yes' : 'No'} <br />
          </Card.Text>
        </Card.Body>
      </Card>
    )
  }
}
