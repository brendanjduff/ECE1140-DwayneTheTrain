import React from 'react'
import Overview from './Overview'
import Details from './Details'
import { Tabs, Tab } from 'react-bootstrap'
import TestHeader from './TestHeader'
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
    if (!testUI) { // This block is for demonstration only
      ipcRenderer.send('createTrain', true)
      ipcRenderer.send('setClock', true)
    }
    ipcRenderer.on('resetOverview', (event, arg) => {
      this.reset += 1
      ipcRenderer.send('reset', true)
    })
  }

  componentWillUnmount () {
    ipcRenderer.removeAllListeners('fetchData')
    clearInterval(this.intervalId)
  }

  render () {
    return (
      <>
        {testUI ? <TestHeader /> : ''}
        <Tabs defaultActiveKey='overview' key={this.reset}>
          <Tab eventKey='overview' title='Overview'>
            <Overview trains={this.state.trains} />
          </Tab>
          <Tab eventKey='details' title='Details' mountOnEnter disabled={(this.state.trains.length === 0)}>
            <Details train={this.state.selTrain} trains={this.state.trains} />
          </Tab>
        </Tabs>
      </>
    )
  }
}
