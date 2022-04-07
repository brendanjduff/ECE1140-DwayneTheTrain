import React from 'react'
import { Card, Stack, Dropdown, Button, ButtonGroup, Container, Row, Col, DropdownButton } from 'react-bootstrap'
import Train from './Train'
import Input from './Input'
import Form from './Form'

function testHeader () {
  return (
    <Card>
      <Stack direction='horizontal'>
        <ButtonGroup size='md' className='mb-2'>
          <Button variant='success'>Add Train</Button>
          <Button variant='danger'>Delete Train</Button>
        </ButtonGroup>
        <ButtonGroup size='md' className='mb-2'>
          Change Block Num:
          <Button variant='success'>+</Button>
          <Button variant='danger'>-</Button>
        </ButtonGroup>
      </Stack>
    </Card>
  )
}

export default class Track extends React.Component {
  render () {
    return (
      <Card>
        <Card>
          <Stack direction='horizontal'>
            <ButtonGroup size='md' className='mb-2'>
              <Button variant='success'>Add Train</Button>
              <Button variant='danger'>Delete Train</Button>
            </ButtonGroup>
            <ButtonGroup size='md' className='mb-2'>
              <Button variant='success'>Block +</Button>
              <Button variant='danger'>Block -</Button>
            </ButtonGroup>
          </Stack>
          <Stack direction='horizontal'>
            <DropdownButton title='Set Rail Status...' variant='primary' size='md'>
              <Dropdown.Item>Block 1</Dropdown.Item>
              <Dropdown.Item>Block 2</Dropdown.Item>
              <Dropdown.Item>Block 3</Dropdown.Item>
              <Dropdown.Item>Block 4</Dropdown.Item>
              <Dropdown.Item>Block 5</Dropdown.Item>
              <Dropdown.Item>Block 6</Dropdown.Item>
              <Dropdown.Item>Block 7</Dropdown.Item>
              <Dropdown.Item>Block 8</Dropdown.Item>
              <Dropdown.Item>Block 9</Dropdown.Item>
              <Dropdown.Item>Block 10</Dropdown.Item>
              <Dropdown.Item>Block 11</Dropdown.Item>
              <Dropdown.Item>Block 12</Dropdown.Item>
              <Dropdown.Item>Block 13</Dropdown.Item>
              <Dropdown.Item>Block 14</Dropdown.Item>
              <Dropdown.Item>Block 15</Dropdown.Item>
            </DropdownButton>
            <ButtonGroup size='md' className='mb-2'>
              <Button variant='success'>Set True</Button>
              <Button variant='danger'>Set False</Button>
            </ButtonGroup>
          </Stack>
        </Card>
        <Container>
          <Row>
            <Col>
              <br />
              <Stack direction='horizontal'>
                <Button variant='success'>Yard</Button>
                <DropdownButton title='1' variant='secondary'>
                  <Dropdown.Item>Occupied: false</Dropdown.Item>
                  <Dropdown.Item>Rail Status: OK</Dropdown.Item>
                </DropdownButton>
                <DropdownButton title='2' variant='secondary'>
                  <Dropdown.Item>Occupied: false</Dropdown.Item>
                  <Dropdown.Item>Rail Status: OK</Dropdown.Item>
                </DropdownButton>
                <DropdownButton title='3' variant='secondary'>
                  <Dropdown.Item>Occupied: false</Dropdown.Item>
                  <Dropdown.Item>Rail Status: OK</Dropdown.Item>
                </DropdownButton>
                <DropdownButton title='4' variant='secondary'>
                  <Dropdown.Item>Occupied: false</Dropdown.Item>
                  <Dropdown.Item>Rail Status: OK</Dropdown.Item>
                </DropdownButton>
                <DropdownButton title='5' variant='secondary'>
                  <Dropdown.Item>Occupied: false</Dropdown.Item>
                  <Dropdown.Item>Rail Status: OK</Dropdown.Item>
                </DropdownButton>
              </Stack>
            </Col>
            <Col>
              <Stack>
                <Stack direction='horizontal'>
                  <DropdownButton title='6' variant='secondary'>
                    <Dropdown.Item>Occupied: false</Dropdown.Item>
                    <Dropdown.Item>Rail Status: OK</Dropdown.Item>
                  </DropdownButton>
                  <DropdownButton title='7' variant='secondary'>
                    <Dropdown.Item>Occupied: false</Dropdown.Item>
                    <Dropdown.Item>Rail Status: OK</Dropdown.Item>
                  </DropdownButton>
                  <DropdownButton title='8' variant='secondary'>
                    <Dropdown.Item>Occupied: false</Dropdown.Item>
                    <Dropdown.Item>Rail Status: OK</Dropdown.Item>
                  </DropdownButton>
                  <DropdownButton title='9' variant='secondary'>
                    <Dropdown.Item>Occupied: false</Dropdown.Item>
                    <Dropdown.Item>Rail Status: OK</Dropdown.Item>
                  </DropdownButton>
                  <DropdownButton title='Station A' variant='secondary'>
                    <Dropdown.Item>Occupied: false</Dropdown.Item>
                    <Dropdown.Item>Rail Status: OK</Dropdown.Item>
                  </DropdownButton>
                </Stack>
                <Stack direction='horizontal'>
                  <DropdownButton title='11' variant='secondary'>
                    <Dropdown.Item>Occupied: false</Dropdown.Item>
                    <Dropdown.Item>Rail Status: OK</Dropdown.Item>
                  </DropdownButton>
                  <DropdownButton title='12' variant='secondary'>
                    <Dropdown.Item>Occupied: false</Dropdown.Item>
                    <Dropdown.Item>Rail Status: OK</Dropdown.Item>
                  </DropdownButton>
                  <DropdownButton title='13' variant='secondary'>
                    <Dropdown.Item>Occupied: false</Dropdown.Item>
                    <Dropdown.Item>Rail Status: OK</Dropdown.Item>
                  </DropdownButton>
                  <DropdownButton title='14' variant='secondary'>
                    <Dropdown.Item>Occupied: false</Dropdown.Item>
                    <Dropdown.Item>Rail Status: OK</Dropdown.Item>
                  </DropdownButton>
                  <DropdownButton title='Station B' variant='secondary'>
                    <Dropdown.Item>Occupied: false</Dropdown.Item>
                    <Dropdown.Item>Rail Status: OK</Dropdown.Item>
                  </DropdownButton>
                </Stack>
              </Stack>
            </Col>
          </Row>
        </Container>
      </Card>
    )
  }
}
