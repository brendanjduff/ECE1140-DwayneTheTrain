import React from 'react'
import { Card } from 'react-bootstrap'
import { mToFt, msToMph, ms2ToMphs, kgToTons, toKilo } from './UnitConversion'

export default class VehicleDataCard extends React.Component {
  render () {
    return (
      <Card>
        <Card.Body>
          <Card.Title>{this.props.vehicle.name}</Card.Title>
          <Card.Text>
            <strong>Length:</strong> {mToFt(this.props.vehicle.length).toFixed(1)} ft<br />
            <strong>Height: </strong> {mToFt(this.props.vehicle.height).toFixed(1)} ft<br />
            <strong>Width: </strong> {mToFt(this.props.vehicle.width).toFixed(1)} ft<br />
            <strong>Mass: </strong> {kgToTons(this.props.vehicle.mass).toFixed(1)} tons<br />
            <strong>Max Speed: </strong> {msToMph(this.props.vehicle.maxVel).toFixed(1)} mph<br />
            <strong>Max Acceleration:</strong> {ms2ToMphs(this.props.vehicle.maxAcc).toFixed(1)} mph/s<br />
            <strong>Emergency Brake: </strong> {ms2ToMphs(this.props.vehicle.ebrakeAcc).toFixed(1)} mph/s<br />
            <strong>Service Brake: </strong> {ms2ToMphs(this.props.vehicle.sbrakeAcc).toFixed(1)} mph/s<br />
            <strong>Max Power: </strong> {toKilo(this.props.vehicle.maxPower).toFixed(0)} kW<br />
            <strong>Max Passengers: </strong> {this.props.vehicle.paxCap} <br />
          </Card.Text>
        </Card.Body>
      </Card>
    )
  }
}
