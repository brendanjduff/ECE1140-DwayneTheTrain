import React from 'react'
import { Form } from 'react-bootstrap'
const {ipcRenderer} = window.require('electron')


export default class App extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {
    return (
      <>
        <Form.Group controlId='formFile'>
          <Form.Label>Select Green-A PLC Program</Form.Label>
          <Form.Control type='file' onChange= {(e)=>{ipcRenderer.send('PLC_GreenA',e.target.files[0].path)}}/> 
        </Form.Group>
        <br />
        <Form.Group controlId='formFile'>
          <Form.Label>Select Green-B PLC Program</Form.Label>
          <Form.Control type='file' onChange= {(e)=>{ipcRenderer.send('PLC_GreenB',e.target.files[0].path)}}/> 
        </Form.Group>
        <br />
        <Form.Group controlId='formFile'>
          <Form.Label>Select Green-C PLC Program</Form.Label>
          <Form.Control type='file' onChange= {(e)=>{ipcRenderer.send('PLC_GreenC',e.target.files[0].path)}}/> 
        </Form.Group>
        <br />
        <Form.Group controlId='formFile'>
          <Form.Label>Select Green-D PLC Program</Form.Label>
          <Form.Control type='file' onChange= {(e)=>{ipcRenderer.send('PLC_GreenD',e.target.files[0].path)}}/> 
        </Form.Group>
        <br />
        <Form.Group controlId='formFile'>
          <Form.Label>Select Red-A PLC Program</Form.Label>
          <Form.Control type='file' onChange= {(e)=>{ipcRenderer.send('PLC_RedA',e.target.files[0].path)}}/> 
        </Form.Group>
        <br />
        <Form.Group controlId='formFile'>
          <Form.Label>Select Red-B PLC Program</Form.Label>
          <Form.Control type='file' onChange= {(e)=>{ipcRenderer.send('PLC_RedB',e.target.files[0].path)}}/> 
        </Form.Group>
        <br />
        <Form.Group controlId='formFile'>
          <Form.Label>Select Red-C PLC Program</Form.Label>
          <Form.Control type='file' onChange= {(e)=>{ipcRenderer.send('PLC_RedC',e.target.files[0].path)}}/> 
        </Form.Group>

      </>

    )
  }
}