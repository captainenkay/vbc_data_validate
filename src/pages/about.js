import { Component } from 'react';
import Web3 from 'web3';
import "./about.css"
import "./../App.css"
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
    if (window.ethereum){
      await this.loadWeb3()
      await this.loadBlockchainData()
    }
    else{
      alert("this device dont have metamask extension")
    }
  }

  disconnectMetamask = (event) => {
    event.preventDefault()
    localStorage.removeItem('address')
    window.location.reload()
  }

  componentDidMount(){
    if (window.ethereum){
      window.ethereum.on('accountsChanged', function (accounts) {
        localStorage.setItem('address', accounts[0])
        window.location.reload()
      });
    }
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
      <div className = "fullPage">
        <img className = "logoVBC" src = {logoVBC} alt="logo VBC"/>
        
        <Link to= "/home">
          <img className = "navigationIcon" style ={{left: "26.0416666667%"}} src = {homeLogo} alt="Home Logo"/>
          <div className = "inactiveNavigationText" style ={{left: "28%"}}>Home</div>
        </Link>

        <Link to= "/collectibles">
          <img className = "navigationIcon" style = {{width: "1.80555555556%", top: "2.8%", left: "36.9444444444%"}} src = {collectiblesLogo} alt="Collectibles Logo"/>
          <div className = "inactiveNavigationText" style ={{left: "39.1666666667%"}}>Collectibles</div>
        </Link>

        <Link to= "/marketplace">
          <img className = "navigationIcon" style = {{width: "1.80555555556%", top: "2.8%", left: "51.9444444444%"}} src = {collectiblesLogo} alt="Collectibles Logo"/>
          <div className = "inactiveNavigationText" style ={{left: "54.1666666667%"}}>Marketplace</div>
        </Link>

        <Link to= "/about">
          <img className = "navigationIcon" style = {{width: "1.80555555556%", top: "2.8%", left: "68.0555555556%"}} src = {aboutLogoActive} alt="About Logo Active"/>
          <div className = "activeNavigationText" style={{left: "70.2777777778%"}}>About</div>
        </Link>

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

        <div className="footer"/>
      </div>
    );
  }
}

export default About;
