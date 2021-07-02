import { Component } from 'react';
import Web3 from 'web3';
import "./../App.css"
import "./collectibles"
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
import {Row, Col, UncontrolledCollapse} from "reactstrap"
import DataValidate from './../abis/DataValidate.json'



class Marketplace extends Component {
  async componentWillMount(){
    await this.loadStorage()
    await this.hanldeCollectibles()
    if (this.state.account !== ''){
      this.setState({connected: true})
      await this.loadWeb3()
      await this.loadBlockchainData()
    }
  }

  connectMetamask = async(event) => {
    event.preventDefault()
    if (window.ethereum){
      await this.hanldeCollectibles()
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
          <img className = "navigationIcon" style = {{width: "1.80555555556%", top: "2.8%", left: "51.9444444444%"}} src = {collectiblesLogoActive} alt="Collectibles Logo Active"/>
          <div className = "activeNavigationText" style ={{left: "54.1666666667%"}}>Marketplace</div>
        </Link>

        <Link to= "/about">
          <img className = "navigationIcon" style = {{width: "1.80555555556%", top: "2.8%", left: "68.0555555556%"}} src = {aboutLogo} alt="About Logo"/>
          <div className = "inactiveNavigationText" style={{left: "70.2777777778%"}}>About</div>
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

        <div className = "content">
          <Row style= {{margin: "0 0 0 0"}}>
            {this.state.transaction.map((transaction, key) => {
              if (transaction.sellable === "sellable"){
                if (transaction.fileName.split('.').pop().toLowerCase() === "pdf"){
                  return(
                    <Col key = {key} className = 'col-sm-3' style ={{paddingLeft: "0%"}}>
                      <div className = "card" style ={{marginBottom: "36.363636363%"}}>
                      <div className = "pdfBackground"/>
                        <img style = {{position: "absolute",width: "28%",height: "auto",left: "36%",top: "18%"}}src = {pdfPicture} alt="Pdf pic"/>
                        <div className= "fileName">{transaction.fileName}</div>
                        <img style = {{position: "absolute",width: "90%",height: "0.324675324%",left: "5%",top: "85%"}}src = {collectiblesLine} alt="Collectibles Line"/>
                        <div className = "detailButtonText" style ={{left: "7.666666666%", top:"90%"}} id={"toggler"+ key}>Detail</div>
                        <img style = {{position: "absolute",width: "3%",height: "auto",left: "22.666666666%",top: "91.5%"}}src = {detailIcon} alt="Detail icon"/>
                        {transaction.fileOwner === this.state.account ?
                        <div>
                          {transaction.transfer === "" ? 
                          <div/> 
                          : 
                          <div>
                            <div className = "detailButtonText" style ={{left: "41%", top:"90%"}} onClick = {(() => this.handleBuyable(transaction.fileName, transaction.fileDescription, transaction.initialFile, transaction.sellable, transaction.tokenID, "Approve"))}>Approve</div>
                            <div className = "notification" style = {{position: "absolute", top: "89%", left: "58.333333333%", width: "3.333333333%", height: "1.1vh", backgroundColor: "red", borderRadius: "15px"}}/>
                          </div>}
                          <div className = "detailButtonText" style ={{left: "74.333333333%", top:"90%"}} onClick = {(() => this.handleBuyable(transaction.fileName, transaction.fileDescription, transaction.initialFile, transaction.sellable, transaction.tokenID, "Remove"))}>Remove</div>
                        </div>
                        :
                        <div>
                          {transaction.transfer === "" ? 
                          <div className = "detailButtonText" style ={{left: "74.333333333%", top:"90%"}} onClick = {(() => this.handleBuyable(transaction.fileName, transaction.fileDescription, transaction.initialFile, transaction.sellable, transaction.tokenID, "Buy"))}>Buy</div>
                          : 
                          <div className = "detailButtonText" style ={{left: "74.333333333%", top:"90%"}}>Pending</div>} 
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
                    <Col key = {key} className = 'col-sm-3' style ={{paddingLeft: "0%"}}>
                      <div className = "card" style ={{marginBottom: "36.363636363%"}}>
                      <div class="editedImg-container">
                          <img class="editedImg" src={transaction.initialFile} alt = "source"/>
                        </div>
                        <div className= "fileName">{transaction.fileName}</div>
                        <img style = {{position: "absolute",width: "90%",height: "0.324675324%",left: "5%",top: "85%"}}src = {collectiblesLine} alt="Collectibles Line"/>
                        <div className = "detailButtonText" style ={{left: "7.666666666%", top:"90%"}} id={"toggler"+ key}>Detail</div>
                        <img style = {{position: "absolute",width: "3%",height: "auto",left: "22.666666666%",top: "91.5%"}}src = {detailIcon} alt="Detail icon"/>
                        {transaction.fileOwner === this.state.account ?
                        <div>
                          {transaction.transfer === "" ? 
                          <div/> 
                          : 
                          <div>
                            <div className = "detailButtonText" style ={{left: "41%", top:"90%"}} onClick = {(() => this.handleBuyable(transaction.fileName, transaction.fileDescription, transaction.initialFile, transaction.sellable, transaction.tokenID, "Approve"))}>Approve</div>
                            <div className = "notification" style = {{position: "absolute", top: "89%", left: "58.333333333%", width: "3.333333333%", height: "1.1vh", backgroundColor: "red", borderRadius: "15px"}}/>
                          </div>}
                          <div className = "detailButtonText" style ={{left: "74.333333333%", top:"90%"}} onClick = {(() => this.handleBuyable(transaction.fileName, transaction.fileDescription, transaction.initialFile, transaction.sellable, transaction.tokenID, "Remove"))}>Remove</div>
                        </div>
                        :
                        <div>
                          {transaction.transfer === "" ? 
                          <div className = "detailButtonText" style ={{left: "74.333333333%", top:"90%"}} onClick = {(() => this.handleBuyable(transaction.fileName, transaction.fileDescription, transaction.initialFile, transaction.sellable, transaction.tokenID, "Buy"))}>Buy</div>
                          : 
                          <div className = "detailButtonText" style ={{left: "74.333333333%", top:"90%"}}>Pending</div>} 
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
              }
              return(<div/>)
            })}
          </Row>
        </div>
        {this.state.haveCollectibles ? 
        <div/>
        : 
        <div>
          <div style= {{position: "absolute", top: "25%",width: "100%"}}> 
            <div style= {{fontFamily: "Open Sans",fontStyle: "normal",fontWeight: "bold",fontSize: "1.3vw",textAlign: "center", color: "#ffffff"}}>You dont have any collectibles </div>
          </div>
          <div className="footer"/>
        </div>}

        {this.state.isBuy ? 
        <div>
          <div className = "shareBackground">
          <img className = "closeButton" style = {{width: "5%", height: "auto",left: "90%",top: "3%"}} src = {closeAlert} alt="Close alert button" onClick = {this.handleRefresh}/>
            <div style = {{position: "absolute",left: "16.25%",top: "10%",width: "67.5%",height: "38%",borderRadius: "15px"}}>
              {this.state.buyFileName.split('.').pop().toLowerCase() === "pdf" ? 
              <div>
                <div className = "pdfBackground" style = {{height: "100%", borderRadius: "15px"}}/>
                <img style = {{position: "absolute",width: "28%",height: "auto",left: "36%",top: "18%"}}src = {pdfPicture} alt="Pdf pic"/>
              </div> 
              : 
              <div class="editedImg-container" style = {{height: "100%",borderRadius: "15px"}}>
                <img class="editedImg" src={this.state.buyInitialFile} alt = "source"/>
              </div>}
            </div>
            <div className = "linkQRBackground" style = {{top: "52%", width: "67.5%", left: "16.25%", height: "24%"}}>
              <div className= "fileName" style ={{color: "black", top: "5%"}}>Owner: {this.state.owner.slice(0,18)}...</div>
              <div className= "fileName" style ={{color: "black", top: "35%"}}>File name: {this.state.buyFileName}</div>
              <div className = "fileName" style ={{color: "black", top: "60%"}}>Description: {this.state.buyFileDescription}</div>
            </div>
            {this.state.buyOpen === "Buy" ? 
            <div className = "qrSave" onClick = {(() => this.handleBuyTx())}>
              <div className = "qrSaveText" style = {{left: "38.666666666%"}}>BUY</div>
            </div>
            : 
            <div>
              {this.state.buyOpen === "Remove" ? 
              <div className = "qrSave" onClick = {this.handleRemoveMartketplace}>
                <div className = "qrSaveText" style = {{left: "26.666666666%"}}>REMOVE</div>
              </div>
              :
              <div>
                {this.state.approveWatiting ? 
                <div className = "qrSave">
                  <div class="loader" style = {{left: "43.333333333%", top: "30%",width: "20px", height: "20px"}}/>
                </div>
                : 
                <div className = "qrSave" onClick = {(() => this.handleApproveTx())}>
                  <div className = "qrSaveText" style = {{left: "23.333333333%"}}>APPROVE</div>
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