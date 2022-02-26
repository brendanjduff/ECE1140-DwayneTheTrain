import React from 'react'
import InputCardTrainController from './InputCardTrainController'
import InputCardTrackModel from './InputCardTrackModel'
import OutputCardTrainController from './OutputCardTrainController'
import OutputCardTrackModel from './OutputCardTrackModel'
import { Col, Stack } from 'react-bootstrap'

export default class TestCards extends React.Component {
  render () {
    return (
      <>
        <Col xl={3} md={6}>
          <Stack>
            <InputCardTrainController io={this.props.controller.inputs} />
            <OutputCardTrainController io={this.props.controller.outputs} />
          </Stack>
        </Col>
        <Col xl={3} md={6}>
          <Stack>
            <InputCardTrackModel io={this.props.trackmodel.inputs} />
            <OutputCardTrackModel io={this.props.trackmodel.outputs} />
          </Stack>
        </Col>
      </>
    )
  }
}
