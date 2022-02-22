import React from 'react'
import { kgToTons, msToMph, ms2ToMphs } from './UnitConversion'

export default class OverviewTrain extends React.Component {
  render () {
    return (
      <tr>
        <td>{this.props.train.trainId}</td>
        <td>{this.props.train.authority}</td>
        <td>{msToMph(this.props.train.velocity).toFixed(1)} of {msToMph(this.props.train.inputSpeedCmd).toFixed(1)}</td>
        <td>{ms2ToMphs(this.props.train.acceleration).toFixed(1)}</td>
        <td>{this.props.train.power}</td>
        <td>{(this.props.train.leftDoorsOpen && this.props.train.rightDoorsOpen) ? 'All Open' : (this.props.train.rightDoorsOpen ? 'Right Open' : (this.props.train.leftDoorsOpen ? 'Left Open' : 'Closed'))}</td>
        <td>{this.props.train.lightsOn ? 'On' : 'Off'}</td>
        <td>{this.props.train.temp}</td>
        <td>{this.props.train.stationName}</td>
        <td>{(this.props.train.leftPlatform ? 'Left' : '') + ((this.props.train.leftPlatform && this.props.train.rightPlatform) ? '/' : '') + (this.props.train.rightPlatform ? 'Right' : '')}</td>
        <td>{this.props.train.underground ? 'Yes' : 'No'}</td>
        <td>{this.props.train.crew}</td>
        <td>{this.props.train.passengers} / {this.props.train.maxPassengers}</td>
        <td style={{ color: (this.props.train.engineFailure ? 'red' : 'black') }}>{this.props.train.engineFailure ? 'Failure' : 'Good'}</td>
        <td style={{ color: (this.props.train.brakeFailure ? 'red' : 'black') }}>{this.props.train.brakeFailure ? 'Failure' : 'Good'}</td>
        <td style={{ color: (this.props.train.signalFailure ? 'red' : 'black') }}>{this.props.train.signalFailure ? 'Failure' : 'Good'}</td>
        <td>{kgToTons(this.props.train.baseMass + (this.props.train.passengers * this.props.train.paxMass)).toFixed(1)}</td>
      </tr>
    )
  }
}
