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
          <Form.Label>Select GreenA PLC Program</Form.Label>
          <Form.Control type='file' onChange= {(e)=>{ipcRenderer.send('PLC_GreenA',e.target.files[0].path)}}/> 
        </Form.Group>
        <br />
        <Form.Group controlId='formFile'>
          <Form.Label>Select GreenB PLC Program</Form.Label>
          <Form.Control type='file' onChange= {(e)=>{ipcRenderer.send('PLC_GreenB',e.target.files[0].path)}}/> 
        </Form.Group>
        <br />
        <Form.Group controlId='formFile'>
          <Form.Label>Select GreenC PLC Program</Form.Label>
          <Form.Control type='file' onChange= {(e)=>{ipcRenderer.send('PLC_GreenC',e.target.files[0].path)}}/> 
        </Form.Group>
        <br />
        <Form.Group controlId='formFile'>
          <Form.Label>Select GreenD PLC Program</Form.Label>
          <Form.Control type='file' onChange= {(e)=>{ipcRenderer.send('PLC_GreenD',e.target.files[0].path)}}/> 
        </Form.Group>
        <br />
        <Form.Group controlId='formFile'>
          <Form.Label>Select RedA PLC Program</Form.Label>
          <Form.Control type='file' onChange= {(e)=>{ipcRenderer.send('PLC_RedA',e.target.files[0].path)}}/> 
        </Form.Group>
        <br />
        <Form.Group controlId='formFile'>
          <Form.Label>Select RedB PLC Program</Form.Label>
          <Form.Control type='file' onChange= {(e)=>{ipcRenderer.send('PLC_RedB',e.target.files[0].path)}}/> 
        </Form.Group>
        <br />
        <Form.Group controlId='formFile'>
          <Form.Label>Select RedC PLC Program</Form.Label>
          <Form.Control type='file' onChange= {(e)=>{ipcRenderer.send('PLC_RedC',e.target.files[0].path)}}/> 
        </Form.Group>

      </>

    )
  }
}


