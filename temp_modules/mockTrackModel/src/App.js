import React from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import Details from './Details'
const { ipcRenderer } = window.require('electron')

export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = { selTrain: { trainId: '' }, trains: [] }
  }

  componentDidMount () {
    ipcRenderer.on('fetch', (event, arg) => {
      this.setState({ selTrain: arg.sel, trains: arg.trains })
    })
    this.intervalId = setInterval(() => { ipcRenderer.send('request') }, 1000 / updateRate)
  }

  componentWillUnmount () {
    ipcRenderer.removeAllListeners('fetch')
    clearInterval(this.intervalId)
  }

  render () {
    return (
        <><Tabs defaultActiveKey='overview' key={this.reset}>
          <Tab eventKey='overview' title='Overview'>
            <p>Number of Trains: {this.state.trains.length}</p>
          </Tab>
          <Tab eventKey='details' title='Details' mountOnEnter disabled={(this.state.trains.length === 0)}>
          <Details train={this.state.selTrain} trains={this.state.trains} />
          </Tab>
        </Tabs></>
    )
  }
}
