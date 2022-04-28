import React from 'react'
import { Container, Row, Col, Table } from 'react-bootstrap'
import OverviewTrain from './OverviewTrain'
import Ads from './Ads'

export default class Overview extends React.Component {
  render () {
    return (
      <Container fluid>
        <Row>
          <Col md={10}>
          <Table striped bordered hover size='sm' responsive>
            <thead>
              <tr>
                <th>Train ID</th>
                {/* vital state */}
                <th>Speed<br />(mph)</th>
                <th>Accel<br />(mph/s)</th>
                <th>Power<br />(kW)</th>
                <th>Service<br />Brake</th>
                <th>Emergency<br/>Brake</th>
                {/* critical systems */}
                <th>Engine<br />Status</th>
                <th>Brakes<br />Status</th>
                <th>Signal<br />Pickup</th>
                {/* non-vital state */}
                <th>Doors</th>
                <th>Lights</th>
                <th>Temp<br />(°F)</th>
                <th>Passengers</th>
                {/* information sent from track model to train controller */}
                <th>SpeedCmd<br />(mph)</th>
                <th>Authority<br />(blocks)</th>
                <th>Station</th>
                <th>Platform</th>
                <th>Underground</th>
              </tr>
            </thead>
            <tbody>
              {this.props.trains.map((t) => <OverviewTrain train={t} key={t.trainId} />)}
            </tbody>
          </Table>
          </Col>
          <Col md={2}>
            <Ads/>
          </Col>
        </Row>
      </Container>
    )
  }
}
