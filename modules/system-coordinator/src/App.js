import React from 'react'
import { Container } from 'react-bootstrap'
import Timing from './Timing'
import Watchdog from './Watchdog'

export default class App extends React.Component {
  render () {
    return (
      <Container fluid>
        <Timing />
        <hr class='solid' />
        <Watchdog />
      </Container>
    )
  }
}
