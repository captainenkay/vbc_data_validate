import { Component } from 'react';
import Web3 from 'web3';
import "./../App.css"
import homeLogo from "./../assets/homeLogo.png"
import collectiblesLogo from "./../assets/collectiblesLogo.png"
import aboutLogoActive from "./../assets/aboutLogoActive.png"
import {Link} from "react-router-dom"

class About extends Component {
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
          <Link to= "/home">
            <img style = {{position: "absolute",width: "20px", height: "19px", left:"475px", top: "27px"}} src = {homeLogo} alt="Home Logo Active"/>
            <div className = "inactiveText" style ={{left: "504px"}}>Home</div>
          </Link>

          {/* Collectibles Button */}
          <Link to= "/collectibles">
            <img style = {{position: "absolute",width: "26px", height: "26px", left:"652px", top: "24px"}} src = {collectiblesLogo} alt="Collectibles Logo"/>
            <div className = "inactiveText" style ={{left: "684px"}}>Collectibles</div>
          </Link>

          {/* About Button */}
          <Link to= "/about">
            <img style = {{position: "absolute",width: "26px", height: "26px", left:"880px", top: "24px"}} src = {aboutLogoActive} alt="About Logo"/>
            <div className = "activeText" style={{left: "912px"}}>About</div>
          </Link>

          {/* Metamask Button */}
          <div className = "metamaskBackground"/>
          <div className = "metamaskText">{this.state.account.slice(0,10) + '...' + this.state.account.slice(38,42)}</div>
        </div>
        <div className="footer"/>
      </div>
    );
  }
}

export default About;
