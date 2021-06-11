import { Component } from 'react';
import Web3 from 'web3';
import "./../App.css"
import "./about.css"
import homeLogo from "./../assets/homeLogo.png"
import logoVBC from "./../assets/logoVBC.png"
import collectiblesLogo from "./../assets/collectiblesLogo.png"
import aboutLogoActive from "./../assets/aboutLogoActive.png"
import {Link} from "react-router-dom"

class About extends Component {
  async componentWillMount(){
    await this.loadStorage()
    if (this.state.account !== ''){
      this.setState({connected: true})
      await this.loadWeb3()
      await this.loadBlockchainData()
    }
  }

  connectMetamask = async(event) => {
    event.preventDefault()
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  disconnectMetamask = (event) => {
    event.preventDefault()
    localStorage.removeItem('address')
    window.location.reload()
  }

  componentDidMount(){
    window.ethereum.on('accountsChanged', function (accounts) {
      localStorage.setItem('address', accounts[0])
      window.location.reload()
    });
  }

  async loadStorage(){
    if (localStorage.getItem("address") != null){
      this.setState({account: localStorage.getItem("address")})
    }
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
    this.setState({account: accounts[0], connected: true})
    localStorage.setItem('address',this.state.account)
  }

  constructor(props){
    super(props);
    this.state = {
      account: '',
      connected: false
    }
  }

  render(){
    return (
      <div className = "fullPage" style ={{background: "#000000"}}>
        <img style = {{position: "absolute", width: "159px",height: "39px",left: "75px",top: "18px"}} src = {logoVBC} alt="logo VBC"/>
        
        {/* Home Button */}
        <Link to= "/home">
          <img style = {{position: "absolute",width: "20px", height: "19px", left:"475px", top: "27px"}} src = {homeLogo} alt="Home Logo Active"/>
          <div className = "inactivePageText" style ={{left: "504px"}}>Home</div>
        </Link>

        {/* Collectibles Button */}
        <Link to= "/collectibles">
          <img style = {{position: "absolute",width: "26px", height: "26px", left:"652px", top: "24px"}} src = {collectiblesLogo} alt="Collectibles Logo"/>
          <div className = "inactivePageText" style ={{left: "684px"}}>Collectibles</div>
        </Link>

        {/* About Button */}
        <Link to= "/about">
          <img style = {{position: "absolute",width: "26px", height: "26px", left:"880px", top: "24px"}} src = {aboutLogoActive} alt="About Logo"/>
          <div className = "activePageText" style={{left: "912px"}}>About</div>
        </Link>

        {/* Metamask Button */}
        <div className = "metamaskBackground"/>
        {this.state.connected? 
        <div>
          <div className = "metamaskConnectedText" onClick = {this.disconnectMetamask}>{this.state.account.slice(0,10) + '...' + this.state.account.slice(38,42)}
            <span className="metamaskConnectedTextText">Disconnect</span>
          </div>
        </div> 
        : 
        <div>
          <div className = "metamaskText" onClick = {this.connectMetamask}> Connect metamask
            <span className="metamaskTextText">Connect</span>
          </div>
        </div>}

        <div className = "aboutBackground"/>
        <div className ="aboutTitle" >About Data Validation</div>

        <div className = "aboutDescription">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</div>

        <div className="aboutFooter"/>
      </div>
    );
  }
}

export default About;
