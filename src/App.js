import { Component } from 'react';
import {Navbar, Button, Row, Col} from 'react-bootstrap'
import Web3 from 'web3';
import logo from './logo.svg'

class App extends Component {
  async componentWillMount(){
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum){
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    if (window.web3){
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else{
      window.alert("Please use metamask!")
    }
  }

  async loadBlockchainData(){
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({account: accounts[0]})
  }

  constructor(props){
    super(props);
    this.state = {
      account: ''
    }
  }

  render(){
    return (
      <Navbar fixed= "top">
        <Row style={{width: "100%"}}>
          <Col className='col-sm-2'>
            <Navbar.Brand href="#home">
              <img src= {logo} width="30" height="30" className="d-inline-block align-top" alt="React Bootstrap logo"/>
            </Navbar.Brand>
          </Col>
          <Col className='col-sm-8' style={{paddingLeft: "311.08px", paddingRight: "311.08px"}}>
                <Button variant="success" href="#home">Home</Button>
                <Button variant="outline-success" href="#collectibles">Collectibles</Button>
                <Button variant="outline-success" href="#about">About Us</Button>
          </Col>
          <Col className='col-sm-2'>
            <Button variant="outline-success" style={{float: "right"}}>{this.state.account.slice(0,6) + '...' + this.state.account.slice(38,42)}</Button>
          </Col>
        </Row>
      </Navbar>
    );
  }
}

export default App;
