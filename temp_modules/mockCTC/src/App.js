import React from 'react'
import { Row, Col, Button, InputGroup } from 'react-bootstrap'
import SmartTextInput from './SmartTextInput'
const { ipcRenderer } = window.require('electron')

export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = { trains: [] }
  }

  render () {
    return (
      <>
        <Row>
        <Button variant='primary' style={{ marginBottom: 10 + 'px' }} onClick={() => ipcRenderer.send('createTrain', true)}>
            Create Train (SW)
          </Button>
        </Row>
        <Row>
          <Button variant='primary' style={{ marginBottom: 10 + 'px' }} onClick={() => ipcRenderer.send('createTrainHW', true)}>
            Create Train (HW)
          </Button>
        </Row>
      </>
    )
  }
}
