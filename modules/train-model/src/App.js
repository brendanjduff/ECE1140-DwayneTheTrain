import React from 'react'
import Overview from './Overview'
import Details from './Details'
import { Tabs, Tab } from 'react-bootstrap'
import TestHeader from './TestHeader'
const { ipcRenderer } = window.require('electron')

export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = { selTrain: { trainId: '' }, trains: [] }
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
    const header = testUI ? <TestHeader /> : ''
    return (
      <>
        {header}
        <Tabs defaultActiveKey='overview' className='mb-3'>
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
