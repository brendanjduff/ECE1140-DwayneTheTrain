import React from 'react'
import { msToMph, ms2ToMphs, toKilo } from './UnitConversion'

export default class OverviewTrain extends React.Component {
  render () {
    const trainState = this.props.train.state
    const thruState = this.props.train.thru
    return (
      <tr>
        <td>{this.props.train.trainId}</td>
        {/* vital state */}
        <td>{msToMph(trainState.velocity).toFixed(1)}</td>
        <td>{ms2ToMphs(trainState.acceleration).toFixed(1)}</td>
        <td>{toKilo(trainState.power).toFixed(0)}</td>
        <td>{trainState.serviceBrake ? '✓' : '✗'}</td>
        <td>{trainState.emergencyBrake ? '✓' : '✗'}</td>
        {/* critical systems */}
        <td style={{ color: (trainState.engineStatus ? 'black' : 'red') }}>{trainState.engineStatus ? '✓' : 'Failure'}</td>
        <td style={{ color: (trainState.brakeStatus ? 'black' : 'red') }}>{trainState.brakeStatus ? '✓' : 'Failure'}</td>
        <td style={{ color: (trainState.signalPickup ? 'black' : 'red') }}>{trainState.signalPickup ? '✓' : 'Failure'}</td>
        {/* non-vital state */}
        <td>{(trainState.leftDoors && trainState.rightDoors) ? 'All Open' : (trainState.rightDoors ? 'Right Open' : (trainState.leftDoors ? 'Left Open' : 'Closed'))}</td>
        <td>{trainState.lights ? 'On' : 'Off'}</td>
        <td>{trainState.temperature}</td>
        <td>{trainState.passengers} / {this.props.train.vehicle.paxCap}</td>
        {/* thru information */}
        <td>{msToMph(thruState.speedCmd).toFixed(1)}</td>
        <td>{thruState.authorityCmd}</td>
        <td>{thruState.station ? thruState.station : 'None'}</td>
        <td>{(thruState.leftPlatform ? 'Left' : '') + ((thruState.leftPlatform && thruState.rightPlatform) ? '/' : '') + (thruState.rightPlatform ? 'Right' : '') + ((!thruState.leftPlatform && !thruState.rightPlatform) ? 'None' : '')}</td>
        <td>{thruState.underground ? 'Yes' : 'No'}</td>
      </tr>
    )
  }
}
