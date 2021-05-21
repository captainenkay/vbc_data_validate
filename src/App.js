import { Component } from 'react';
// import {Navbar, Button, Row, Col} from 'react-bootstrap'
import Web3 from 'web3';
import "./App.css"
import homeLogoActive from "./assets/homeLogoActive.png"
import collectiblesLogo from "./assets/collectiblesLogo.png"
import aboutLogo from "./assets/aboutLogo.png"
import browseFileIcon from "./assets/browseFileIcon.png"
import publishFilesIcon from "./assets/publishFilesIcon.png"
import connectedAddressIcon from "./assets/connectedAddressIcon.png"
import verifyUserIcon from "./assets/verifyUserIcon.png"

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
      <div className = "fullPage">
        <div className = "header">
          <div className = "logo"></div>
          
          {/* Home Button */}
          <img style = {{position: "absolute",width: "20px", height: "19px", left:"475px", top: "27px"}} src = {homeLogoActive} alt="Home Logo Active"/>
          <div className = "homeText">Home</div>

          {/* Collectibles Button */}
          <img style = {{position: "absolute",width: "26px", height: "26px", left:"652px", top: "24px"}} src = {collectiblesLogo} alt="Collectibles Logo"/>
          <div className = "collectiblesText">Collectibles</div>

          {/* About Button */}
          <img style = {{position: "absolute",width: "26px", height: "26px", left:"880px", top: "24px"}} src = {aboutLogo} alt="About Logo"/>
          <div className = "aboutText">About</div>

          {/* Metamask Button */}
          <div className = "metamaskBackground"/>
          <div className = "metamaskText">{this.state.account.slice(0,10) + '...' + this.state.account.slice(38,42)}</div>
        </div>
        <div className= "applicationName">DATA VALIDATION</div>

        {/* Publish Button */}
        <div className= "publishBackground"/>
        <div className= "publishText">Publish</div>

        {/* Verify Button */}
        <div className= "verifyBackground"/>
        <div className= "verifyText">Verify</div>

        <div className= "chooseFileBackground"/>
        <img style = {{position: "absolute",width: "58px",height: "58px",left: "692px", top: "327px"}} src={browseFileIcon} alt="Browse File Icon"/>
        <div className= "dragFilesText">Drag & Drop files here to upload or</div>

        {/* Browse Files Button */}
        <div className= "browseFilesBackground"/>
        <div className= "browseFilesText">Browse file</div>

        {/* Published Files */}
        <img style ={{position: "absolute",width: "54px",height: "54px",left: "300px",top: "583px"}} src = {publishFilesIcon} alt="Publish File Icon"/>
        <div className = "number">1022012</div>
        <div className = "text">Published Files</div>

        {/* Verified Users */}
        <img style ={{position: "absolute",width: "54px",height: "54px",left: "617px",top: "583px"}} src = {verifyUserIcon} alt="Verified User Icon"/>
        <div className = "number" style ={{left: "687px"}}>1022012</div>
        <div className = "text" style ={{left: "688px"}}>Verified User</div>

        {/* Connected Address Files */}
        <img style ={{position: "absolute",width: "54px",height: "54px",left: "934px",top: "583px"}} src = {connectedAddressIcon} alt="Connected Address Icon"/>
        <div className = "number" style ={{left: "1004px"}}>1022012</div>
        <div className = "text" style ={{left: "1004px"}}>Connected Address</div>


        <div className="footer"/>
      </div>

      // <Navbar fixed= "top">
      //   <Row style={{width: "100%"}}>
      //     <Col className='col-sm-2'>
      //       <Navbar.Brand href="#home">
      //         <img src= {logo} width="30" height="30" className="d-inline-block align-top" alt="React Bootstrap logo"/>
      //       </Navbar.Brand>
      //     </Col>
      //     <Col className='col-sm-8' style={{paddingLeft: "311.08px", paddingRight: "311.08px"}}>
      //           <Button variant="success" href="#home">Home</Button>
      //           <Button variant="outline-success" href="#collectibles">Collectibles</Button>
      //           <Button variant="outline-success" href="#about">About Us</Button>
      //     </Col>
      //     <Col className='col-sm-2'>
      //       {/* <Button variant="outline-success" style={{float: "right"}}>{this.state.account.slice(0,6) + '...' + this.state.account.slice(38,42)}</Button> */}
      //     </Col>
      //   </Row>
      // </Navbar>
    );
  }
}

export default App;
