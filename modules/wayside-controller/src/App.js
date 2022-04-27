import React from 'react'
import { Form } from 'react-bootstrap'

export default class App extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {
    return (
      <>
        <Form.Group controlId='formFile'>
          <Form.Label>Select PLC Program</Form.Label>
          <Form.Control type='file' />
        </Form.Group>
      </>
    )
  }
}
