import React from 'react'
import { Container, Row, Col, DropdownButton, Dropdown, Stack } from 'react-bootstrap'
import InputCardTrackModel from './InputCardTrackModel'
import OutputCardTrackModel from './OutputCardTrackModel'
const { ipcRenderer } = window.require('electron')

export default class Details extends React.Component {
  render () {
    return (
      <Container fluid key={this.props.train.trainId}>
        <Row>
          <Col xs={1}>
            <DropdownButton title={'Train ' + this.props.train.trainId} size='sm' style={{ marginBottom: 10 + 'px' }}>
              {this.props.trains.map((t) => (t.trainId !== this.props.train.trainId) ? (<Dropdown.Item key={t.trainId} onClick={() => { ipcRenderer.send('selectTrain', t.trainId) }}>Train {t.trainId}</Dropdown.Item>) : '')}
            </DropdownButton>
          </Col>
        </Row>
        <Row>
          <InputCardTrackModel io={this.props.train.intf.inputs} />
          <OutputCardTrackModel io={this.props.train.intf.outputs} />
        </Row>
      </Container>
    )
  }
}
