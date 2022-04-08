import React from 'react'
import { FormControl } from 'react-bootstrap'
const { ipcRenderer } = window.require('electron')

export default class SmartTextInput extends React.Component {
  render () {
    return (
      <FormControl size='sm' defaultValue={this.props.default} style={this.props.style} onClick={e => { e.target.value = '' }} onBlur={e => { if (this.props.validate.test(e.target.value)) { ipcRenderer.send(this.props.channel, e.target.value) } else { e.target.value = this.props.default } }} onKeyPress={e => { if (e.key === 'Enter') { e.target.blur() } }} />
    )
  }
}

SmartTextInput.defaultProps = {
  default: 'default',
  channel: 'null',
  validate: /.*/
}