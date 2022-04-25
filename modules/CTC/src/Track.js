import React from 'react'
import { Badge, OverlayTrigger, Dropdown, Button, ButtonGroup, Container, Row, Col, DropdownButton, Tooltip } from 'react-bootstrap'

export default class Track extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {
    return (
      <h6>
        {this.props.g.map((b, i) =>
          <OverlayTrigger
            placement='bottom'
            overlay={
              <Tooltip id='tooltip-bottom'>
                Suggested Speed: {(this.props.gSpeed[i] * 2.2).toFixed(2)} mph
                Suggested Authority: {this.props.gAuth[i]} blocks <br />
                Rail Status: GOOD
              </Tooltip>
          }
          >
            <Badge bg={(b ? 'primary' : 'success')}>{i + 1}</Badge>
          </OverlayTrigger>
        )}
        <br />
        {this.props.r.map((b, i) =>
          <OverlayTrigger
            placement='bottom'
            overlay={
              <Tooltip id='tooltip-bottom'>
                Suggested Speed: {(this.props.rSpeed[i] * 2.2).toFixed(2)} mph
                Suggested Authority: {this.props.rAuth[i]} blocks <br />
                Rail Status: GOOD
              </Tooltip>
        }
          >
            <Badge bg={(b ? 'primary' : 'danger')}>{i + 1}</Badge>
          </OverlayTrigger>
        )}
      </h6>
    )
  }
}
