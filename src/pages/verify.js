import { Component } from 'react';
import "./verify.css"
import closeAlert from "./../assets/closeAlert.png"
import Web3 from "web3"
import DataValidate from './../abis/DataValidate.json'
import checkIcon from "./../assets/checkIcon.png"
import crossIcon from "./../assets/crossIcon.png"
import logoVBC from "./../assets/logoVBC.png"
import bigCheckIcon from "./../assets/bigCheckIcon.png"

class Verify extends Component {
  async componentWillMount(){
    await this.loadData()
    await this.handleTxFileName()
    await this.handleTxDescription()
    await this.handleFile()
  }

  async loadData(){
    await this.setState({url: decodeURIComponent(window.location.href.split('?').pop())})
    await this.setState({urlLoad: this.state.url.split('#')})
    if (this.state.url === '' || this.state.urlLoad === []){
      alert("This is an invalid url")
      return
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
      alert("Please use metamask!")
    }
  }

  async loadBlockchainData(){
    this.setState({canVerify: true})
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({account: accounts[0],connected: true})
    const networkId = await web3.eth.net.getId()
    const networkData = DataValidate.networks[networkId]
    if(networkData) {
      const abi = DataValidate.abi
      const address = networkData.address
      const contract = new web3.eth.Contract(abi, address)
      const data = await contract.methods.dataValidateTransactionDetails(this.state.urlLoad[3] - 1).call()
      this.setState({owner: await contract.methods.ownerOf(this.state.urlLoad[3]).call(), transactionData: data.split("#")}) 
    }
    else{
      alert("smart contract do not deploy to detect network")
    }
    alert("loading data success")
  }

  async componentDidMount(){
    if (window.ethereum){
      window.ethereum.on('accountsChanged', function (accounts){
        localStorage.setItem('address', accounts[0])
        window.location.reload()
      });
    }
  }

  constructor(props){
    super(props)
    this.state = {
        url: '',
        isVerify: false,
        transactionData: [],
        urlLoad: [],
        transactionHash: '',
        transactionDescription: '',
        transactionFileName: '',
        transactionOwner: '',
        owner: '',
        successAlert: false,
        failAlert: false,
        barHeight: 0,
        verifyEndTrue: false,
        verifyEndFalse: false,
        verifyEnd: false,
        fileOwner: '',
        canVerify: false,
        fileHash: '',
        fileCerificateHash: '',
    }
  }

  handleCheckBar(min, max){
    if (this.state.barHeight >= 99) return
    var elem = document.getElementsByClassName("verifyProgressBar");
    var height = min;
    var id = setInterval(() => {
      if(height >= max){
        this.setState({barHeight: max})
        clearInterval(id)
      }
      else{
        height++;
        elem[0].style.height = height + "%"
      }
    } , 20);
  }

  async handleVerifyAgain(){
    await this.handleRefresh()
    await this.handleVerify()
  }

  connectMetamask = async(event) => {
    event.preventDefault()
    if (window.ethereum){
      await this.loadWeb3()
      await this.loadBlockchainData()
      await this.handleTxOwner()
    }
    else{
      alert("this device dont have metamask extension")
    }
  }

  async handleVerify(){
    this.setState({isVerify: true})
    if (this.state.urlLoad[5] === this.state.transactionData[2] && this.state.urlLoad[7] === this.state.transactionData[3]){
      this.handleCheckBar(0,8)
      if(this.state.owner === this.state.account){
        this.setState({successAlert: true})
        let timer = await setTimeout(()=>{
          this.handleCheckBar(8,54);
          let timer1 = setTimeout(()=>{
           this.handleCheckBar(54,100)
           return clearTimeout(timer1);
          },1000)
          return clearTimeout(timer)
        },1000)
        await setTimeout(()=>{
          this.setState({verifyEndTrue: true, verifyEnd: true})
        },3000)
        return
      }
      this.setState({failAlert: true})
      let timer = await setTimeout(()=>{
        this.handleCheckBar(8,54);
        let timer1 = setTimeout(()=>{
         this.handleCheckBar(54,100)
         return clearTimeout(timer1);
        },1000)
        return clearTimeout(timer)
      },1000)
      await setTimeout(()=>{
        this.setState({verifyEndFalse: true, verifyEnd: true})
      },3000)
      return
    }
    let timer = await setTimeout(()=>{
      this.handleCheckBar(0,6);
      let timer1 = setTimeout(()=>{
       this.handleCheckBar(6,100)
       return clearTimeout(timer1);
      },1000)
      return clearTimeout(timer)
    },1000)
    this.setState({hashFailAlert: true, verifyEnd: true})
    return
  }
    

  handleRefresh = () => {
    this.setState({isVerify: false, successAlert: false, failAlert: false, barHeight: 0})
  }

  async handleTxFileName(){
    if (this.state.urlLoad[4] === ""){
      alert("This is an invalid url")
      return
    }

    if (window.innerWidth < 1024){
      if (this.state.urlLoad[4].length < 15){
        this.setState({transactionFileName: this.state.urlLoad[4].toLowerCase()})
        return
      }
      this.setState({transactionFileName: this.state.urlLoad[4].slice(0,10).toLowerCase() + '... .' + this.state.urlLoad[4].split('.').pop().toLowerCase()})
      return
    }
    this.setState({transactionFileName: this.state.urlLoad[4].toLowerCase()})
  }

  async handleTxDescription(){
    if (window.innerWidth < 1024){
      this.setState({transactionDescription: this.state.urlLoad[6].slice(0,20).toLowerCase() + '...'})
      return
    }
    this.setState({transactionDescription: this.state.urlLoad[6].toLowerCase()})
  }

  async handleTxOwner(){
    if (window.innerWidth < 1024){
      this.setState({transactionOwner: this.state.owner.slice(0,18) + '...' + this.state.owner.slice(38,42)})
      return
    }
    this.setState({transactionOwner: this.state.owner})
  }

  async handleFile(){
    if (this.state.urlLoad[5] === "" || this.state.urlLoad[7] === "" || this.state.urlLoad[8] === ""){
      alert("This is an invalid url")
      return
    }

    if (window.innerWidth < 1024){
      this.setState({fileOwner: this.state.urlLoad[8].slice(0,18) + '...' + this.state.urlLoad[8].slice(38,42), fileHash: this.state.urlLoad[5].split("/")[4].slice(0,18), fileCerificateHash: this.state.urlLoad[7].split("/")[4].slice(0,18), transactionHash: this.state.urlLoad[1].slice(0,18) + '...' + this.state.urlLoad[1].slice(60,66)})
      return
    }
    this.setState({fileOwner: this.state.urlLoad[8], fileHash: this.state.urlLoad[5].split("/")[4], fileCerificateHash: this.state.urlLoad[7].split("/")[4], transactionHash: this.state.urlLoad[1]})
  }

  render(){
    return (
      <div id = "screen" style ={{height: "100vh", width: "100%"}}>
        <div class="edited-container">
          <img class="edited" src={this.state.urlLoad[5]} alt = "source"/>
        </div>
        <img className = "applicationLogo" src = {logoVBC} alt="logo VBC"/>
        <div className = "txDetailFileName">File name: {this.state.transactionFileName}</div>

        {this.state.verifyEnd ? 
        <div>
          {this.state.verifyEndTrue ?
          <div>
            <div className = "txDetailText" style = {{color: "green" , fontWeight: "bold"}}>File owner: {this.state.transactionOwner} </div>
            <img className = "bigCheckIcon" src = {bigCheckIcon} alt="Big Check Icon"/>
            <div className = "txDetailText" style = {{color: "green"}}>File hash: {this.state.fileHash}</div>
            <div className = "txDetailText" style = {{color: "green"}}>Certificate hash: {this.state.fileCerificateHash}</div>
          </div>
          :
          <div/>}

          {this.state.verifyEndFalse ?
          <div>
            <div className = "txDetailText" style = {{color: "red", fontWeight: "bold"}}>File owner: {this.state.transactionOwner}</div>
            <div className = "txDetailText" style = {{color: "green"}}>File hash: {this.state.fileHash}</div>
            <div className = "txDetailText" style = {{color: "green"}}>Certificate hash: {this.state.fileCerificateHash}</div>
          </div>
          :
          <div/>}

          {this.state.hashFailAlert ?
          <div>
            <div className = "txDetailText" style = {{fontWeight: "bold"}}>File owner: {this.state.transactionOwner}</div>
            <div className = "txDetailText" style = {{color: "red"}}>File hash: {this.state.fileHash}</div>
            <div className = "txDetailText" style = {{color: "red"}}>Certificate hash: {this.state.fileCerificateHash}</div>
          </div>
          :
          <div/>}
        </div>
      : 
        <div>
          <div className = "txDetailText" style = {{fontWeight: "bold"}}>File owner: {this.state.fileOwner}</div>
          <div className = "txDetailText">File hash: {this.state.fileHash}</div>
          <div className = "txDetailText">Certificate hash: {this.state.fileCerificateHash}</div>
        </div>
        }
        
        <div className = "txDetailText">Description: {this.state.transactionDescription}</div>
        <div className = "txDetailText">
          <a target="_blank" rel="noopener noreferrer" href={'https://testnet.bscscan.com/tx/' + this.state.urlLoad[1]}>
          Tx Hash: {this.state.transactionHash}
          </a>
        </div>
        <div className = "txDetailText">Block Number: {this.state.urlLoad[2]}</div>
        
        {this.state.isVerify? 
        <div style = {{width: "100%", height: "100%"}}>
          <div className = "verifyBackground">
            <img class = "verifyCloseButton" src = {closeAlert} alt = "Close alert button" onClick = {this.handleRefresh}/>
            <div className="verifyProgress">
              <div className="verifyProgressBar"/>
            </div>
            {this.state.successAlert? 
            <div className = "verifyDetail">
              {this.state.barHeight >= 8 ?
              <div>
                <div className = "verifyAlertText1">Valid hash & valid certificate</div>
                <img className='checkBoxVerify1' src = {checkIcon} alt="Check Icon"/>
              </div> 
              : 
              <div/>}

              {this.state.barHeight === 54 ?
              <div>
                <div className = "verifyAlertText2">Valid owner address</div>
                <img className = "checkBoxVerify2" src = {checkIcon} alt="Check Icon"/>
              </div> 
              : 
              <div/>}

              {this.state.barHeight >= 100 ?
              <div>
                <div className = "verifyAlertText3">Valid owner address</div>
                <img className = "checkBoxVerify2" src = {checkIcon} alt="Check Icon"/>
                <div className = "verifyAlertText3" style ={{color: "#1FA7EA", fontWeight: "bold"}}>You are the owner of this collectible</div>
                <img className = "checkBoxVerify3" src = {checkIcon} alt="Check Icon"/>
              </div> 
              : 
              <div/>}
            </div> 
            : 
            <div/>}

            {this.state.failAlert? 
            <div className = "verifyDetail">
              {this.state.barHeight >= 8 ?
              <div>
                <div className = "verifyAlertText1">Valid hash & valid certificate</div>
                <img className='checkBoxVerify1' src = {checkIcon} alt="Check Icon"/>
              </div> 
              : 
              <div/>}

              {this.state.barHeight === 54 ?
              <div>
                <div className = "verifyAlertText2" style = {{color: "#F84949"}}>Invalid owner address</div>
                <img className = "checkBoxVerify2" src = {crossIcon} alt="Cross Icon"/>
              </div> 
              : 
              <div/>}

              {this.state.barHeight >= 100 ?
              <div>
                <div className = "verifyAlertText4" style = {{color: "#F84949"}}>Invalid owner address</div>
                <img className = "checkBoxVerify2" src = {crossIcon} alt="Cross Icon"/>
                <div className = "verifyAlertText4">The owner of this collectible is {this.state.transactionOwner}</div>
                <img className = "checkBoxVerify3" src = {crossIcon} alt="Cross Icon"/>
              </div> 
              : 
              <div/>}
            </div> 
            : 
            <div/>}

            {this.state.hashFailAlert?
            <div className = "verifyDetail">
              {this.state.barHeight >= 6 ?
              <div>
                <div className = "verifyAlertText1" style = {{color: "#F84949"}}>Invalid hash</div>
                <img className='checkBoxVerify1' src = {crossIcon} alt="Cross Icon"/>
              </div> 
              : 
              <div/>}

              {this.state.barHeight >= 100 ?
              <div>
                <div className = "verifyAlertText5" style ={{color: "#F84949", fontWeight:"bold"}}>This is not a valid hash</div>
                <img className='checkBoxVerify3' src = {crossIcon} alt="Cross Icon"/>
              </div> 
              : 
              <div/>}
            </div> 
            : 
            <div/>}
          </div>
        </div> 
        : 
        <div>
          <div className = "verifyButton">
            {this.state.canVerify ? 
            <div className = "verifyText" onClick = {(() => this.handleVerify())}>
              {this.state.verifyEnd ? 
              <div > Verify again </div>
              : 
              <div> Verify</div>}
            </div>
            : 
            <div className = "verifyText" onClick = {this.connectMetamask}> Connect </div>
            }
            </div>
        </div>
        }
      </div>
    );
  }
}

export default Verify;