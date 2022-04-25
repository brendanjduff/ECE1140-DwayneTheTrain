import React from 'react'
import { Container, Row, Col, DropdownButton, Dropdown, Stack } from 'react-bootstrap'
import TrainStateCard from './TrainStateCard'
import CommsCard from './CommsCard'
import VehicleDataCard from './VehicleDataCard'
import FailureControlCard from './FailureControlCard'
import EmergencyBrakeCard from './EmergencyBrakeCard'
const { ipcRenderer } = window.require('electron')

export default class Details extends React.Component {
  render () {
    return (
      <Container fluid key={this.props.train.trainId}>
        <Row>
          <Col xs={1}>
            <DropdownButton title={'Train ' + this.props.train.trainId + (this.props.train.hardware ? ' (HW)' : '')} size='sm' style={{ marginBottom: 10 + 'px' }}>
              {this.props.trains.map((t) => (t.trainId !== this.props.train.trainId) ? (<Dropdown.Item key={t.trainId} onClick={() => { ipcRenderer.send('selectTrain', t.trainId) }}>Train {t.trainId}{t.hardware ? ' (HW)' : ''}</Dropdown.Item>) : '')}
            </DropdownButton>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Stack>
              <TrainStateCard trainState={this.props.train.state} />
              <CommsCard train={this.props.train} />
            </Stack>
          </Col>
          <Col md={6}>
            <Stack>
              <FailureControlCard user={this.props.train.user} />
              <EmergencyBrakeCard ebrake={this.props.train.user.emergencyBrake} />
              <VehicleDataCard vehicle={this.props.train.vehicle} />
            </Stack>
          </Col>
        </Row>
      </Container>
    )
  }
}
