import React from 'react'
import { Container, Row, Col, DropdownButton, Dropdown, Card, Stack } from 'react-bootstrap'
import { kgToTons, msToMph, ms2ToMphs, mToFt } from './UnitConversion'
import FailureControls from './FailureControls'
import InputCardTrainController from './InputCardTrainController'
import InputCardTrackModel from './InputCardTrackModel'
import OutputCardTrainController from './OutputCardTrainController'
import OutputCardTrackModel from './OutputCardTrackModel'
const { ipcRenderer } = window.require('electron')

export default class Details extends React.Component {
  render () {
    const testCtrlInputs = testUI ? <InputCardTrainController train={this.props.train} key={this.props.train.trainId + 1} /> : ''
    const testModelInputs = testUI ? <InputCardTrackModel train={this.props.train} key={this.props.train.trainId + 2} /> : ''
    const testCtrlOutputs = testUI ? <OutputCardTrainController train={this.props.train} key={this.props.train.trainId + 3} /> : ''
    const testModelOutputs = testUI ? <OutputCardTrackModel train={this.props.train} key={this.props.train.trainId + 4} /> : ''
    const xlSize = testUI ? 3 : 6
    const dropdownTitle = 'Train ' + this.props.train.trainId
    const dropdownItems = this.props.trains.map((t) => (t.trainId !== this.props.train.trainId) ? (<Dropdown.Item key={t.trainId} onClick={() => { ipcRenderer.send('selectTrain', t.trainId) }}>Train {t.trainId}</Dropdown.Item>) : '')
    return (
      <Container fluid>
        <Row>
          <Col xs={1}>
            <DropdownButton title={dropdownTitle} size='sm' style={{ marginBottom: 10 + 'px' }}>
              {dropdownItems}
            </DropdownButton>
          </Col>
        </Row>
        <Row>
          <Col xl={xlSize} md={6}>
            <Stack>
              <Card>
                <Card.Body>
                  <Card.Title>Train Motion</Card.Title>
                  <Card.Text>
                    <span className='bold'>Authority:</span> {this.props.train.authority} blocks <br />
                    <span className='bold'>Velocity:</span> {msToMph(this.props.train.velocity).toFixed(1)} mph of {msToMph(this.props.train.inputSpeedCmd).toFixed(1)} mph<br />
                    <span className='bold'>Acceleration:</span> {ms2ToMphs(this.props.train.acceleration).toFixed(1)} mph/s <br />
                    <span className='bold'>Power:</span> {this.props.train.power} W
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card>
                <Card.Body>
                  <Card.Title>Vehicle State</Card.Title>
                  <Card.Text>
                    <span className='bold'>Left Doors:</span> {this.props.train.leftDoorsOpen ? 'Open' : 'Closed'}<br />
                    <span className='bold'>Right Doors:</span> {this.props.train.rightDoorsOpen ? 'Open' : 'Closed'}<br />
                    <span className='bold'>Interior Lights:</span> {this.props.train.lightsOn ? 'On' : 'Off'}<br />
                    <span className='bold'>Temperature:</span> {this.props.train.temp}°F
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card>
                <Card.Body>
                  <Card.Title>Vehicle Properties</Card.Title>
                  <Card.Text>
                    <span className='bold'>Length:</span> {mToFt(this.props.train.length).toFixed(1)} ft<br />
                    <span className='bold'>Height:</span> {mToFt(this.props.train.height).toFixed(1)} ft<br />
                    <span className='bold'>Width:</span> {mToFt(this.props.train.width).toFixed(1)} ft<br />
                    <span className='bold'>Weight:</span> {kgToTons(this.props.train.baseMass).toFixed(1)} tons
                  </Card.Text>
                </Card.Body>
              </Card>
            </Stack>
          </Col>
          <Col xl={xlSize} md={6}>
            <Stack>
              <Card>
                <Card.Body>
                  <Card.Title>Track Information</Card.Title>
                  <Card.Text>
                    <span className='bold'>Station:</span> {this.props.train.stationName}<br />
                    <span className='bold'>Platform:</span> {(this.props.train.leftPlatform ? 'Left' : '') + ((this.props.train.leftPlatform && this.props.train.rightPlatform) ? '/' : '') + (this.props.train.rightPlatform ? 'Right' : '')}<br />
                    <span className='bold'>Underground:</span> {this.props.train.underground ? 'Yes' : 'No'}
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card>
                <Card.Body>
                  <Card.Title>People</Card.Title>
                  <Card.Text>
                    <span className='bold'>Crew:</span> {this.props.train.crew}<br />
                    <span className='bold'>Passengers:</span> {this.props.train.passengers}<br />
                    <span className='bold'>Loaded Weight:</span> {kgToTons(this.props.train.baseMass + (this.props.train.passengers * this.props.train.paxMass)).toFixed(1)} tons
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card>
                <Card.Body>
                  <Card.Title>Critical Systems</Card.Title>
                  <Card.Text>
                    <span className='bold'>Engine Status:</span> <span style={{ color: (this.props.train.engineFailure ? 'red' : 'black') }}>{this.props.train.engineFailure ? 'Failure' : 'Good'}</span><br />
                    <span className='bold'>Brakes Status:</span> <span style={{ color: (this.props.train.brakeFailure ? 'red' : 'black') }}>{this.props.train.brakeFailure ? 'Failure' : 'Good'}</span><br />
                    <span className='bold'>Signal Pickup:</span> <span style={{ color: (this.props.train.signalFailure ? 'red' : 'black') }}>{this.props.train.signalFailure ? 'Failure' : 'Good'}</span>
                  </Card.Text>
                </Card.Body>
              </Card>
              <FailureControls train={this.props.train} key={this.props.train.trainId} />
            </Stack>
          </Col>
          <Col xl={xlSize} md={6}>
            <Stack>
              {testCtrlInputs}
              {testCtrlOutputs}
            </Stack>

          </Col>
          <Col xl={xlSize} md={6}>
            <Stack>
              {testModelInputs}
              {testModelOutputs}
            </Stack>

          </Col>
        </Row>
      </Container>
    )
  }
}
