import { Component } from 'react';
import "./../App.css"
import "./verify.css"
import closeAlert from "./../assets/closeAlert.png"
import Web3 from "web3"
import DataValidate from './../abis/DataValidate.json'
import checkIcon from "./../assets/checkIcon.png"
import crossIcon from "./../assets/crossIcon.png"



class Verify extends Component {
  async componentWillMount(){
    await this.loadData()
    await this.loadWeb3()
    await this.loadBlockchainData()
    await this.handleTxFileName()
    await this.handleTxDescription()
    await this.handletransactionData()
  }

  async loadData(){
    await this.setState({url: decodeURIComponent(window.location.href.split('?').pop())})
    await this.setState({urlLoad: this.state.url.split('#')})
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
        owner: '',
        successAlert: false,
        failAlert: false,
        barHeight: 0,
    }
  }

  handleCheckBar(min, max){
    if (this.state.barHeight >= 99) return
    var elem = document.getElementsByClassName("VerifyProgressBar");
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

  async handleVerify(){
    this.setState({isVerify: true})
    if (this.state.urlLoad[5] === this.state.transactionData[2]){
      this.handleCheckBar(0,6)
    }
    if(this.state.owner === this.state.account){
      this.setState({successAlert: true})
      let timer = await setTimeout(()=>{
        this.handleCheckBar(6,50);
        let timer1 = setTimeout(()=>{
         this.handleCheckBar(50,100)
         return clearTimeout(timer1);
        },1000)
        return clearTimeout(timer)
      },1000)
      return
    }
    this.setState({failAlert: true})
    let timer = await setTimeout(()=>{
      this.handleCheckBar(6,50);
      let timer1 = setTimeout(()=>{
       this.handleCheckBar(50,100)
       return clearTimeout(timer1);
      },1000)
      return clearTimeout(timer)
    },1000)
    return
  }

  handleRefresh = (event) => {
    event.preventDefault()
    this.setState({isVerify: false,successAlert: false, failAlert: false, barHeight: 0})
  }

  async handleTxFileName(){
    console.log(this.state.urlLoad[4])
    if (this.state.urlLoad[4].length > 15){
      this.setState({transactionFileName: this.state.urlLoad[4].slice(0,10).toLowerCase() + '... .' + this.state.urlLoad[4].split('.').pop().toLowerCase()})
    }
    else {
      this.setState({transactionFileName: this.state.urlLoad[4].toLowerCase()})
    }
  }

  async handleTxDescription(){
    if (this.state.urlLoad[6].length > 20){
      this.setState({transactionDescription: this.state.urlLoad[6].slice(0,20).toLowerCase() + '...'})
    }
    else {
      this.setState({transactionDescription: this.state.urlLoad[6].toLowerCase()})
    }
  }

  async handletransactionData(){
    this.setState({transactionHash: this.state.urlLoad[1].slice(0,18) + '...' + this.state.urlLoad[1].slice(60,66)})
  }

  render(){
    return (
      <div className = "fullPage" style = {{width: "412px" ,height:"652px"}}>
        <div class="edited-container">
          <img class="edited" src={this.state.urlLoad[5]} alt = "source"/>
        </div>
        <div className = "txDetailText" style ={{top: "340px", fontWeight: "bold", fontSize: "18px", color: "#3BCCFA"}}>File name: {this.state.transactionFileName}</div>
        <div className = "txDetailText" style ={{top: "375px"}}>Description: {this.state.transactionDescription}</div>
        <div className = "txDetailText" style ={{top: "410px"}}>Tx Hash: {this.state.transactionHash}</div>
        <div className = "txDetailText" style ={{top: "445px"}}>Block Number: {this.state.urlLoad[2]}</div>

        <div className = "verifyButton" onClick = {(() => this.handleVerify())}>
          <div className = "verifyText"> Verify</div>
        </div>
        {this.state.isVerify? 
        <div>
          <div className = "verifyBackground">
            <img class = "closeButton" style = {{left: "270px",top: "5px"}} src = {closeAlert} alt="Close alert button" onClick = {this.handleRefresh}/>
            {this.state.successAlert? 
            <div>
              <div className="VerifyProgress">
                  <div className="VerifyProgressBar"/>
              </div>

              {this.state.barHeight >= 6 ?
              <div>
                <div className = "verifyAlertText" style= {{top: "30px"}}>Valid hash</div>
                <img style = {{position: "absolute",width: "26px;",height: "26px",left: "30px",top: "30px"}} src = {checkIcon} alt="Check Icon"/>
              </div> 
              : 
              <div/>}

              {this.state.barHeight >= 50 ?
              <div>
                <div className = "verifyAlertText" style= {{top: "115px"}}>Valid owner address</div>
                <img style = {{position: "absolute",width: "26px;",height: "26px",left: "30px",top: "115px"}} src = {checkIcon} alt="Check Icon"/>
              </div> 
              : 
              <div/>}

              {this.state.barHeight >= 100 ?
              <div>
                <div className = "verifyAlertText" style= {{top: "215px"}}>You are the owner of this collectible</div>
                <img style = {{position: "absolute",width: "26px;",height: "26px",left: "30px",top: "215px"}} src = {checkIcon} alt="Check Icon"/>
              </div> 
              : 
              <div/>}
            </div> 
            : 
            <div/>}

            {this.state.failAlert? 
              <div>
              <div className="VerifyProgress">
                  <div className="VerifyProgressBar"/>
              </div>

              {this.state.barHeight >= 6 ?
              <div>
                <div className = "verifyAlertText" style= {{top: "30px"}}>Valid hash</div>
                <img style = {{position: "absolute",width: "26px;",height: "26px",left: "30px",top: "30px"}} src = {checkIcon} alt="Check Icon"/>
              </div> 
              : 
              <div/>}

              {this.state.barHeight >= 50 ?
              <div>
                <div className = "verifyAlertText" style= {{top: "115px"}}>Not valid owner address</div>
                <img style = {{position: "absolute",width: "26px;",height: "26px",left: "30px",top: "115px"}} src = {crossIcon} alt="Cross Icon"/>
              </div> 
              : 
              <div/>}

              {this.state.barHeight >= 100 ?
              <div>
                <div className = "verifyAlertText" style= {{top: "215px"}}>The owner of this collectible: {this.state.owner.slice(0,18) + '...' + this.state.owner.slice(38,42)}</div>
                <img style = {{position: "absolute",width: "26px;",height: "26px",left: "30px",top: "215px"}} src = {crossIcon} alt="Cross Icon"/>
              </div> 
              : 
              <div/>}
            </div> 
            : 
            <div/>}
          </div>
        </div> 
        : 
        <div/>}
      </div>
    );
  }
}

export default Verify;