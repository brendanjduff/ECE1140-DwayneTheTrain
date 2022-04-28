import React from 'react'
import { Form, Row, Col } from 'react-bootstrap'

export default class Track extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      disableSwitch: true
    }
  }

  render () {
    return (
      <>
        <Form.Check
          type='switch'
          label='Manual/Automatic'
        />
        <Form.Check
          onChange={() => { this.state.disableSwitch = !this.state.disableSwitch }}
          type='switch'
          label='Maintenance Mode'
        />
        <br />
        <Form.Check
          disabled={this.state.disableSwitch}
          type='switch'
          label='GREEN: 12-13/1-13'
        />
        <Form.Check
          disabled={this.state.disableSwitch}
          type='switch'
          label='GREEN: 29-30/29-150'
        />
        <Form.Check
          disabled={this.state.disableSwitch}
          type='switch'
          label='GREEN: To Yard'
        />
        <Form.Check
          disabled={this.state.disableSwitch}
          type='switch'
          label='GREEN: From Yard'
        />
        <Form.Check
          disabled={this.state.disableSwitch}
          type='switch'
          label='GREEN: 76-77/77-101'
        />
        <Form.Check
          disabled={this.state.disableSwitch}
          type='switch'
          label='GREEN: 85-86/100-85'
        />
        <Form.Check
          disabled={this.state.disableSwitch}
          type='switch'
          label='RED: To/From Yard'
        />
        <Form.Check
          disabled={this.state.disableSwitch}
          type='switch'
          label='RED: 15-16/1-16'
        />
        <Form.Check
          disabled={this.state.disableSwitch}
          type='switch'
          label='RED: 27-28/27-76'
        />
        <Form.Check
          disabled={this.state.disableSwitch}
          type='switch'
          label='RED: 32-33/33-72'
        />
        <Form.Check
          disabled={this.state.disableSwitch}
          type='switch'
          label='RED: 38-39/38-71'
        />
        <Form.Check
          disabled={this.state.disableSwitch}
          type='switch'
          label='RED: 43-44/44-67'
        />
        <Form.Check
          disabled={this.state.disableSwitch}
          type='switch'
          label='RED: 52-53/52-66'
        />
      </>
    )
  }
}
