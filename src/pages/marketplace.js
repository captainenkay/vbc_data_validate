import { Component } from 'react';
import Web3 from 'web3';
import "./../App.css"
import "./marketplace.css"
import homeLogo from "./../assets/homeLogo.png"
import logoVBC from "./../assets/logoVBC.png"
import collectiblesLine from "./../assets/collectiblesLine.png"
import collectiblesLogo from "./../assets/collectiblesLogo.png"
import collectiblesLogoActive from "./../assets/collectiblesLogoActive.png"
import detailIcon from "./../assets/detailIcon.png"
import aboutLogo from "./../assets/aboutLogo.png"
import pdfPicture from "./../assets/pdfPicture.png"
import closeAlert from "./../assets/closeAlert.png"
import {Link} from "react-router-dom"
import {Row, Col, Card, UncontrolledCollapse} from "reactstrap"
import DataValidate from './../abis/DataValidate.json'



class Marketplace extends Component {
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
    if (window.ethereum){
      await this.loadWeb3()
      await this.loadBlockchainData()
      await this.hanldeCollectibles()
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
    if (localStorage.getItem("transaction") != null){
      this.setState({transaction: JSON.parse(localStorage.getItem("transaction"))})
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
    const networkId = await web3.eth.net.getId()
    const networkData = DataValidate.networks[networkId]
    if(networkData) {
      const abi = DataValidate.abi
      const address = networkData.address
      const contract = new web3.eth.Contract(abi, address)
      this.setState({ contract })
    }
  }

  constructor(props){
    super(props);
    this.state = {
      account: '',
      contract: null,
      transaction: [],
      collapse: false,
      haveCollectibles: false,
      connected: false,
      isBuy: false,
      buyFileName: '',
      buyFileDescription: '',
      buyInitialFile: '',
      buyStatus: '',
      buyTokenID: '',
      buyOpen: '',
      owner: '',
      receiver: '',
      approveWatiting: false,
    }
    this.toggle = this.toggle.bind(this);
  }

  async hanldeCollectibles(){
    for (var i = 0 ; i < this.state.transaction.length; i++ ){
      if (this.state.transaction[i].sellable === "sellable"){
        this.setState({haveCollectibles: true})
        return
      }
    }
  }

  toggle() {
    this.setState({ collapse: !this.state.collapse });
  }

  handleRefresh = () => {
    this.setState({isBuy: false})
  }

  handleRemoveMartketplace = (event) => {
    event.preventDefault()
    for (var i = 0 ; i < this.state.transaction.length; i++ ){
      if (this.state.transaction[i].initialFile === this.state.buyInitialFile){
        // eslint-disable-next-line
        this.state.transaction[i].sellable = "non-sellable"
        localStorage.setItem('transaction', JSON.stringify(this.state.transaction))
        this.handleRefresh()
      }
    }
  }

  async handleBuyable(fileName, fileDescription, initialFile, sellable, tokenID, open){
    this.handleRefresh()
    this.setState({owner: await this.state.contract.methods.ownerOf(tokenID).call()})
    this.setState({isBuy: true, buyFileName: fileName, buyFileDescription: fileDescription, buyInitialFile: initialFile, buyStatus: sellable, buyTokenID: tokenID , buyOpen: open})
  }

  handleBuyTx(){
    for (var i = 0 ; i < this.state.transaction.length; i++ ){
      if (this.state.transaction[i].initialFile === this.state.buyInitialFile){
        // eslint-disable-next-line
        this.state.transaction[i].transfer = this.state.account
        localStorage.setItem('transaction', JSON.stringify(this.state.transaction))
        this.handleRefresh()
      }
    }
  }

  async handleApproveTx() {
    this.setState({approveWatiting: true})
    for (var i = 0 ; i < this.state.transaction.length; i++ ){
      if (this.state.transaction[i].initialFile === this.state.buyInitialFile){
        this.setState({receiver: await this.state.transaction[i].transfer})
      }
    }

    this.state.contract.methods.transferFrom(this.state.owner,this.state.receiver, this.state.buyTokenID).send({ from: this.state.owner}).once('receipt', (receipt) => {
      for (var i = 0 ; i < this.state.transaction.length; i++ ){
        if (this.state.transaction[i].tokenID === this.state.buyTokenID){
          // eslint-disable-next-line
          this.state.transaction[i].fileOwner = this.state.receiver
          // eslint-disable-next-line
          this.state.transaction[i].sellable = "non-sellable"
          // eslint-disable-next-line
          this.state.transaction[i].transfer = ""
        }
      }
      localStorage.setItem('transaction', JSON.stringify(this.state.transaction))
      this.setState({approveWatiting: false})
      this.handleRefresh()
    })
  }

  render(){
    return (
      <div style = {{width: "1440px", background: "black"}}>
        <img style = {{width: "159px",height: "39px",marginLeft: "75px", marginTop: "18px"}} src = {logoVBC} alt="logo VBC"/>

        {/* Home Button */}
        <Link to= "/home">
           <img style = {{position: "absolute",width: "20px", height: "19px", left:"375px", top: "27px"}} src = {homeLogo} alt="Home Logo"/>
           <div className = "inactivePageText" style ={{left: "404px"}}>Home</div>
        </Link>

        {/* Collectibles Button */}
        <Link to= "/collectibles">
          <img style = {{position: "absolute",width: "26px", height: "26px", left:"532px", top: "24px"}} src = {collectiblesLogo} alt="Collectibles Logo"/>
          <div className = "inactivePageText" style ={{left: "564px"}}>Collectibles</div>
        </Link>

        {/* Collectibles Button */}
        <Link to= "/marketplace">
          <img style = {{position: "absolute",width: "26px", height: "26px", left:"748px", top: "24px"}} src = {collectiblesLogoActive} alt="Collectibles Logo Active"/>
          <div className = "activePageText" style ={{left: "780px"}}>Marketplace</div>
        </Link>

        {/* About Button */}
        <Link to= "/about">
          <img style = {{position: "absolute",width: "26px", height: "26px", left:"980px", top: "24px"}} src = {aboutLogo} alt="About Logo"/>
          <div className = "inactivePageText" style={{left: "1012px"}}>About</div>
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
              if (transaction.sellable === "sellable"){
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
                        {transaction.fileOwner === this.state.account ?
                        <div>
                          {transaction.transfer === "" ? 
                          <div/> 
                          : 
                          <div>
                            <div className = "detailButtonText" style ={{left: "123px", top:"279px"}} onClick = {(() => this.handleBuyable(transaction.fileName, transaction.fileDescription, transaction.initialFile, transaction.sellable, transaction.tokenID, "Approve"))}>Approve</div>
                            <div className = "notification" style = {{position: "absolute", top: "275px", left: "175px", width: "10px", height: "10px", backgroundColor: "red", borderRadius: "15px"}}/>
                          </div>}
                          <div className = "detailButtonText" style ={{left: "223px", top:"279px"}} onClick = {(() => this.handleBuyable(transaction.fileName, transaction.fileDescription, transaction.initialFile, transaction.sellable, transaction.tokenID, "Remove"))}>Remove</div>
                        </div>
                        :
                        <div>
                          {transaction.transfer === "" ? 
                          <div className = "detailButtonText" style ={{left: "223px", top:"279px"}} onClick = {(() => this.handleBuyable(transaction.fileName, transaction.fileDescription, transaction.initialFile, transaction.sellable, transaction.tokenID, "Buy"))}>Buy</div>
                          : 
                          <div className = "detailButtonText" style ={{left: "223px", top:"279px"}}>Pending</div>} 
                        </div>}

                        <UncontrolledCollapse toggler={"#toggler" + key}>
                          <div className = "detailBackground"/>
                          <div className = "date">Minted in {transaction.date.slice(8,10)} / {transaction.date.slice(5,7)} / {transaction.date.slice(0,4)}</div>
                          <div className = "detailText">{transaction.fileDescription}</div>
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
                          <img class="editedImg" src={transaction.initialFile} alt = "source"/>
                        </div>
                        <div className= "fileName">{transaction.fileName}</div>
                        <img style = {{position: "absolute",width: "274px",height: "1px",left: "13px",top: "265px"}}src = {collectiblesLine} alt="Collectibles Line"/>
                        <div className = "detailButtonText" style ={{left: "23px", top:"279px"}} id={"toggler"+ key}>Detail</div>
                        <img style = {{position: "absolute",width: "9px",height: "5px",left: "68px",top: "285px"}}src = {detailIcon} alt="Detail icon"/>
                        {transaction.fileOwner === this.state.account ?
                        <div>
                          {transaction.transfer === "" ? 
                          <div/> 
                          : 
                          <div>
                            <div className = "detailButtonText" style ={{left: "123px", top:"279px"}} onClick = {(() => this.handleBuyable(transaction.fileName, transaction.fileDescription, transaction.initialFile, transaction.sellable, transaction.tokenID, "Approve"))}>Approve</div>
                            <div className = "notification" style = {{position: "absolute", top: "275px", left: "175px", width: "10px", height: "10px", backgroundColor: "red", borderRadius: "15px"}}/>
                          </div>}
                          <div className = "detailButtonText" style ={{left: "223px", top:"279px"}} onClick = {(() => this.handleBuyable(transaction.fileName, transaction.fileDescription, transaction.initialFile, transaction.sellable, transaction.tokenID, "Remove"))}>Remove</div>
                        </div>
                        :
                        <div>
                          {transaction.transfer === "" ? 
                          <div className = "detailButtonText" style ={{left: "223px", top:"279px"}} onClick = {(() => this.handleBuyable(transaction.fileName, transaction.fileDescription, transaction.initialFile, transaction.sellable, transaction.tokenID, "Buy"))}>Buy</div>
                          : 
                          <div className = "detailButtonText" style ={{left: "223px", top:"279px"}}>Pending</div>} 
                        </div>}
                                
                        <UncontrolledCollapse toggler={"#toggler"+ key}>
                          <div className = "detailBackground"/>
                          <div className = "date">Minted in {transaction.date.slice(8,10)} / {transaction.date.slice(5,7)} / {transaction.date.slice(0,4)}</div>
                          <div className = "detailText">{transaction.fileDescription}</div>
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
          <div style= {{width: "1440px", height: "380px"}}> 
            <div style= {{textAlign: "center", color: "#ffffff"}}>Dont have any collectible for sale </div>
          </div>
          <div className="collectiblesFooter"/>
        </div>}

        {this.state.isBuy ? 
        <div>
          <div className = "shareBackground">
            <img class = "closeButton" style = {{left: "350px",top: "20px"}} src = {closeAlert} alt="Close alert button" onClick = {this.handleRefresh}/>
            <div style = {{position: "absolute",left: "65px",top: "50px",width: "270px",height: "190px",borderRadius: "15px"}}>
              <div class="editedImg-container" style = {{borderRadius: "15px"}}>
                <img class="editedImg" src={this.state.buyInitialFile} alt = "source"/>
              </div>
            </div>
            <div className = "linkQRBackground" style = {{top: "260px", width: "270px", left: "65px", height: "120px"}}>
              <div className= "fileName" style ={{color: "black", top: "0px"}}>Owner: {this.state.owner.slice(0,18)}...</div>
              <div className= "fileName" style ={{color: "black", top: "35px"}}>File name: {this.state.buyFileName}</div>
              <div className = "fileName" style ={{color: "black", top: "70px"}}>Description: {this.state.buyFileDescription}</div>
            </div>
            {this.state.buyOpen === "Buy" ? 
            <div className = "qrSave" onClick = {(() => this.handleBuyTx())}>
              <div className = "qrSaveText" style = {{left: "58px"}}>BUY</div>
            </div>
            : 
            <div>
              {this.state.buyOpen === "Remove" ? 
              <div className = "qrSave" onClick = {this.handleRemoveMartketplace}>
                <div className = "qrSaveText" style = {{left: "40px"}}>REMOVE</div>
              </div>
              :
              <div>
                {this.state.approveWatiting ? 
                <div className = "qrSave">
                  <div class="loader" style = {{left: "65px", top: "15px"}}/>
                </div>
                : 
                <div className = "qrSave" onClick = {(() => this.handleApproveTx())}>
                  <div className = "qrSaveText" style = {{left: "35px"}}>APPROVE</div>
                </div>}
              </div>}
            </div>}
            
          </div>
        </div> 
        : 
        <div/>}
      </div>
    );
  }
}
export default Marketplace;