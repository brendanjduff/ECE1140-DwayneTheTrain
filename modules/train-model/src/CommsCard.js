import React from 'react'
import { Card } from 'react-bootstrap'

export default class CommsCard extends React.Component {
  render () {
    return (
      <Card>
        <Card.Body>
          <Card.Title>Train Communications</Card.Title>
          <Card.Text>
            <strong>SpeedCmd: </strong>{this.props.train.thru.speedCmd.toFixed(1)} mph<br />
            <strong>AuthorityCmd: </strong>{this.props.train.thru.authorityCmd} blocks<br />
            <strong>PowerCmd: </strong>{parseFloat(this.props.train.state.powerCmd).toFixed(0)} kJ<br />
            <strong>Station: </strong>{this.props.train.thru.station ? this.props.train.thru.station : 'None'}<br />
            <strong>Platform: </strong>{(this.props.train.thru.leftPlatform ? 'Left' : '') + ((this.props.train.thru.leftPlatform && this.props.train.thru.rightPlatform) ? '/' : '') + (this.props.train.thru.rightPlatform ? 'Right' : '') + ((!this.props.train.thru.leftPlatform && !this.props.train.thru.rightPlatform) ? 'None' : '')}<br />
            <strong>Underground: </strong>{this.props.train.thru.underground ? 'Yes' : 'No'}<br />
            <strong>Track Grade: </strong>{this.props.train.phys.grade * 100}%<br />
          </Card.Text>
        </Card.Body>
      </Card>
    )
  }
}
