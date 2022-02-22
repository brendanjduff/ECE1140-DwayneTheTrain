import React from 'react'
import { Container, Row, Table } from 'react-bootstrap'
import TestHeader from './TestHeader'
import OverviewTrain from './OverviewTrain'

export default class Overview extends React.Component {
  render () {
    const trainList = this.props.trains.map((t) => <OverviewTrain train={t} key={t.trainId} />)
    return (
      <Container fluid>
        <Row>
          <Table striped bordered hover size='sm' responsive>
            <thead>
              <tr>
                <th>Train ID</th>
                <th>Authority<br />(blocks)</th>
                <th>Velocity<br />(mph)</th>
                <th>Accel<br />(mph/s)</th>
                <th>Power<br />(Watts)</th>
                <th>Doors</th>
                <th>Lights</th>
                <th>Temp<br />(°F)</th>
                <th>Station</th>
                <th>Platform</th>
                <th>Underground</th>
                <th>Crew</th>
                <th>Passengers</th>
                <th>Engine</th>
                <th>Brakes</th>
                <th>Signal<br />Pickup</th>
                <th>Loaded Weight<br />(tons)</th>
              </tr>
            </thead>
            <tbody>
              {trainList}
            </tbody>
          </Table>
        </Row>
      </Container>
    )
  }
}
