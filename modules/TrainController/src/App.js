import React from 'react'
import { Button, Card, Container, Row, Col, ToggleButton, ButtonGroup, Form } from 'react-bootstrap'
import BootstrapSwitchButton from 'bootstrap-switch-button-react'
const { ipcRenderer } = window.require('electron')

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = { speed: 0, temp: 68, cmdSpeed: 0, actSpeed: 0 , authority: 0, kI: 0, kP: 0, automatic: false }
  }

  componentDidMount () {
    ipcRenderer.on('SendData', (event, arg) => {this.setState({ speed: arg.speed, temp: arg.temp, cmdSpeed: arg.cmdSpeed, actSpeed: arg.actSpeed, authority: arg.authority, location: arg.location, kI: arg.kI, kP: arg.kP, automatic: arg.automatic })})
    this.intervalID = setInterval(() => { ipcRenderer.send('RequestData')}, 50)
  }

  render () {
    const authUp = testUI ? <Button variant='outline-dark' onClick={() => { ipcRenderer.send('authorityUp') }}>⇧</Button> : ''
    const authDown = testUI ? <Button variant='outline-dark' onClick={() => { ipcRenderer.send('authorityDown') }}>⇩</Button> : ''
    const actUp = testUI ? <Button variant='outline-dark' onClick={() => { ipcRenderer.send('actSpeedUp') }}>⇧</Button> : ''
    const actDown = testUI ? <Button variant='outline-dark' onClick={() => { ipcRenderer.send('actSpeedDown') }}>⇩</Button> : ''
    const cmdUp = testUI ? <Button variant='outline-dark' onClick={() => { ipcRenderer.send('cmdSpeedUp') }}>⇧</Button> : ''
    const cmdDown = testUI ? <Button variant='outline-dark' onClick={() => { ipcRenderer.send('cmdSpeedDown') }}>⇩</Button> : ''

    const stat = this.state.automatic

    return (
      <div>
        <body>
          <Container>
            <Row>
              <h2>Authority</h2>
              <Col>
                <Card style={{ width: '15rem' }}>
                  <Card.Body>{this.state.authority} BLOCKS</Card.Body>
                </Card>
              </Col>
              <Col>
                {authUp} &nbsp;
                {authDown}
              </Col>
              <Col>
                <ButtonGroup>
                  <ToggleButton type='radio' variant={!this.state.automatic ? 'secondary' : 'outline-secondary'} onClick={() =>{ ipcRenderer.send('manualMode') }}>MANUAL</ToggleButton>
                  <ToggleButton type='radio' variant={this.state.automatic ? 'secondary' : 'outline-secondary'} onClick={() => {
                  ipcRenderer.send('automaticMode') }}>AUTOMATIC</ToggleButton>
                </ButtonGroup>
              </Col>
            </Row>
            <Row>
              <h2>Actual Speed</h2>
            </Row>
            <Row>
              <Col>
                <Card style={{ width: '15rem' }}>
                  <Card.Body>{this.state.actSpeed} MPH</Card.Body>
                </Card>
              </Col>
              <Col>
                {actUp} &nbsp;
                {actDown}
              </Col>
              </Row>  
            <Row>
              <h2>Commanded Speed</h2>
            </Row>
            <Row>
              <Col>
                <Card style={{ width: '15rem' }}>
                  <Card.Body>{this.state.cmdSpeed} MPH</Card.Body>
                </Card>
              </Col>
              <Col>
                {cmdUp} &nbsp;
                {cmdDown}
              </Col>
            </Row>
            <Row>
              <Row>
                <h2>Desired Speed</h2>
              </Row>
              <Row>
                <Col>
                  <Card style={{ width: '15rem' }}>
                    <Card.Body>{this.state.speed} MPH</Card.Body>
                  </Card>
                </Col>
                <Col>
                  <Button disabled={stat} variant='outline-dark' onClick={() => { ipcRenderer.send('spdUp') }}>⇧</Button> &nbsp;
                  <Button disabled={stat} variant='outline-dark' onClick={() => { ipcRenderer.send('spdDown') }}>⇩</Button>
                </Col>
                <Col>
                  <ToggleButton variant='primary' onClick={() => { ipcRenderer.send('serBrake') }}>BRAKE</ToggleButton>
                </Col>
                <Col>
                  <ToggleButton variant='danger' onClick={() => { ipcRenderer.send('emerBrake') }}>EMERGENCY BRAKE</ToggleButton>
                </Col>
              </Row>
            </Row>
            <Row>
              <h2>Temperature</h2>
            </Row>
            <Row>
              <Col>
                <Card style={{ width: '15rem' }}>
                  <Card.Body>{this.state.temp}</Card.Body>
                </Card>
              </Col>
              <Col>
                <Button variant='outline-dark' onClick={() => { ipcRenderer.send('tempUp') }}>⇧</Button> &nbsp;
                <Button variant='outline-dark' onClick={() => { ipcRenderer.send('tempDown') }}>⇩</Button>
              </Col>
            </Row>
            <Row>
              <Col>
                <h2>Kp</h2>
                  <Row>
                    <Col>
                      <Card style={{ width: '10rem' }}>
                        <Card.Body>{this.state.kP}</Card.Body>
                      </Card>
                    </Col>
                    <Col>
                      <Button variant='outline-dark' onClick={() => { ipcRenderer.send('KpUp') }}>⇧</Button> &nbsp;
                      <Button variant='outline-dark' onClick={() => { ipcRenderer.send('KpDown') }}>⇩</Button>
                    </Col>
                  </Row>
              </Col>  
              <Col>
                <h2>Ki</h2>
                <Row>
                  <Card style={{ width: '10rem' }}>
                    <Card.Body>{this.state.kI}</Card.Body>
                  </Card>
                  <Col>
                    <Button variant='outline-dark' onClick={() => { ipcRenderer.send('KiUp') }}>⇧</Button> &nbsp;
                    <Button variant='outline-dark' onClick={() => { ipcRenderer.send('KiDown') }}>⇩</Button>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row>
              <Col>
                <h2>Location</h2>
                <Card style={{ width: '15rem' }}>
                  <Card.Body>{this.state.location}</Card.Body>
                </Card>
              </Col>
            </Row>
            <Row>
              <Col>
                <h2>Lights</h2>
                <Form.Check type='switch' defaultChecked={false} onClick={e => { ipcRenderer.send('lightsOnOff', e.target.checked) }} width={10}/>
              </Col>
              <Col>
                <h2>Left Door</h2>
                <Form.Check type='switch' defaultChecked={false}  onClick={e => { ipcRenderer.send('leftDoor', e.target.checked) }} width={80} onlabel='Open' offlabel='Close' />
              </Col>
              <Col>
                <h2>Right Door</h2>
                <Form.Check type='switch' defaultChecked={false}  onClick={e => { ipcRenderer.send('rightDoor', e.target.checked) }} width={80} onlabel='Open' offlabel='Close' />
              </Col>
            </Row>
          </Container>
          <script src='trainController.js' />
        </body>
      </div>
    )
  }
}

export default App
