import { Component } from 'react';
import Web3 from 'web3';
import "./../App.css"
import homeLogo from "./../assets/homeLogo.png"
import collectiblesLogo from "./../assets/collectiblesLogo.png"
import aboutLogo from "./../assets/aboutLogo.png"
import browseFileIcon from "./../assets/browseFileIcon.png"
import publishFilesIcon from "./../assets/publishFilesIcon.png"
import connectedAddressIcon from "./../assets/connectedAddressIcon.png"
import verifyUserIcon from "./../assets/verifyUserIcon.png"
import closeAlert from "./../assets/closeAlert.png"
import line from "./../assets/line.png"
import checkIcon from "./../assets/checkIcon.png"
import crossIcon from "./../assets/crossIcon.png"
import bigCheckIcon from "./../assets/bigCheckIcon.png"
import bigCrossIcon from "./../assets/bigCrossIcon.png"
import logoVBC from "./../assets/logoVBC.png"
import fileImage from "./../assets/fileImage.png"
import {Link} from "react-router-dom"
import DataValidate from './../abis/DataValidate.json'
import Dropzone from 'react-dropzone'

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })


class Verify extends Component {
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
    window.ethereum.on('accountsChanged', function (accounts){
      localStorage.setItem('address', accounts[0])
      window.location.reload()
    });
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

  async loadStorage(){
    if (JSON.parse(localStorage.getItem('Transaction')) != null){
      this.setState({transaction: JSON.parse(localStorage.getItem('Transaction'))})
    }

    if (localStorage.getItem('verifiedFiles') != null){
      this.setState({verifiedFiles: localStorage.getItem('verifiedFiles')})
    }

    if (JSON.parse(localStorage.getItem('connectedAddress') != null)){
      this.setState({connectedAddress: JSON.parse(localStorage.getItem('connectedAddress'))})
    }
    if (localStorage.getItem("address") != null){
      this.setState({account: localStorage.getItem("address")})
    }
  }

  async loadBlockchainData(){
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({account: accounts[0], connected: true})
    localStorage.setItem('address',this.state.account)
    const networkId = await web3.eth.net.getId()
    const networkData = DataValidate.networks[networkId]
    if(networkData) {
      const abi = DataValidate.abi
      const address = networkData.address
      const contract = new web3.eth.Contract(abi, address)
      this.setState({ contract })
      const totalSupply = await contract.methods.totalSupply().call()
      this.setState({ totalSupply })
      for (var i = 1; i <= totalSupply; i++) {
        const hash = await contract.methods.dataValidateHashes(i - 1).call()
        this.setState({
          hashes: [...this.state.hashes, hash]
        })
      }
    }
    else{
      window.alert("smart contract do not deploy to detect network")
    }
  }

  handleCheckBar(min, max){
    if (this.state.barHeight >= 99) return
    var elem = document.getElementsByClassName("ProgressBar");
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

  constructor(props){
    super(props);
    this.state = {
      account: '',
      buffer: null,
      contract: null,
      totalSupply: 0,
      hashes: [],
      transaction: [],
      fileName: '',
      isUploaded: false,
      isPublished: false,
      verifiedFiles: 0,
      connectedAddress: [],
      fileSize: '',
      successAlert: false,
      failAlert: false,
      transactionLink: '',
      connected: false,
      barHeight: 0,
      alertBackground: false,
      description: '',
    }
    this.handleTextChange = this.handleTextChange.bind(this);
  }

  handleRefresh = (event) => {
    event.preventDefault()
    this.setState({isUploaded: false, successAlert: false, failAlert: false, barHeight: 0, alertBackground: false, description: '', transactionLink: ''})
  }

  handleTextChange(event) {
    this.setState({description: event.target.value})
  }

  handleOnDrop = (files) => {
    const file = files[0]

    if (!file){
      return
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onloadend = () => {
      this.setState({buffer: Buffer(reader.result), fileName: file.name, isUploaded: true, fileSize: this.handleFileSize(file.size)})
    }
    reader.onerror = () => {
      console.log('file error', reader.error)
    }
  }

  handleFileSize(bytes){
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  }

  handleFileName(fileName){
    if (fileName.length < 30) return fileName
    var editedName = fileName.slice(0,18) + '... .' + fileName.split('.').pop()
    return editedName 
  }

  verifyFile = async (event) => {
    event.preventDefault()
    if (this.state.contract === null) {
      alert("Please connect to metamask")
      return
    }
    if (this.state.buffer === null){
      alert("input file first")
      return
    }

    this.setState({alertBackground: true})

    await this.setState({verifiedFiles: parseInt(this.state.verifiedFiles) + 1})
    await localStorage.setItem('verifiedFiles',this.state.verifiedFiles)

    if (this.state.connectedAddress.includes(this.state.account) === false){
      await this.setState({connectedAddress: [...this.state.connectedAddress, this.state.account]})
      await localStorage.setItem('connectedAddress',JSON.stringify(this.state.connectedAddress))
    }
    
    if (this.state.fileName.split('.').pop().toLowerCase() === "pdf" || this.state.fileName.split('.').pop().toLowerCase() === "png" || this.state.fileName.split('.').pop().toLowerCase()  === "jpg" || this.state.fileName.split('.').pop().toLowerCase()  === "jpeg"){
      ipfs.add(this.state.buffer, async(error,result) => {
        const url =  result[0].hash
        this.handleCheckBar(0,3)
        for (let i = 0; i < this.state.hashes.length; i++){
          if(url === this.state.transaction[i].initialIpfs || url === this.state.transaction[i].input){
            this.setState({successAlert: true, transactionLink: this.state.transaction[i].transactionHash})
            let timer = await setTimeout(()=>{
              this.handleCheckBar(3,33);
              let timer1 = setTimeout(()=>{
               this.handleCheckBar(33,70)
               let timer2 = setTimeout(() => {
                 this.handleCheckBar(70,100)
                 return clearTimeout(timer2)
               },1000)
               return clearTimeout(timer1);
              },1000)
              return clearTimeout(timer)
            },1000)
            return
          }
        }
        if(error){
          console.log(error)
          return
        }
        this.setState({failAlert: true})
        let timer = await setTimeout(()=>{
          this.handleCheckBar(3,33);
          let timer1 = setTimeout(()=>{
           this.handleCheckBar(33,100)
           return clearTimeout(timer1);
          },1000)
          return clearTimeout(timer)
        },1000)
        return
      })
    }
  }

  render(){
    return (
      <div className = "fullPage">
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
          <img style = {{position: "absolute",width: "26px", height: "26px", left:"880px", top: "24px"}} src = {aboutLogo} alt="About Logo"/>
          <div className = "inactivePageText" style ={{left: "912px"}}>About</div>
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

        <div className= "applicationName">DATA VALIDATION</div>

        {/* Published Files */}
        <img style ={{position: "absolute",width: "54px",height: "54px",left: "300px",top: "583px"}} src = {publishFilesIcon} alt="Publish File Icon"/>
        <div className = "number">{this.state.transaction.length}</div>
        <div className = "text">Published Files</div>

        {/* Verified Files */}
        <img style ={{position: "absolute",width: "54px",height: "54px",left: "617px",top: "583px"}} src = {verifyUserIcon} alt="Verified User Icon"/>
        <div className = "number" style ={{left: "687px"}}>{this.state.verifiedFiles}</div>
        <div className = "text" style ={{left: "688px"}}>Verified Files</div>

        {/* Connected Address Files */}
        <img style ={{position: "absolute",width: "54px",height: "54px",left: "934px",top: "583px"}} src = {connectedAddressIcon} alt="Connected Address Icon"/>
        <div className = "number" style ={{left: "1004px"}}>{this.state.connectedAddress.length}</div>
        <div className = "text" style ={{left: "1004px"}}>Connected Address</div>
        <div className="footer"/>


        <img style = {{position: "absolute", width: "159px",height: "39px",left: "75px",top: "18px"}} src = {logoVBC} alt="logo VBC"/>

        {this.state.isUploaded ? 
        <div>
          <div className= "chooseFileBackground"/>
          <img style = {{position: "absolute",width: "56px",height: "56px",left: "652px",top: "346px"}} src = {fileImage} alt="File Img"/>
          <div className= "fileText">{this.handleFileName(this.state.fileName)}</div>
          <div className= "fileSize">{this.state.fileSize}</div>
          <div className = "borderFile"/>
          <img class = "closeButton" src = {closeAlert} alt="Close alert button" onClick = {this.handleRefresh}/>
          
          {this.state.isPublished ?
            <div/>
            : 
            <div>
              <div className= "browseFilesBackground" style = {{top: "461px", left: "656px"}}/>
              <div className= "publishText" onClick={this.verifyFile}>Verify</div>
              {this.state.alertBackground ?
              <div>
                <div className = "alertBackgroundFade"/>
                <div className = "alertBackground"/>
                <img style = {{position: "absolute",width: "24px",height: "24px",left: "976px",top: "172px"}} src = {closeAlert} alt="Close alert button" onClick = {this.handleRefresh}/>
                <img style = {{position: "absolute",width: "56px",height: "56px",left: "651px",top: "196px"}} src = {fileImage} alt="File Img"/>
                <div className= "fileText" style ={{left: "717px", top: "201px", color: "#1E1E1E"}}>{this.handleFileName(this.state.fileName)}</div>
                <div className= "fileSize" style ={{left: "717px", top: "228px", color: "rgba(30, 30, 30, 0.8)"}}>{this.state.fileSize}</div>
                <img style = {{position: "absolute",width: "560px;",height: "1px",left: "440px",top: "292px"}} src = {line} alt="line"/>
                <div className="Progress">
                  <div className="ProgressBar"/>
                </div>
              </div>
              :
              <div/>
              }
              {this.state.barHeight >= 3 ?
              <div>
                <div className = "alertText" style= {{top: "317px"}}>Hash file with ipfs</div>
                <img style = {{position: "absolute",width: "26px;",height: "26px",left: "611px",top: "313px"}} src = {checkIcon} alt="Check Icon"/>
              </div> 
              : 
              <div/>}
              
              {this.state.successAlert ?
              <div>
                {this.state.barHeight >= 33 ? 
                <div>
                  <div className = "alertText" style= {{top: "400px"}}>Comparing hash</div>
                  <img style = {{position: "absolute",width: "26px;",height: "26px",left: "611px",top: "397px"}} src = {checkIcon} alt="Check Icon"/>
                </div> 
                : 
                <div/>}

                {this.state.barHeight >= 66 ? 
                <div>
                  <div className = "alertText" style= {{top: "505px"}}>Checking receipt</div>
                  <img style = {{position: "absolute",width: "26px;",height: "26px",left: "611px",top: "502px"}} src = {checkIcon} alt="Check Icon"/>
                </div>
                : 
                <div/>}

                {this.state.barHeight >= 99 ? 
                <div>
                  <div className = "alertSuccessBigTitle">VERIFIED</div>
                  <div className = "alertSuccessTitle" style ={{top: "597px"}}> This is a valid certificate </div>
                  <a style = {{position: "absolute", width: "252px", height: "32px", left: "648px", top: "613px", fontFamily:"Open Sans", fontStyle: "normal", fontWeight: "normal", fontSize: "12px", lineHeight: "16px", display: "flex", alignItems: "center", color: "#6F6F6F"}}target="_blank" rel="noopener noreferrer" href={'https:testnet.bscscan.com/tx/' + this.state.transactionLink}>View transaction</a>
                  <img style = {{position: "absolute",width: "36px;",height: "36px",left: "606px",top: "585px", filter: "drop-shadow(0px 4px 4px rgba(84, 114, 174, 0.2))"}} src = {bigCheckIcon} alt="Big Check Icon"/>
                </div>
                : 
                <div/>}
              </div>
              :
              <div/>}

              {this.state.failAlert ?
                <div>
                  {this.state.barHeight >= 33 ? 
                  <div>
                    <div className = "alertText" style= {{top: "400px"}}>Comparing hash</div>
                    <img style = {{position: "absolute",width: "26px;",height: "26px",left: "611px",top: "397px"}} src = {crossIcon} alt="Cross Icon"/>
                  </div> 
                  : 
                  <div/>}

                  {this.state.barHeight >= 99 ? 
                  <div>
                    <div className = "alertFailTitle" style ={{top: "594px", left: "648px"}}>This file has not been published on our network</div>
                    <img style = {{position: "absolute",width: "36px;",height: "36px",left: "606px",top: "585px"}} src = {bigCrossIcon} alt="Big Cross Icon"/>
                  </div> 
                  : 
                  <div/>}
                </div>
                :
              <div/>}
            </div>
          }
        </div> 
        :
        <div>
          <Dropzone style ={{position: "absolute",width: "841px",height: "252px",left: "300px",top: "287px", background: "rgba(0, 117, 255, 0.6)",mixBlendMode: "screen"}} onDrop = {this.handleOnDrop}>
            <img style = {{position: "absolute",width: "58px",height: "58px",left: "392px", top: "40px"}} src={browseFileIcon} alt="Browse File Icon"/>
            <div className= "dragFilesText">Drag & Drop files here to upload or</div>
            <div className= "browseFilesBackground"/>
            <div className = "browseFile">Choose file</div>
          </Dropzone>
        </div>
        }
      </div>
    );
  }
}

export default Verify;