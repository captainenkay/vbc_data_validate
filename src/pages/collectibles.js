import { Component } from 'react';
import Web3 from 'web3';
import "./../App.css"
import "./collectibles.css"
import homeLogo from "./../assets/homeLogo.png"
import logoVBC from "./../assets/logoVBC.png"
import collectiblesLine from "./../assets/collectiblesLine.png"
import collectiblesLogoActive from "./../assets/collectiblesLogoActive.png"
import detailIcon from "./../assets/detailIcon.png"
import aboutLogo from "./../assets/aboutLogo.png"
import pdfPicture from "./../assets/pdfPicture.png"
import closeAlert from "./../assets/closeAlert.png"
import {Link} from "react-router-dom"
import {Row, Col, Card, UncontrolledCollapse} from "reactstrap"
import QRCode from "react-qr-code"

class Collectibles extends Component {
  async componentWillMount(){
    await this.loadStorage()
    if (this.state.account !== ''){
      this.setState({connected: true})
      await this.loadWeb3()
      await this.loadBlockchainData()
      await this.hanldeCollectibles()
    }
  }

  connectMetamask = async(event) => {
    event.preventDefault()
    await this.loadWeb3()
    await this.loadBlockchainData()
    await this.hanldeCollectibles()
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
    if (JSON.parse(localStorage.getItem('Transaction')) != null){
      this.setState({transaction: JSON.parse(localStorage.getItem('Transaction'))})
    }
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
    this.setState({account: accounts[0],connected: true})
    localStorage.setItem('address',this.state.account)
  }

  constructor(props){
    super(props);
    this.state = {
      account: '',
      transaction: [],
      collapse: false,
      haveCollectibles: false,
      connected: false,
      isShare: false,
      linkQR: ''
    }
    this.toggle = this.toggle.bind(this);
  }

  async hanldeCollectibles(){
    for (var i = 0 ; i < this.state.transaction.length; i++ ){
      if (this.state.transaction[i].address === this.state.account){
        this.setState({haveCollectibles: true})
        return
      }
    }
  }

  toggle() {
    this.setState({ collapse: !this.state.collapse });
  }

  handleQR(input){
    this.setState({isShare: true, linkQR: input})
    localStorage.setItem('imageLink', input)
  }

  handleRefresh = (event) => {
    event.preventDefault()
    this.setState({isShare: false, linkQR: ''})
  }

  render(){
    return (
      <div style = {{width: "100%", background: "black"}}>
        <img style = {{width: "159px",height: "39px",marginLeft: "75px", marginTop: "18px"}} src = {logoVBC} alt="logo VBC"/>

        {/* Home Button */}
        <Link to= "/home">
           <img style = {{position: "absolute",width: "20px", height: "19px", left:"475px", top: "27px"}} src = {homeLogo} alt="Home Logo Active"/>
           <div className = "inactivePageText" style ={{left: "504px"}}>Home</div>
        </Link>

        {/* Collectibles Button */}
        <Link to= "/collectibles">
          <img style = {{position: "absolute",width: "26px", height: "26px", left:"652px", top: "24px"}} src = {collectiblesLogoActive} alt="Collectibles Logo"/>
          <div className = "activePageText" style ={{left: "684px"}}>Collectibles</div>
        </Link>

        {/* About Button */}
        <Link to= "/about">
          <img style = {{position: "absolute",width: "26px", height: "26px", left:"880px", top: "24px"}} src = {aboutLogo} alt="About Logo"/>
          <div className = "inactivePageText" style={{left: "912px"}}>About</div>
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

        <div className = "content" style={{background: "black"}}>
          <Row style= {{margin: "0 0 0 0"}}>
            {this.state.transaction.map((transaction, key) => {
              if (transaction.address === this.state.account){
                if (transaction.fileName.split('.').pop().toLowerCase() === "pdf"){
                  return(
                    <Col key = {key} className = 'col-sm-3'>
                      <div className = "card" style ={{marginBottom: "112px", paddingLeft: "0px"}}>
                        <div className = "pdfBackground"/>
                        <img style = {{position: "absolute",width: "84px",height: "84px",left: "108px",top: "47px"}}src = {pdfPicture} alt="Pdf pic"/>
                        <div className= "fileName">{transaction.fileName}</div>
                        <img style = {{position: "absolute",width: "274px",height: "1px",left: "13px",top: "265px"}}src = {collectiblesLine} alt="Collectibles Line"/>
                        <div className = "detailButtonText" style ={{left: "23px", top:"279px"}} id={"toggler"+ key}>Detail</div>
                        <img style = {{position: "absolute",width: "9px",height: "5px",left: "68px",top: "285px"}}src = {detailIcon} alt="Detail icon"/>
                        <div className = "detailButtonText" style ={{left: "223px", top:"279px"}} onClick = {(() => this.handleQR(transaction.input))}>Share</div>

                        <UncontrolledCollapse toggler={"#toggler" + key}>
                          <div className = "detailBackground"/>
                          <div className = "date">Posted in {transaction.date.slice(8,10)} / {transaction.date.slice(5,7)} / {transaction.date.slice(0,4)}</div>
                          <div className = "detailText">{transaction.description}</div>
                        </UncontrolledCollapse>
                      </div>
                    </Col>
                  )
                }
                if (transaction.fileName.split('.').pop().toLowerCase() === "png" || transaction.fileName.split('.').pop().toLowerCase() === "jpg" || transaction.fileName.split('.').pop().toLowerCase() === "jpeg"){
                  return(
                    <Col key = {key} className = 'col-sm-3'>
                      <Card style ={{marginBottom: "112px", paddingLeft: "0px"}}>
                        <div class="editedImg-container">
                          <img class="editedImg" src={'https:ipfs.infura.io/ipfs/' + transaction.initialIpfs} alt = "source"/>
                        </div>
                        <div className= "fileName">{transaction.fileName}</div>
                        <img style = {{position: "absolute",width: "274px",height: "1px",left: "13px",top: "265px"}}src = {collectiblesLine} alt="Collectibles Line"/>
                        <div className = "detailButtonText" style ={{left: "23px", top:"279px"}} id={"toggler"+ key}>Detail</div>
                        <img style = {{position: "absolute",width: "9px",height: "5px",left: "68px",top: "285px"}}src = {detailIcon} alt="Detail icon"/>
                        <div className = "detailButtonText" style ={{left: "223px", top:"279px"}} onClick = {(() => this.handleQR(transaction.input))}>Share</div>
                                
                        <UncontrolledCollapse toggler={"#toggler"+ key}>
                          <div className = "detailBackground"/>
                          <div className = "date">Posted in {transaction.date.slice(8,10)} / {transaction.date.slice(5,7)} / {transaction.date.slice(0,4)}</div>
                          <div className = "detailText">{transaction.description}</div>
                        </UncontrolledCollapse>
                      </Card>
                    </Col>
                  )
                }
              }
              return(<div/>)
            })}
          </Row>
        </div>
        {this.state.haveCollectibles ? 
        <div>
          <div className="collectiblesFooter"/>
        </div> 
        : 
        <div>
          <div style= {{width: "100%", height: "380px"}}> 
            <div style= {{textAlign: "center", color: "#ffffff"}}>You dont have any collectibles </div>
          </div>
          <div className="collectiblesFooter"/>
        </div>}

        {this.state.isShare ? 
        <div>
          <div className = "shareBackground">
            <img class = "closeButton" style = {{left: "1220px",top: "40px"}} src = {closeAlert} alt="Close alert button" onClick = {this.handleRefresh}/>
            <QRCode
            value = {'https:ipfs.infura.io/ipfs/' + this.state.linkQR}
            size = {200}
            />
          </div>
        </div> 
        : 
        <div/>}
      </div>
    );
  }
}
export default Collectibles;