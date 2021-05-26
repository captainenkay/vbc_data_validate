import { Component } from 'react';
import Web3 from 'web3';
import "./App.css"
import homeLogoActive from "./assets/homeLogoActive.png"
import collectiblesLogo from "./assets/collectiblesLogo.png"
import aboutLogo from "./assets/aboutLogo.png"
import browseFileIcon from "./assets/browseFileIcon.png"
import publishFilesIcon from "./assets/publishFilesIcon.png"
import connectedAddressIcon from "./assets/connectedAddressIcon.png"
import verifyUserIcon from "./assets/verifyUserIcon.png"
import logoVBC from "./assets/logoVBC.png"
import {Link} from "react-router-dom"
import DataValidate from './abis/DataValidate.json'
import {degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib'

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })


class App extends Component {
  async componentWillMount(){
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  componentDidMount(){
    window.ethereum.on('accountsChanged', function (accounts) {
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

  async loadBlockchainData(){
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({account: accounts[0]})
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
      if (JSON.parse(localStorage.getItem('Transaction')) != null){
        this.setState({transaction: JSON.parse(localStorage.getItem('Transaction'))})
      }

      if (localStorage.getItem('verifiedFiles') != null){
        this.setState({verifiedFiles: localStorage.getItem('verifiedFiles')})
      }

      if (JSON.parse(localStorage.getItem('connectedAddress') != null)){
        this.setState({connectedAddress: JSON.parse(localStorage.getItem('connectedAddress'))})
      }
    }
    else{
      window.alert("smart contract do not deploy to detect network")
    }
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
      isPublished: true,
      verifiedFiles: 0,
      connectedAddress: [],
    }
  }

  handePublishMode = (event) => {
    event.preventDefault()
    this.setState({isPublished: true})
  }

  handeVerifyMode = (event) => {
    event.preventDefault()
    this.setState({isPublished: false})
  }

  handleFileChange = (event) => {
    event.preventDefault()
    const file = event.target.files[0];

    if (!file){
      return
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onloadend = () => {
      this.setState({buffer: Buffer(reader.result), fileName: file.name, isUploaded: true})
    }
    reader.onerror = () => {
      console.log('file error', reader.error)
    }
  }

  verifyFile = async (event) => {
    event.preventDefault()
    if (this.state.buffer === null){
      alert("input file first")
      return
    }

    await this.setState({verifiedFiles: parseInt(this.state.verifiedFiles) + 1})
    await localStorage.setItem('verifiedFiles',this.state.verifiedFiles)

    if (this.state.connectedAddress.includes(this.state.account) === false){
      await this.setState({connectedAddress: [...this.state.connectedAddress, this.state.account]})
      await console.log(this.state.connectedAddress)
      await localStorage.setItem('connectedAddress',JSON.stringify(this.state.connectedAddress))
    }

    
    if (this.state.fileName.split('.').pop() === "pdf"){
      ipfs.add(this.state.buffer, (error,result) => {
        const url = 'https:ipfs.infura.io/ipfs/' + result[0].hash
        for (let i = 0; i < this.state.hashes.length; i++){
          if(url === this.state.transaction[i].initialIpfs){
            if(this.state.account === this.state.transaction[i].address){
              
              alert("exist file in blockchain and the owner is you")
              return
            }
            alert("exist file in blockchain and the owner is " + this.state.transaction[i].address)
            return
          }
        }
        if(error){
          console.log(error)
          return
        }
        alert("This file have not been publish")
        return
      })
    }

    if (this.state.fileName.split('.').pop() === "png" || this.state.fileName.split('.').pop() === "jpg"){
      ipfs.add(this.state.buffer, (error,result) => {
        var ipfsResult = result[0].hash
        for (let i = 0; i < this.state.hashes.length; i++){
          if(ipfsResult === this.state.transaction[i].input){
            if(this.state.account === this.state.transaction[i].address){
              alert("exist file in blockchain and the owner is you")
              return
            }
            alert("exist file in blockchain and the owner is " + this.state.transaction[i].address)
            return
          }
        }
        if(error){
          console.log(error)
          return
        }
        alert("This file have not been publish")
        return
      })
    }
  }

  publishFile = async (event) => {
    event.preventDefault()

    if (this.state.buffer === null){
      alert("input file first")
      return
    }

    if (this.state.connectedAddress.includes(this.state.account) === false){
      await this.setState({connectedAddress: [...this.state.connectedAddress, this.state.account]})
      await console.log(this.state.connectedAddress)
      await localStorage.setItem('connectedAddress',JSON.stringify(this.state.connectedAddress))
    }

    // PDF File
    if (this.state.fileName.split('.').pop() === "pdf"){
      ipfs.add(this.state.buffer, async (error,result) => {
        const url = 'https:ipfs.infura.io/ipfs/' + result[0].hash
        for (let i = 0; i < this.state.hashes.length; i++){
          if(url === this.state.transaction[i].initialIpfs){
            if(this.state.account === this.state.transaction[i].address){
              alert("exist file in blockchain and the owner is you")
              return
            }
            alert("exist file in blockchain and the owner is " + this.state.transaction[i].address)
            return
          }
        }
        if(error){
          console.log(error)
          return
        }
        const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())
        const pdfDoc = await PDFDocument.load(existingPdfBytes)

        const pngImageBytes = await fetch(logoVBC).then(res => res.arrayBuffer())
        const pngImage = await pdfDoc.embedPng(pngImageBytes)
        const pngDims = pngImage.scale(0.1)

        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
        const pages = await pdfDoc.getPages()

        const firstPage = pages[0]
        const { width, height } = firstPage.getSize()

        for (var i = 0; i < pages.length; i++){
          pages[i].drawText('Validated by VBC Data Validate', {
            x: width/4,
            y: height - (height/4),
            size: 30,
            font: helveticaFont,
            color: rgb(0.753, 0.753, 0.753),
            rotate: degrees(-45),
          })

          pages[i].drawImage(pngImage, {
            x: 20,
            y: 20,
            width: pngDims.width,
            height: pngDims.height,
          })
        }
        const pdfBytes = await pdfDoc.save()
        const editedBuffer = Buffer(pdfBytes)
        ipfs.add(editedBuffer, (error,result) => {
          var ipfsResult = result[0].hash
          if(error){
            console.log(error)
            return
          }
          this.state.contract.methods.mint(ipfsResult).send({ from: this.state.account}).once('receipt', (receipt) => {
            var result = {address: this.state.account, transactionHash: receipt.transactionHash, input: ipfsResult, blockNumber: receipt.blockNumber, fileName: this.state.fileName, initialIpfs: url}
            this.setState({
              hashes: [ipfsResult,...this.state.hashes],
              transaction:[result, ...this.state.transaction]
            })
            localStorage.setItem('Transaction', JSON.stringify(this.state.transaction))
          })
        })
      })  
    }

    // PNG & JPG
    if (this.state.fileName.split('.').pop() === "png" || this.state.fileName.split('.').pop() === "jpg"){
      ipfs.add(this.state.buffer, (error,result) => {
        var ipfsResult = result[0].hash
        for (let i = 0; i < this.state.hashes.length; i++){
          if(ipfsResult === this.state.transaction[i].input){
            if(this.state.account === this.state.transaction[i].address){
              alert("exist file in blockchain and the owner is you")
              return
            }
            alert("exist file in blockchain and the owner is " + this.state.transaction[i].address)
            return
          }
        }
        if(error){
          console.log(error)
          return
        }
        this.state.contract.methods.mint(ipfsResult).send({ from: this.state.account}).once('receipt', (receipt) => {
          var result = {address: this.state.account, transactionHash: receipt.transactionHash, input: ipfsResult, blockNumber: receipt.blockNumber, fileName: this.state.fileName}
          this.setState({
            hashes: [ipfsResult,...this.state.hashes],
            transaction:[result, ...this.state.transaction]
          })
          localStorage.setItem('Transaction', JSON.stringify(this.state.transaction))
        })
      })
    }

    // Other file type 
    if(this.state.fileName.split('.').pop() !== "png" && this.state.fileName.split('.').pop() !== "jpg" && this.state.fileName.split('.').pop() !== "pdf"){
      alert("Please choose pdf, png, jpg file")
    }
  }

  render(){
    return (
      <div className = "fullPage">
        <img style = {{position: "absolute", width: "159px",height: "39px",left: "75px",top: "18px"}} src = {logoVBC} alt="logo VBC"/>

        {/* Home Button */}
        <Link to= "/home">
          <img style = {{position: "absolute",width: "20px", height: "19px", left:"475px", top: "27px"}} src = {homeLogoActive} alt="Home Logo Active"/>
          <div className = "activeText" style ={{left: "504px"}}>Home</div>
        </Link>

        {/* Collectibles Button */}
        <Link to= "/collectibles">
          <img style = {{position: "absolute",width: "26px", height: "26px", left:"652px", top: "24px"}} src = {collectiblesLogo} alt="Collectibles Logo"/>
          <div className = "inactiveText" style ={{left: "684px"}}>Collectibles</div>
        </Link>

        {/* About Button */}
        <Link to= "/about">
          <img style = {{position: "absolute",width: "26px", height: "26px", left:"880px", top: "24px"}} src = {aboutLogo} alt="About Logo"/>
          <div className = "inactiveText" style ={{left: "912px"}}>About</div>
        </Link>

        {/* Metamask Button */}
        <div className = "metamaskBackground"/>
        <div className = "metamaskText">{this.state.account.slice(0,10) + '...' + this.state.account.slice(38,42)}</div>

        <div className= "applicationName">DATA VALIDATION</div>

        {this.state.isPublished ?
        // Publish Mode
        <div>
          {/* Publish Button */}
          <div className= "buttonActiveBackground" style ={{left: "300px"}}/>
          <div className= "buttonActiveText" style={{left:"351px", width: "67px"}}>Publish</div>

          {/* Verify Button */}
          <div className= "buttonInactiveBackground" style ={{left: "468px"}} onClick={this.handeVerifyMode}/>
          <div className= "buttonInactiveText" style={{left:"525px", width: "54px"}} onClick={this.handeVerifyMode} >Verify</div>
        </div>
        :
        // Verify Mode
        <div>
          {/* Publish Button */}
          <div className= "buttonInactiveBackground" style ={{left: "300px"}} onClick={this.handePublishMode}/>
          <div className= "buttonInactiveText" style={{left:"351px", width: "67px"}} onClick={this.handePublishMode} >Publish</div>

          {/* Verify Button */}
          <div className= "buttonActiveBackground" style ={{left: "468px"}}/>
          <div className= "buttonActiveText" style={{left:"525px", width: "54px"}} >Verify</div>
        </div>
        }

        <div className= "chooseFileBackground"/>

        {this.state.isUploaded ? 
        <div>
          <div className= "filesText">{this.state.fileName}</div>
          <div className= "browseFilesBackground" style ={{left: "920px"}}/>
          {this.state.isPublished ?
            <div>
              <div className= "publishText" style ={{left: "938px"}} onClick={this.publishFile}>Publish</div>
            </div>
            : 
            <div>
              <div className= "publishText" style ={{left: "938px"}} onClick={this.verifyFile}>Verify</div>
            </div>
          }
        </div> 
        :
        <div>
          <img style = {{position: "absolute",width: "58px",height: "58px",left: "692px", top: "327px"}} src={browseFileIcon} alt="Browse File Icon"/>
          <div className= "filesText">Drag & Drop files here to upload or</div>
        </div>
        }

        {/* Browse Files Button */}
        <div className= "browseFilesBackground"/>
        <input type="file" id ="browseFile" onChange = {this.handleFileChange} hidden/>
        <label for="browseFile">Choose file</label>

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
      </div>
    );
  }
}

export default App;
