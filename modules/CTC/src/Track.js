import React from 'react'
import { Badge, OverlayTrigger, Dropdown, Button, ButtonGroup, Container, Row, Col, DropdownButton, Tooltip } from 'react-bootstrap'

export default class Track extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      closeBlockRed: new Array(76).fill(false),
      closeBlockGreen: new Array(150).fill(false)
    }
  }

  render () {
    return (
      <h6>
        {this.props.g.map((b, i) =>
          <OverlayTrigger
            placement='bottom'
            overlay={
              <Tooltip id='tooltip-bottom'>
                BLOCK {[i+1]} <br />
                Suggested Speed: {(this.props.gSpeed[i] * 2.2).toFixed(2)} mph
                Suggested Authority: {this.props.gAuth[i]} blocks <br />
                Rail Status: GOOD <br />
                {this.state.closeBlockGreen[i] ? 'CLOSED' : ''}
              </Tooltip>
          }
          >
            <Badge bg={this.state.closeBlockGreen[i] ? 'secondary' : (b ? 'primary' : 'success')} onClick={() => {this.state.closeBlockGreen[i] = !this.state.closeBlockGreen[i]}}>{i + 1}</Badge>
          </OverlayTrigger>
        )}
        <br />
        {this.props.r.map((b, i) =>
          <OverlayTrigger
            placement='bottom'
            overlay={
              <Tooltip id='tooltip-bottom'>
                BLOCK {[i+1]} <br />
                Suggested Speed: {(this.props.rSpeed[i] * 2.2).toFixed(2)} mph
                Suggested Authority: {this.props.rAuth[i]} blocks <br />
                Rail Status: GOOD <br />
                {this.state.closeBlockRed[i] ? 'CLOSED' : ''}
              </Tooltip>
        }
          >
            <Badge bg={this.state.closeBlockRed[i] ? 'secondary' : (b ? 'primary' : 'danger')} onClick={() => {this.state.closeBlockRed[i] = !this.state.closeBlockRed[i]}}>{i + 1}</Badge>
          </OverlayTrigger>
        )}
      </h6>
    )
  }
}
