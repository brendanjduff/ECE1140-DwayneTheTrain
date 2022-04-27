import React from 'react'
import { Card, Form, Dropdown, Button, ButtonGroup, FormControl, DropdownButton } from 'react-bootstrap'
import SmartTextInput from './SmartTextInput'
const { ipcRenderer } = window.require('electron')

export default class Schedule extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      twentyEight: false,
      twentyNine: false,
      thirty: false,
      first: false
    }
  }

  render () {
    return (
      <Card>
        <DropdownButton title='Select Schedule...'>
          <Dropdown.Item onClick={() => {this.state.twentyEight = !this.state.twentyEight}}>Apr-28-22</Dropdown.Item>
          <Dropdown.Item onClick={() => {this.state.twentyNine = !this.state.twentyNine}}>Apr-29-22</Dropdown.Item>
          <Dropdown.Item onClick={() => {this.state.thirty = !this.state.thirty}}>Apr-30-22</Dropdown.Item>
          <Dropdown.Item onClick={() => {this.state.first = !this.state.first}}>May-1-22</Dropdown.Item>
        </DropdownButton>
        {this.state.twentyEight ? <strong>Loaded Apr-28-22</strong> : ''}
        {this.state.twentyNine ? <strong>Loaded Apr-29-22</strong> : ''}
        {this.state.thirty ? <strong>Loaded Apr-30-22</strong> : ''}
        {this.state.first ? <strong>Loaded May-1-22</strong> : ''}
        <br /> Departure Time: {this.props.t.departureTimeHrs + ':' + this.props.t.departureTimeMinutes}
        <br /> Hours (24H) <SmartTextInput default='' channel='departTimeHrs' validate={/.*/} /> Minutes <SmartTextInput default='' channel='departTimeMin' validate={/.*/} />
        <br /> Arrival Time: {this.props.t.arrivalTimeHrs + ':' + this.props.t.arrivalTimeMinutes}
        <br /> Hours (24H) <SmartTextInput default='' channel='arrivalTimeHrs' validate={/.*/} /> Minutes <SmartTextInput default='' channel='arrivalTimeMin' validate={/.*/} /><br />
        Destination: {this.props.t.destination}
        <DropdownButton title='Select Destination...'>
          <Dropdown.Item onClick={() => { ipcRenderer.send('destination', 'Shadyside') }}>Shadyside</Dropdown.Item>
          <Dropdown.Item onClick={() => { ipcRenderer.send('destination', 'Herron Ave') }}>Herron Ave</Dropdown.Item>
          <Dropdown.Item onClick={() => { ipcRenderer.send('destination', 'Swissville') }}>Swissville</Dropdown.Item>
          <Dropdown.Item onClick={() => { ipcRenderer.send('destination', 'Penn Station') }}>Penn Station</Dropdown.Item>
          <Dropdown.Item onClick={() => { ipcRenderer.send('destination', 'Steel Plaza') }}>Steel Plaza</Dropdown.Item>
          <Dropdown.Item onClick={() => { ipcRenderer.send('destination', 'First Ave') }}>First Ave</Dropdown.Item>
          <Dropdown.Item onClick={() => { ipcRenderer.send('destination', 'Station Square') }}>Station Square</Dropdown.Item>
          <Dropdown.Item onClick={() => { ipcRenderer.send('destination', 'South Hills Junction') }}>South Hills Junction</Dropdown.Item>
          <Dropdown.Item onClick={() => { ipcRenderer.send('destination', 'Pioneer') }}>Pioneer</Dropdown.Item>
          <Dropdown.Item onClick={() => { ipcRenderer.send('destination', 'Edgebrook') }}>Edgebrook</Dropdown.Item>
          <Dropdown.Item onClick={() => { ipcRenderer.send('destination', 'Station') }}>Station</Dropdown.Item>
          <Dropdown.Item onClick={() => { ipcRenderer.send('destination', 'Whited') }}>Whited</Dropdown.Item>
          <Dropdown.Item onClick={() => { ipcRenderer.send('destination', 'South Bank') }}>South Bank</Dropdown.Item>
          <Dropdown.Item onClick={() => { ipcRenderer.send('destination', 'Central') }}>Central</Dropdown.Item>
          <Dropdown.Item onClick={() => { ipcRenderer.send('destination', 'Inglewood') }}>Inglewood</Dropdown.Item>
          <Dropdown.Item onClick={() => { ipcRenderer.send('destination', 'Overbrook') }}>Overbrook</Dropdown.Item>
          <Dropdown.Item onClick={() => { ipcRenderer.send('destination', 'Glenbury') }}>Glenbury</Dropdown.Item>
          <Dropdown.Item onClick={() => { ipcRenderer.send('destination', 'Dormont') }}>Dormont</Dropdown.Item>
          <Dropdown.Item onClick={() => { ipcRenderer.send('destination', 'Mt Lebanon') }}>Mt Lebanon</Dropdown.Item>
          <Dropdown.Item onClick={() => { ipcRenderer.send('destination', 'Poplar') }}>Poplar</Dropdown.Item>
          <Dropdown.Item onClick={() => { ipcRenderer.send('destination', 'Castle Shannon') }}>Castle Shannon</Dropdown.Item>
        </DropdownButton><br />
        <Form.Check type='checkbox' label='Hardware Train' onChange={e => { ipcRenderer.send('hw', e.target.checked) }} />
        <Button variant='primary' onClick={() => { ipcRenderer.send('createTrain') }}>Dispatch Train</Button>
      </Card>
    )
  }
}
