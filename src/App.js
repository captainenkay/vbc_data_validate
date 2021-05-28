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
import closeAlert from "./assets/closeAlert.png"
import line from "./assets/line.png"
import checkIcon from "./assets/checkIcon.png"
import crossIcon from "./assets/crossIcon.png"
import bigCheckIcon from "./assets/bigCheckIcon.png"
import bigCrossIcon from "./assets/bigCrossIcon.png"
import logoVBC from "./assets/logoVBC.png"
import logoBlackVBC from "./assets/logoBlackVBC.png"
import fileImage from "./assets/fileImage.png"
import {Link} from "react-router-dom"
import DataValidate from './abis/DataValidate.json'
import {degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import Dropzone from 'react-dropzone'

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
    if (JSON.parse(localStorage.getItem('Transaction')) != null){
      this.setState({transaction: JSON.parse(localStorage.getItem('Transaction'))})
    }

    if (localStorage.getItem('verifiedFiles') != null){
      this.setState({verifiedFiles: localStorage.getItem('verifiedFiles')})
    }

    if (JSON.parse(localStorage.getItem('connectedAddress') != null)){
      this.setState({connectedAddress: JSON.parse(localStorage.getItem('connectedAddress'))})
    }
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
      fileSize: '',
      successAlert: false,
      failAlert: false,
      transactionLink: ''
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

  handleRefresh = (event) => {
    event.preventDefault()
    this.setState({isUploaded: false, successAlert: false, failAlert: false})
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
      this.setState({buffer: Buffer(reader.result), fileName: file.name, isUploaded: true, fileSize: this.handleFileSize(file.size)})
    }
    reader.onerror = () => {
      console.log('file error', reader.error)
    }
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

    
    if (this.state.fileName.split('.').pop().toLowerCase() === "pdf"){
      ipfs.add(this.state.buffer, (error,result) => {
        const url = 'https:ipfs.infura.io/ipfs/' + result[0].hash
        for (let i = 0; i < this.state.hashes.length; i++){
          if(url === this.state.transaction[i].initialIpfs){
            this.setState({successAlert: true})
            return
          }
        }
        if(error){
          console.log(error)
          return
        }
        this.setState({failAlert: true})
        return
      })
    }

    if (this.state.fileName.split('.').pop().toLowerCase() === "png" || this.state.fileName.split('.').pop().toLowerCase()  === "jpg" || this.state.fileName.split('.').pop().toLowerCase()  === "jpeg"){
      ipfs.add(this.state.buffer, (error,result) => {
        var ipfsResult = result[0].hash
        for (let i = 0; i < this.state.hashes.length; i++){
          if(ipfsResult === this.state.transaction[i].input){
            this.setState({successAlert: true, transactionLink: this.state.transaction[i].transactionHash})
            return
          }
        }
        if(error){
          console.log(error)
          return
        }
        this.setState({failAlert: true})
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
    if (this.state.fileName.split('.').pop().toLowerCase() === "pdf"){
      ipfs.add(this.state.buffer, async (error,result) => {
        const url = 'https:ipfs.infura.io/ipfs/' + result[0].hash
        for (let i = 0; i < this.state.hashes.length; i++){
          if(url === this.state.transaction[i].initialIpfs){
            this.setState({failAlert: true})
            return
          }
        }
        if(error){
          console.log(error)
          return
        }
        const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())
        const pdfDoc = await PDFDocument.load(existingPdfBytes)

        const pngImageBytes = await fetch(logoBlackVBC).then(res => res.arrayBuffer())
        const pngImage = await pdfDoc.embedPng(pngImageBytes)
        const pngDims = pngImage.scale(0.5)

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
            var result = {address: this.state.account, transactionHash: receipt.transactionHash, input: ipfsResult, blockNumber: receipt.blockNumber, fileName: this.state.fileName, initialIpfs: url, date: new Date()}
            this.setState({
              hashes: [ipfsResult,...this.state.hashes],
              transaction:[result, ...this.state.transaction],
              successAlert: true,
              transactionLink: receipt.transactionHash
            })
            localStorage.setItem('Transaction', JSON.stringify(this.state.transaction))
          })
        })
      })
    }

    // PNG & JPG
    if (this.state.fileName.split('.').pop().toLowerCase() === "png" || this.state.fileName.split('.').pop().toLowerCase() === "jpg" || this.state.fileName.split('.').pop().toLowerCase() === "jpeg"){
      ipfs.add(this.state.buffer, (error,result) => {
        var ipfsResult = result[0].hash
        for (let i = 0; i < this.state.hashes.length; i++){
          if(ipfsResult === this.state.transaction[i].input){
            this.setState({failAlert: true})
            return
          }
        }
        if(error){
          console.log(error)
          return
        }
        this.state.contract.methods.mint(ipfsResult).send({ from: this.state.account}).once('receipt', (receipt) => {
          var result = {address: this.state.account, transactionHash: receipt.transactionHash, input: ipfsResult, blockNumber: receipt.blockNumber, fileName: this.state.fileName, date: new Date()}
          this.setState({
            hashes: [ipfsResult,...this.state.hashes],
            transaction:[result, ...this.state.transaction],
            successAlert: true,
            transactionLink: receipt.transactionHash
          })
          localStorage.setItem('Transaction', JSON.stringify(this.state.transaction))
        })
      })
    }

    // Other file type 
    if(this.state.fileName.split('.').pop().toLowerCase() !== "png" && this.state.fileName.split('.').pop().toLowerCase() !== "jpg" &&  this.state.fileName.split('.').pop().toLowerCase() !== "jpeg" && this.state.fileName.split('.').pop().toLowerCase() !== "pdf"){
      alert("Please choose pdf, png, jpg, jpeg file")
    }
  }

  render(){
    return (
      <div className = "fullPage">
        {/* Home Button */}
        <Link to= "/home">
          <img style = {{position: "absolute",width: "20px", height: "19px", left:"475px", top: "27px"}} src = {homeLogoActive} alt="Home Logo Active"/>
          <div className = "activePageText" style ={{left: "504px"}}>Home</div>
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
        <div className = "metamaskText">{this.state.account.slice(0,10) + '...' + this.state.account.slice(38,42)}</div>

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

        {this.state.isUploaded ? 
        <div>
          <div className= "chooseFileBackground"/>
          <img style = {{position: "absolute",width: "56px",height: "56px",left: "652px",top: "346px"}} src = {fileImage} alt="File Img"/>
          <div className= "fileText">{this.handleFileName(this.state.fileName)}</div>
          <div className= "fileSize">{this.state.fileSize}</div>
          <div className= "browseFilesBackground"/>
          <div className = "borderFile"/>
          {this.state.isPublished ?
            <div>
              <div className= "publishText" onClick={this.publishFile}>Publish</div>
              {this.state.successAlert ?
              <div>
                <div className = "alertBackground" style={{top: "152px", height: "497px"}}/>
                <div className = "alertSuccessCheckBar"/>
                <img style = {{position: "absolute",width: "24px",height: "24px",left: "976px",top: "172px"}} src = {closeAlert} alt="Close alert button" onClick = {this.handleRefresh}/>
                <img style = {{position: "absolute",width: "56px",height: "56px",left: "651px",top: "196px"}} src = {fileImage} alt="File Img"/>
                <div className= "fileText" style ={{left: "717px", top: "201px", color: "#1E1E1E"}}>{this.handleFileName(this.state.fileName)}</div>
                <div className= "fileSize" style ={{left: "717px", top: "228px", color: "rgba(30, 30, 30, 0.8)"}}>{this.state.fileSize}</div>
                <img style = {{position: "absolute",width: "560px;",height: "1px",left: "440px",top: "292px"}} src = {line} alt="line"/>
                <div className = "alertText" style= {{top: "317px"}}>Computing local hash</div>
                <img style = {{position: "absolute",width: "26px;",height: "26px",left: "611px",top: "313px"}} src = {checkIcon} alt="Check Icon"/>
                <div className = "alertText" style= {{top: "372px"}}>Comparing hash</div>
                <img style = {{position: "absolute",width: "26px;",height: "26px",left: "611px",top: "369px"}} src = {checkIcon} alt="Check Icon"/>
                <div className = "alertText" style= {{top: "423px"}}>Deploy file on ipfs</div>
                <img style = {{position: "absolute",width: "26px;",height: "26px",left: "611px",top: "420px"}} src = {checkIcon} alt="Check Icon"/>
                <div className = "alertText" style= {{top: "474px"}}>Publish file on network</div>
                <img style = {{position: "absolute",width: "26px;",height: "26px",left: "611px",top: "471px"}} src = {checkIcon} alt="Check Icon"/>
                <div className = "alertText" style= {{top: "525px"}}>Generate to your collectibles</div>
                <img style = {{position: "absolute",width: "26px;",height: "26px",left: "611px",top: "522px"}} src = {checkIcon} alt="Check Icon"/>
                <div className = "alertSuccessBigTitle">PUBLISHED</div>
                <div className = "alertSuccessTitle" style ={{top: "597px"}}> This file has been published on our network </div>
                <a style = {{position: "absolute", width: "252px", height: "32px", left: "648px", top: "613px", fontFamily:"Open Sans", fontStyle: "normal", fontWeight: "normal", fontSize: "12px", lineHeight: "16px", display: "flex", alignItems: "center", color: "#6F6F6F"}}target="_blank" rel="noopener noreferrer" href={'https:testnet.bscscan.com/tx/' + this.state.transactionLink}>View transaction</a>
                <img style = {{position: "absolute",width: "36px;",height: "36px",left: "606px",top: "585px", filter: "drop-shadow(0px 4px 4px rgba(84, 114, 174, 0.2))"}} src = {bigCheckIcon} alt="Big Check Icon"/>

              </div>
              :
              <div/>}

              {this.state.failAlert ?
                <div>
                  <div className = "alertBackground" style={{top: "285px", height: "329px"}}/>
                  <div className = "alertFailCheckBar"/>
                  <img style = {{position: "absolute",width: "24px",height: "24px",left: "976px",top: "305px"}} src = {closeAlert} alt="Close alert button" onClick = {this.handleRefresh}/>
                  <img style = {{position: "absolute",width: "56px",height: "56px",left: "651px",top: "329px"}} src = {fileImage} alt="File Img"/>
                  <div className= "fileText" style ={{left: "717px", top: "334px", color: "#1E1E1E"}}>{this.state.fileName}</div>
                  <div className= "fileSize" style ={{left: "717px", top: "361px", color: "rgba(30, 30, 30, 0.8)"}}>{this.state.fileSize}</div>
                  <img style = {{position: "absolute",width: "560px;",height: "1px",left: "440px",top: "425px"}} src = {line} alt="line"/>
                  <div className = "alertText" style= {{top: "450px", left: "588px"}}>Computing local hash</div>
                  <img style = {{position: "absolute",width: "26px;",height: "26px",left: "551px",top: "446px"}} src = {checkIcon} alt="Check Icon"/>
                  <div className = "alertText" style= {{top: "505px", left: "588px"}}>Comparing hash</div>
                  <img style = {{position: "absolute",width: "26px;",height: "26px",left: "551px",top: "502px"}} src = {crossIcon} alt="Cross Icon"/>
                  <div className = "alertFailTitle">This file has been published on our network before</div>
                  <img style = {{position: "absolute",width: "36px;",height: "36px",left: "546px",top: "558px"}} src = {bigCrossIcon} alt="Big Cross Icon"/>
                </div>
                :
                <div/>}

            </div>
            : 
            <div>
              <div className= "publishText" onClick={this.verifyFile}>Verify</div>
              {this.state.successAlert ?
              <div>
                <div className = "alertBackground" style={{top: "152px", height: "400px"}}/>
                <div className = "alertSuccessCheckBar" style ={{height: "190px"}}/>
                <img style = {{position: "absolute",width: "24px",height: "24px",left: "976px",top: "172px"}} src = {closeAlert} alt="Close alert button" onClick = {this.handleRefresh}/>
                <img style = {{position: "absolute",width: "56px",height: "56px",left: "651px",top: "196px"}} src = {fileImage} alt="File Img"/>
                <div className= "fileText" style ={{left: "717px", top: "201px", color: "#1E1E1E"}}>{this.state.fileName}</div>
                <div className= "fileSize" style ={{left: "717px", top: "228px", color: "rgba(30, 30, 30, 0.8)"}}>{this.state.fileSize}</div>
                <img style = {{position: "absolute",width: "560px;",height: "1px",left: "440px",top: "292px"}} src = {line} alt="line"/>
                <div className = "alertText" style= {{top: "317px"}}>Computing local hash</div>
                <img style = {{position: "absolute",width: "26px;",height: "26px",left: "611px",top: "313px"}} src = {checkIcon} alt="Check Icon"/>
                <div className = "alertText" style= {{top: "372px"}}>Comparing hash</div>
                <img style = {{position: "absolute",width: "26px;",height: "26px",left: "611px",top: "369px"}} src = {checkIcon} alt="Check Icon"/>
                <div className = "alertText" style= {{top: "423px"}}>Checking receipt</div>
                <img style = {{position: "absolute",width: "26px;",height: "26px",left: "611px",top: "420px"}} src = {checkIcon} alt="Check Icon"/>
                <div className = "alertSuccessBigTitle" style ={{top: "474px"}}>VERIFIED</div>
                <div className = "alertSuccessTitle" style ={{top: "495px"}}> This is a valid certificate </div>
                <a style = {{position: "absolute", width: "252px", height: "32px", left: "648px", top: "511px", fontFamily:"Open Sans", fontStyle: "normal", fontWeight: "normal", fontSize: "12px", lineHeight: "16px", display: "flex", alignItems: "center", color: "#6F6F6F"}}target="_blank" rel="noopener noreferrer" href={'https:testnet.bscscan.com/tx/' + this.state.transactionLink}>View transaction</a>
                  
                <img style = {{position: "absolute",width: "36px;",height: "36px",left: "606px",top: "483px", filter: "drop-shadow(0px 4px 4px rgba(84, 114, 174, 0.2))"}} src = {bigCheckIcon} alt="Big Check Icon"/>

              </div>
              :
              <div/>}

              {this.state.failAlert ?
                <div>
                  <div className = "alertBackground" style={{top: "285px", height: "329px"}}/>
                  <div className = "alertFailCheckBar"/>
                  <img style = {{position: "absolute",width: "24px",height: "24px",left: "976px",top: "305px"}} src = {closeAlert} alt="Close alert button" onClick = {this.handleRefresh}/>
                  <img style = {{position: "absolute",width: "56px",height: "56px",left: "651px",top: "329px"}} src = {fileImage} alt="File Img"/>
                  <div className= "fileText" style ={{left: "717px", top: "334px", color: "#1E1E1E"}}>{this.state.fileName}</div>
                  <div className= "fileSize" style ={{left: "717px", top: "361px", color: "rgba(30, 30, 30, 0.8)"}}>{this.state.fileSize}</div>
                  <img style = {{position: "absolute",width: "560px;",height: "1px",left: "440px",top: "425px"}} src = {line} alt="line"/>
                  <div className = "alertText" style= {{top: "450px", left: "588px"}}>Computing local hash</div>
                  <img style = {{position: "absolute",width: "26px;",height: "26px",left: "551px",top: "446px"}} src = {checkIcon} alt="Check Icon"/>
                  <div className = "alertText" style= {{top: "505px", left: "588px"}}>Comparing hash</div>
                  <img style = {{position: "absolute",width: "26px;",height: "26px",left: "551px",top: "502px"}} src = {crossIcon} alt="Cross Icon"/>
                  <div className = "alertFailTitle">This file has not been published on our network</div>
                  <img style = {{position: "absolute",width: "36px;",height: "36px",left: "546px",top: "558px"}} src = {bigCrossIcon} alt="Big Cross Icon"/>
                </div>
                :
                <div/>}
            </div>
          }
        </div> 
        :
        <div>
          <Dropzone style ={{position: "absolute",width: "841px",height: "252px",left: "300px",top: "287px", background: "rgba(0, 117, 255, 0.6)",mixBlendMode: "screen"}} onDrop = {this.handleOnDrop}/>
          <img style = {{position: "absolute",width: "58px",height: "58px",left: "692px", top: "327px"}} src={browseFileIcon} alt="Browse File Icon"/>
          <div className= "dragFilesText">Drag & Drop files here to upload or</div>
          {/* Browse Files Button */}
          <div className= "browseFilesBackground"/>
          <input type="file" id ="browseFile" onChange = {this.handleFileChange} hidden/>
          <label for="browseFile">Choose file</label>
        </div>
        }
      </div>
    );
  }
}

export default App;
