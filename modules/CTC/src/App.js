import React from 'react'
import { Container, Row, Col, Card } from 'react-bootstrap'
import Schedule from './Schedule'
const { ipcRenderer } = window.require('electron')

export default class App extends React.Component { // set state initial values here
  constructor (props) {
    super(props)
    this.state = { t: false, list: [] }
  }

  componentDidMount () { // mount states here
    ipcRenderer.on('fetchData', (event, arg) => {
      this.setState({
        t: arg.t, list: arg.list
      })
    })
    this.intervalId = setInterval(() => { ipcRenderer.send('requestData') }, 1000 / 20)
  }

  componentWillUnmount () {
    ipcRenderer.removeAllListeners('fetchData')
    clearInterval(this.intervalId)
  }

  render () {
    return (
      <>
        <Container fluid>
          <Row>
            <Col><Schedule t={this.state.t} /></Col>
            {/* <Col><Card><Track /></Card></Col> */}
            {/* <Col><Card>3 of three</Card></Col> */}
          </Row>
        </Container>
      </>
    )
  }
}
