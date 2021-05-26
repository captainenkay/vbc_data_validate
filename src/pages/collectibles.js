import { Component } from 'react';
import Web3 from 'web3';
import "./../App.css"
import "./collectibles.css"
import homeLogo from "./../assets/homeLogo.png"
import logoVBC from "./../assets/logoVBC.png"
import collectiblesLogoActive from "./../assets/collectiblesLogoActive.png"
import aboutLogo from "./../assets/aboutLogo.png"
import {Link} from "react-router-dom"

class Collectibles extends Component {
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
        <img style = {{position: "absolute", width: "159px",height: "39px",left: "75px",top: "18px"}} src = {logoVBC} alt="logo VBC"/>
        
        {/* Home Button */}
        <Link to= "/home">
          <img style = {{position: "absolute",width: "20px", height: "19px", left:"475px", top: "27px"}} src = {homeLogo} alt="Home Logo Active"/>
          <div className = "inactiveText" style ={{left: "504px"}}>Home</div>
        </Link>

        {/* Collectibles Button */}
        <Link to= "/collectibles">
          <img style = {{position: "absolute",width: "26px", height: "26px", left:"652px", top: "24px"}} src = {collectiblesLogoActive} alt="Collectibles Logo"/>
          <div className = "activeText" style ={{left: "684px"}}>Collectibles</div>
        </Link>

        {/* About Button */}
        <Link to= "/about">
          <img style = {{position: "absolute",width: "26px", height: "26px", left:"880px", top: "24px"}} src = {aboutLogo} alt="About Logo"/>
          <div className = "inactiveText" style={{left: "912px"}}>About</div>
        </Link>

        {/* Metamask Button */}
        <div className = "metamaskBackground"/>
        <div className = "metamaskText">{this.state.account.slice(0,10) + '...' + this.state.account.slice(38,42)}</div>

        <div className = "card">
          <div className = "fileName">This file name</div>
        </div>

        <div className="footer"/>
      </div>
    );
  }
}

export default Collectibles;
