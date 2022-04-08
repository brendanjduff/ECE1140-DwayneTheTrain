import React from 'react'
import { light_color_safe, block_number, controller_id, maintenance, operational, occupancy, crossing, track_switch, commanded_speed, commanded_authority, get_occupancy, get_crossing, get_track_switch, get_commanded_speed, get_commanded_authority, get_operational, get_maintenance, toggle_track_switch, toggle_maintenance, toggle_crossing, toggle_light, get_light_color_safe, toggle_block_occupancy, toggle_block_operational, light_color_caution, get_light_color_caution } from './wayside_func'
import { Button, Card, Container, Row, Col, Form } from 'react-bootstrap'
const { ipcRenderer } = window.require('electron') 

// import Renderer from 'electron/renderer'

class App extends React.Component 
{
  constructor (props) {
    super(props)
    this.state = { maintenance: false, operational: true, occupancy: false, crossing: false, track_switch: false, light_color_safe: true, light_color_caution: false }
  }

  componentDidMount () {
    setInterval(() => { this.setState({ maintenance: get_maintenance(), operational: get_operational(), occupancy: get_occupancy(), crossing: get_crossing(), track_switch: get_track_switch(), commanded_speed: get_commanded_speed(), commanded_authority: get_commanded_authority(), light_color_safe: get_light_color_safe(), light_color_caution: get_light_color_caution() }) }, 50)
  }

  
  render () {
    // if in maintenance mode disable toggle buttons light, switch, crossing
    const stat = !this.state.maintenance
    const block_occ = this.state.occupancy
    const block_op = !this.state.operational

    const block_button = testUI ? <Button variant='outline-dark' onClick={() => { toggle_block_occupancy() }}>Toggle Block Occupancy</Button> : ''
    const operational_button = testUI ? <Button variant='outline-dark' onClick={() => { toggle_block_operational() }}>Toggle Block Operational</Button> : ''
    
    console.log(stat)

    return (
      <div>
        <body>
          <Container>
            <Row>

              <Col>
                <h2>Track Operational</h2>
                <Card style={{ width: '15rem' }}>
                  <Card.Body>{this.state.operational ? 'OPERATIONAL' : 'NOT OPERATIONAL'}</Card.Body>
                </Card>
                {operational_button}
              </Col>
              <Col>

                <Form.Group controlId='formFile'>
                  <Form.Label>Select PLC Program</Form.Label>
                  <Form.Control type='file' />
                </Form.Group>

              </Col>
            </Row>

            <Row>
              <Col>
                <h2>Block Occupancy</h2>
                <Card style={{ width: '15rem' }}>
                  <Card.Body>{this.state.occupancy ? ' OCCUPIED' : 'NOT OCCUPIED'}</Card.Body>
                </Card>
                {block_button}
              </Col>

              <Col>
                <h5>Switch Status</h5>
                <Card style={{ width: '5rem' }}>
                  <Card.Body>{this.state.track_switch ? 'RIGHT' : 'LEFT'}</Card.Body>
                </Card>
                <Button disabled={stat || block_occ || block_op} variant='outline-dark' onClick={() => { toggle_track_switch() }}>Toggle Switch</Button>
              </Col>

            </Row>

            <Row>
              <Col>
                <h2>Maintenance Mode</h2>
                <Card style={{ width: '15rem' }}>
                  <Card.Body>{this.state.maintenance ? 'ON' : 'OFF'}</Card.Body>
                </Card>
                <Button variant='outline-dark' onClick={() => { toggle_maintenance() }}>Toggle Maintenance</Button>
              </Col>

              <Col>
                <h5>Crossing Status</h5>
                <Card style={{ width: '7rem' }}>
                  <Card.Body>{this.state.crossing ? 'UP' : 'DOWN'}</Card.Body>
                </Card>
                <Button disabled={stat || block_occ || block_op} variant='outline-dark' onClick={() => { toggle_crossing() }}>Toggle Crossing</Button>
              </Col>

            </Row>

            <Row>
              <Col />
              <Col>
                <h5>Light Status</h5>
                <Card style={{ width: '7rem' }}>
                  <Card.Body>{this.state.light_color}</Card.Body>
                </Card>
                <Button disabled={stat || block_occ || block_op} variant='outline-dark' onClick={() => { toggle_light() }}>Toggle Light</Button>

              </Col>

            </Row>

          </Container>

          <script src='wayside_func.js' />
        </body>
      </div>
    )
  }
}

export default App
