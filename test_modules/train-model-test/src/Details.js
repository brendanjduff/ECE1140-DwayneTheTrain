import React from 'react'
import { Container, Row, Col, DropdownButton, Dropdown } from 'react-bootstrap'
import InputCardTrackModel from './InputCardTrackModel'
import OutputCardTrackModel from './OutputCardTrackModel'
import InputCardTrainController from './InputCardTrainController'
import OutputCardTrainController from './OutputCardTrainController'
const { ipcRenderer } = window.require('electron')

export default class Details extends React.Component {
  render () {
    return (
      <Container fluid key={this.props.train.trainId}>
        <Row>
          <Col xs={1}>
            <DropdownButton title={'Train ' + this.props.train.trainId + (this.props.train.hw ? ' (HW)' : '')} size='sm' style={{ marginBottom: 10 + 'px' }}>
              {this.props.trains.map((t) => (t.trainId !== this.props.train.trainId) ? (<Dropdown.Item key={t.trainId} onClick={() => { ipcRenderer.send('selectTrain', t.trainId) }}>Train {t.trainId}{t.hw ? ' (HW)' : ''}</Dropdown.Item>) : '')}
            </DropdownButton>
          </Col>
        </Row>
        <Row>
          <Col><InputCardTrackModel io={this.props.train.trackIntf.inputs} />
            <OutputCardTrackModel io={this.props.train.trackIntf.outputs} />
          </Col>
          <Col><InputCardTrainController io={this.props.train.trainIntf.inputs} />
            <OutputCardTrainController io={this.props.train.trainIntf.outputs} />
          </Col>
        </Row>
      </Container>
    )
  }
}
