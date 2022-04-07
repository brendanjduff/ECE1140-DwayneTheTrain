import React from 'react'
import { Card, Stack, Dropdown, Button, ButtonGroup, FormControl, DropdownButton } from 'react-bootstrap'
import SmartTextInput from './SmartTextInput'
const { ipcRenderer } = window.require('electron')

export default class Schedule extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {
    return (
      <Card>
          <br /> Departure Time: {this.props.departureHrs.toString() + ":" + this.props.departureMin.toString()}
          <br /> Hours (24H) <SmartTextInput default='' channel='departTimeHrs' validate={/.*/} /> Minutes <SmartTextInput default='' channel='departTimeMin' validate={/.*/} />
          <br /> Arrival Time: {this.props.arrivalHrs.toString() + ":" + this.props.arrivalMin.toString()}
          <br /> Hours (24H) <SmartTextInput default='' channel='arrivalTimeHrs' validate={/.*/} /> Minutes <SmartTextInput default='' channel='arrivalTimeMin' validate={/.*/} /><br />
          Destination: {this.props.destination}
          <DropdownButton title='Select Destination...'>
            <Dropdown.Item>Dormont</Dropdown.Item>
          </DropdownButton><br />
          <Button variant='primary' onClick={() => { ipcRenderer.send('createTrain')}}>Dispatch Train</Button>
          current block is: {this.props.block}<br />
          suggested speed: {this.props.speed} mph<br />
          suggested authority: {this.props.authority} blocks
      </Card>
    )
  }
}
