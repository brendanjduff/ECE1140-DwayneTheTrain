import React from 'react'
import { Col, Badge } from 'react-bootstrap'
const { ipcRenderer } = window.require('electron')

export default class Watchdog extends React.Component {
  constructor (props) {
    super(props)
    this.state = { trainModel: false }
  }

  componentDidMount () {
    ipcRenderer.on('fetchWatchdog', (event, arg) => {
      this.setState({ trainModel: arg })
    })
    this.intervalId = setInterval(() => { ipcRenderer.send('requestWatchdog') }, 1000 / updateRate)
  }

  componentWillUnmount () {
    ipcRenderer.removeAllListeners('fetchWatchdog')
    clearInterval(this.intervalId)
  }

  render () {
    return (
      <Col><h4><Badge bg={this.state.trainModel ? 'success' : 'danger'} style={{ fontWeight: 'normal' }}>Connected</Badge></h4></Col>
    )
  }
}
