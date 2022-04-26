import React from 'react'
import Overview from './Overview'
import Details from './Details'
import { Tabs, Tab } from 'react-bootstrap'
const { ipcRenderer } = window.require('electron')

export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = { reset: false, selTrain: { trainId: '' }, trains: [] }
    this.reset = 0
  }

  componentDidMount () {
    ipcRenderer.on('fetchData', (event, arg) => {
      this.setState({ selTrain: arg.sel, trains: arg.trains })
    })
    this.intervalId = setInterval(() => { ipcRenderer.send('requestData') }, 1000 / updateRate)
  }

  componentWillUnmount () {
    ipcRenderer.removeAllListeners('fetchData')
    clearInterval(this.intervalId)
  }

  render () {
    return (
      <Tabs defaultActiveKey='overview' key={this.reset}>
        <Tab eventKey='overview' title='Overview'>
          <Overview trains={this.state.trains} />
        </Tab>
        <Tab eventKey='details' title='Details' mountOnEnter disabled={(this.state.trains.length === 0)}>
          <Details train={this.state.selTrain} trains={this.state.trains} />
        </Tab>
      </Tabs>
    )
  }
}
