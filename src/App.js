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
import pdfButton from "./assets/pdfButton.png"
import {Link} from "react-router-dom"
import DataValidate from './abis/DataValidate.json'
import {PDFDocument, rgb, StandardFonts, PDFString, PDFName } from 'pdf-lib'
import Dropzone from 'react-dropzone'
import download from "downloadjs";
import sha256 from 'crypto-js/sha256';

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })


class App extends Component {
  async componentWillMount(){
    await this.loadStorage()
    console.log(window.innerHeight)
    if (this.state.account !== ''){
      this.setState({connected: true})
      await this.loadWeb3()
      await this.loadBlockchainData()
    }
  }

  connectMetamask = async(event) => {
    event.preventDefault()
    if (window.ethereum){
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
      window.ethereum.on('accountsChanged', function (accounts){
        localStorage.setItem('address', accounts[0])
        window.location.reload()
      });
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

  async loadStorage(){
    if (JSON.parse(localStorage.getItem('transaction')) != null){
      this.setState({transaction: JSON.parse(localStorage.getItem('transaction'))})
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
      this.setState({ totalSupply ,tokenID: totalSupply})
      for (var i = 1; i <= totalSupply; i++) {
        const data = await contract.methods.dataValidateTransactionDetails(i - 1).call()
        this.setState({
          transactionData: [data, ...this.state.transactionData]
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
      tokenID: 0,
      account: '',
      buffer: null,
      contract: null,
      totalSupply: 0,
      transactionData: [],
      transaction: [],
      fileName: '',
      isUploaded: false,
      isPublished: true,
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
      initialFileSHA256: '',
      verifyAddressFail: false,
    }
    this.handleTextChange = this.handleTextChange.bind(this);
  }

  handlePublishMode = (event) => {
    event.preventDefault()
    this.setState({isPublished: true})
  }

  handleVerifyMode = (event) => {
    event.preventDefault()
    this.setState({isPublished: false})
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

    const readerAsText = new FileReader();
    readerAsText.readAsText(file);
    
    readerAsText.onloadend = () => {
      var hash = sha256(readerAsText.result)
      this.setState({initialFileSHA256: hash.toString()})
    }

    readerAsText.onerror = () => {
      console.log('file error', readerAsText.error)
    }

    const readerAsArrayBuffer = new FileReader();
    readerAsArrayBuffer.readAsArrayBuffer(file);

    readerAsArrayBuffer.onloadend = () => {
      this.setState({buffer: Buffer(readerAsArrayBuffer.result), fileName: file.name, isUploaded: true, fileSize: this.handleFileSize(file.size)})
    }

    readerAsArrayBuffer.onerror = () => {
      console.log('file error', readerAsArrayBuffer.error)
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
        const url =  "https://ipfs.infura.io/ipfs/" + result[0].hash
        this.handleCheckBar(0,3)
        for (let i = 0; i < this.state.transactionData.length; i++){
          var data = this.state.transactionData[i].split('#')
          if(url === data[2]|| url === data[3] || this.state.initialFileSHA256 === this.state.transaction[i].initialFileSHA256){
            this.setState({successAlert: true, transactionLink: this.state.transaction[i].transactionHash})
            let timer = await setTimeout(()=>{
              this.handleCheckBar(3,33);
              let timer1 = setTimeout(()=>{
               this.handleCheckBar(33,70)
               let timer2 = setTimeout(() => {
                 if (this.state.account !== this.state.transaction[i].fileOwner){
                  this.setState({verifyAddressFail: true, verifyOwner: this.state.transaction[i].fileOwner})
                 }
                 let timer3 = setTimeout(()=>{
                  this.handleCheckBar(70,100)
                  return clearTimeout(timer3);
                 },1000)
                 return clearTimeout(timer2)
               },0)
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

  publishFile = async (event) => {
    event.preventDefault()
    if (this.state.contract === null) {
      alert("Please connect to metamask")
      return
    }
    if (this.state.buffer === null){
      alert("input file first")
      return
    }
    // Other file type 
    if(this.state.fileName.split('.').pop().toLowerCase() !== "png" && this.state.fileName.split('.').pop().toLowerCase() !== "jpg" &&  this.state.fileName.split('.').pop().toLowerCase() !== "jpeg" && this.state.fileName.split('.').pop().toLowerCase() !== "pdf"){
      alert("Please choose pdf, png, jpg, jpeg file")
      return
    }

    this.setState({alertBackground: true})

    if (this.state.connectedAddress.includes(this.state.account) === false){
      await this.setState({connectedAddress: [...this.state.connectedAddress, this.state.account]})
      await localStorage.setItem('connectedAddress',JSON.stringify(this.state.connectedAddress))
    }

    if (this.state.fileName.split('.').pop().toLowerCase() === "pdf" || this.state.fileName.split('.').pop().toLowerCase() === "png" || this.state.fileName.split('.').pop().toLowerCase() === "jpg" || this.state.fileName.split('.').pop().toLowerCase() === "jpeg"){
      ipfs.add(this.state.buffer, async(error,result) => {
        const url =  "https://ipfs.infura.io/ipfs/" + result[0].hash
        this.handleCheckBar(0,3)
        for (let i = 0; i < this.state.transactionData.length; i++){
          var data = this.state.transactionData[i].split('#')
          if(url === data[2]|| url === data[3] || this.state.initialFileSHA256 === this.state.transaction[i].initialFileSHA256){
            this.setState({failAlert: true})
            let timer = await setTimeout(()=>{
              this.handleCheckBar(3,24);
              let timer1 = setTimeout(()=>{
               this.handleCheckBar(24,100)
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
        this.setState({successAlert: true})

        await setTimeout(()=>{
          this.handleCheckBar(3,24)
        },1000)

        const bytes = await fetch(url).then(res => res.arrayBuffer())
        var pdfDoc = await PDFDocument.create();
        
        // pdf file
        if (this.state.fileName.split('.').pop().toLowerCase() === "pdf"){
          pdfDoc = await PDFDocument.load(bytes)
        }
        //image file
        else {
          var image
          if (this.state.fileName.split('.').pop().toLowerCase() === "png"){
            image = await pdfDoc.embedPng(bytes)
          }
          else{
            image = await pdfDoc.embedJpg(bytes)
          }
          const page = pdfDoc.addPage()

          const scaled = image.scaleToFit(page.getWidth(),page.getHeight())
          const {height} = page.getSize()

          page.drawImage(image, {
            x: 0,
            y: height - ((scaled.height) * 5/6),
            width: (scaled.width) * 5/6,
            height: (scaled.height) * 5/6,
          })
        }

        const pngImageBytes = await fetch(logoBlackVBC).then(res => res.arrayBuffer())
        const pdfButtonBytes = await fetch(pdfButton).then(res => res.arrayBuffer())
        const pngImage = await pdfDoc.embedPng(pngImageBytes)
        const filePdfButton = await pdfDoc.embedPng(pdfButtonBytes)
        const buttonDims = filePdfButton.scale(0.65)
        const pngDims = pngImage.scale(0.2)

        const courierFont = await pdfDoc.embedFont(StandardFonts.Courier)
        const pages = await pdfDoc.getPages()
        const firstPage = pages[0]

        firstPage.drawText('http://192.168.123.208:3000/', {
          x: 350,
          y: 20,
          size: 16,
          color: rgb(1, 1, 1),
        })

        firstPage.drawImage(filePdfButton, {
          x: 453,
          y: 17,
          width: buttonDims.width,
          height: buttonDims.height,
        })

        firstPage.drawText('Verify', {
          x: 460,
          y: 25,
          size: 20,
          font: courierFont,
          color: rgb(0.115, 0.3977, 0.4873),
        })

        firstPage.drawImage(pngImage, {
          x: 20,
          y: 18,
          width: pngDims.width,
          height: pngDims.height,
        })

        const link = firstPage.doc.context.register(
          firstPage.doc.context.obj({
            Type: 'Annot',
            Subtype: 'Link',
            width: "200px",
            A: {
              Type: 'Action',
              S: 'URI',
              URI: PDFString.of('http://192.168.123.208:3000/'),
            },
          }),
        );
        firstPage.node.set(PDFName.of('Annots'), pdfDoc.context.obj([link]));

        const pdfBytes = await pdfDoc.save()
        const editedBuffer = Buffer(pdfBytes)

        await setTimeout(()=>{
          this.handleCheckBar(24,40)
        },2000)

        ipfs.add(editedBuffer, async(error,result) => {
          var ipfsResult = "https://ipfs.infura.io/ipfs/" + result[0].hash
          await setTimeout(()=>{
            this.handleCheckBar(40,58)
          },1000)
          if(error){
            console.log(error)
            return
          }
          var mintItem = this.state.fileName + "#" + this.state.description + "#" + url + "#"+ ipfsResult + "#" + this.state.initialFileSHA256
          this.state.contract.methods.mint(mintItem).send({ from: this.state.account}).once('receipt', (receipt) => {
            download(pdfBytes, "Certificate", "application/pdf");
            let timer = setTimeout(()=>{
              this.handleCheckBar(58,75);
              let timer1 = setTimeout(()=>{
               this.handleCheckBar(75,100)
               return clearTimeout(timer1);
              },1000)
              return clearTimeout(timer)
            },1000)
            var result = {transactionHash: receipt.transactionHash, blockNumber: receipt.blockNumber,fileName: this.state.fileName,fileDescription: this.state.description, fileOwner: this.state.account, initialFile: url, certificateFile: ipfsResult,date: new Date(), tokenID: parseInt(this.state.tokenID) + 1, initialFileSHA256: this.state.initialFileSHA256, sellable: "non-sellable", transfer: ""}
            this.setState({
              transactionData: [mintItem,...this.state.transactionData],
              transaction:[result, ...this.state.transaction],
              successAlert: true,
              transactionLink: receipt.transactionHash,
              tokenID: parseInt(this.state.tokenID) + 1
            })
            localStorage.setItem('transaction', JSON.stringify(this.state.transaction))
          })
        })
      })
    }
  }

  render(){
    return (
      <div className= "fullPage">
        <img className = "logoVBC" src = {logoVBC} alt="logo VBC"/>
        <Link to= "/home">
          <img className = "navigationIcon" style ={{left: "26.0416666667%"}} src = {homeLogoActive} alt="Home Logo Active"/>
          <div className = "activeNavigationText" style ={{left: "28%"}}>Home</div>
        </Link>

        <Link to= "/collectibles">
          <img className = "navigationIcon" style = {{width: "1.80555555556%", top: "2.8%", left: "36.9444444444%"}} src = {collectiblesLogo} alt="Collectibles Logo"/>
          <div className = "inactiveNavigationText" style ={{left: "39.1666666667%"}}>Collectibles</div>
        </Link>

        <Link to= "/marketplace">
          <img className = "navigationIcon" style = {{width: "1.80555555556%", top: "2.8%", left: "51.9444444444%"}} src = {collectiblesLogo} alt="Collectibles Logo"/>
          <div className = "inactiveNavigationText" style ={{left: "54.1666666667%"}}>Marketplace</div>
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

        <div className= "applicationName">DATA VALIDATION</div>

        {/* Published Files */}
        <img className = "applicationInformation" style ={{left: "20.8333333333%"}} src = {publishFilesIcon} alt="Publish File Icon"/>
        <div className = "applicationInformationNumber" style ={{left: "25.6944444444%"}}>{this.state.tokenID}</div>
        <div className = "applicationInformationText" style = {{left: "25.6944444444%"}}>Published Files</div>

        {/* Verified Files */}
        <img className = "applicationInformation" style ={{left: "42.8472222222%"}} src = {verifyUserIcon} alt="Verified User Icon"/>
        <div className = "applicationInformationNumber" style ={{left: "47.7083333333%"}}>{this.state.verifiedFiles}</div>
        <div className = "applicationInformationText" style ={{left: "47.7777777778%"}}>Verified Files</div>

        {/* Connected Address Files */}
        <img className = "applicationInformation" style ={{left: "64.8611111111%"}} src = {connectedAddressIcon} alt="Connected Address Icon"/>
        <div className = "applicationInformationNumber" style ={{left: "69.7222222222%"}}>{this.state.connectedAddress.length}</div>
        <div className = "applicationInformationText" style ={{left: "69.7222222222%"}}>Connected Address</div>

        <div className="footer"/>


        {this.state.isPublished ?
        // Publish Mode
        <div>
          {/* Publish Button */}
          <div className= "buttonActiveBackground" style ={{left: "20.8333333333%"}}/>
          <div className= "buttonActiveText" style={{left:"24.375%", width: "4.65277777778%"}}>Publish</div>

          {/* Verify Button */}
          <div className= "buttonInactiveBackground" style ={{left: "32.5%"}} onClick={this.handleVerifyMode}/>
          <div className= "buttonInactiveText" style={{left:"36.4583333333%", width: "3.75%"}} onClick={this.handleVerifyMode} >Verify</div>
        </div>
        :
        // Verify Mode
        <div>
          {/* Publish Button */}
          <div className= "buttonInactiveBackground" style ={{left: "20.8333333333%"}} onClick={this.handlePublishMode}/>
          <div className= "buttonInactiveText" style={{left:"24.375%", width: "4.65277777778%"}} onClick={this.handlePublishMode} >Publish</div>

          {/* Verify Button */}
          <div className= "buttonActiveBackground" style ={{left: "32.5%"}}/>
          <div className= "buttonActiveText" style={{left:"36.4583333333%", width: "3.75%"}} >Verify</div>
        </div>
        }

        {this.state.isUploaded ? 
        <div>
          <div className= "chooseFileBackground"/>
          <img style = {{position: "absolute",width: "3.88888888889%",height: "auto",left: "45.2777777778%",top: "42.143727162%"}} src = {fileImage} alt="File Img"/>
          <div className= "fileText">{this.handleFileName(this.state.fileName)}</div>
          <div className= "fileSize">{this.state.fileSize} - File hash: {this.state.initialFileSHA256.slice(0,15)} ...</div>
          <div className = "borderFile"/>
          <img className = "closeButton" src = {closeAlert} alt="Close alert button" onClick = {this.handleRefresh}/>
          
          {this.state.isPublished ?
            <div>
              <div className= "browseFilesBackground" style = {{width: "9.02777777778%", height: "4.62850182704%",top: "56.1510353228%", left: "45.5555555556%"}}/>
              <div className= "publishText" onClick={this.publishFile}>Publish</div>
              <input class = "descriptionText" placeholder="Input description here" type = "text" value = {this.state.description} onChange = {this.handleTextChange}/>
              {this.state.alertBackground ?
              <div>
                <div className = "alertBackgroundFade"/>
                <div className = "alertBackground"/>
                <img className = "closeButton" style = {{position: "absolute",left: "67.7777777778%",top: "20.9500609013%"}} src = {closeAlert} alt="Close alert button" onClick = {this.handleRefresh}/>
                <img style = {{position: "absolute",width: "3.88888888889%",height: "auto",left: "45.2083333333%",top: "23.8733252132%"}} src = {fileImage} alt="File Img"/>
                <div className= "fileText" style ={{left: "49.7916666667%", top: "24.4823386114%", color: "#1E1E1E"}}>{this.handleFileName(this.state.fileName)}</div>
                <div className= "fileSize" style ={{left: "49.7916666667%", top: "27.7710109622%", color: "rgba(30, 30, 30, 0.8)"}}>{this.state.fileSize}</div>
                <img style = {{position: "absolute",width: "38.8888888889%;",height: "0.12180267965%",left: "30.5555555556%",top: "35.5663824604%"}} src = {line} alt="line"/>
                <div className="Progress">
                  <div className="ProgressBar"/>
                </div>
              </div>
              :
              <div/>
              }

              {this.state.barHeight >= 3 ?
              <div>
                <div className = "alertText" style= {{top: "38.6114494519%"}}>File is encrypted with ipfs and sha256</div>
                <img className = "checkIcon" style = {{top: "38.1242387333%"}} src = {checkIcon} alt="Check Icon"/>
                {this.state.barHeight === 3 ? 
                <div>
                  <div className = "alertText" style= {{top: "45.3105968331%"}}>Comparing hash</div>
                  <div class="loader" style = {{top: "44.9451887942%"}}/>
                </div> 
                : 
                <div/>}
              </div> 
              : 
              <div/>}

              {this.state.successAlert ?
              <div>
                {this.state.barHeight >= 24 ? 
                <div>
                  <div className = "alertText" style= {{top: "45.3105968331%"}}>Hash compared</div>
                  <img className = "checkIcon" style = {{top: "44.9451887942%"}} src = {checkIcon} alt="Check Icon"/>
                  {this.state.barHeight === 24 ? 
                  <div>
                    <div className = "alertText" style= {{top: "51.5225334957%"}}>Creating certificate</div>
                    <div class="loader" style = {{top: "51.1571254568%"}}/>
                  </div> 
                  : 
                  <div/>}
                </div> 
                : 
                <div/>}

                {this.state.barHeight >= 40 ? 
                <div>
                  <div className = "alertText" style= {{top: "51.5225334957%"}}>Certificate created</div>
                  <img className = "checkIcon" style = {{top: "51.1571254568%"}} src = {checkIcon} alt="Check Icon"/>
                  {this.state.barHeight === 40 ? 
                  <div>
                    <div className = "alertText" style= {{top: "57.7344701583%"}}>Uploading certificate to ipfs</div>
                    <div class="loader" style = {{top: "57.3690621194%"}}/>
                  </div> 
                  : 
                  <div/>}
                </div> 
                : 
                <div/>}

                {this.state.barHeight >= 58 ? 
                <div>
                  <div className = "alertText" style= {{top: "57.7344701583%"}}>Certificate uploaded to ipfs</div>
                  <img className = "checkIcon" style = {{top: "57.3690621194%"}} src = {checkIcon} alt="Check Icon"/>
                  {this.state.barHeight === 58 ? 
                  <div>
                    <div className = "alertText" style= {{top: "63.946406821%"}}>Uploading certificate to Binance smart chance</div>
                    <div class="loader" style = {{top: "63.580998782%"}}/>
                  </div> 
                  : 
                  <div/>}
                </div>
                : 
                <div/>}

                {this.state.barHeight >= 75 ? 
                <div>
                  <div className = "alertText" style= {{top: "63.946406821%"}}>Certificate uploaded on Binance smart chain</div>
                  <img className = "checkIcon" style = {{top: "63.580998782%"}} src = {checkIcon} alt="Check Icon"/>
                </div>
                : 
                <div/>}
                
                {this.state.barHeight >= 100 ? 
                <div>
                  <div className = "alertSuccessBigTitle">PUBLISHED</div>
                  <div className = "alertSuccessTitle" style ={{top: "72.7161997564%"}}> This file has been published on Binance smart chain </div>
                  <a style = {{position: "absolute", left: "45%", top: "74.6650426309%", fontFamily:"Open Sans", fontStyle: "normal", fontWeight: "normal", fontSize: "0.8vw", color: "#6F6F6F"}}target="_blank" rel="noopener noreferrer" href={'https://testnet.bscscan.com/tx/' + this.state.transactionLink}>View transaction</a>
                  <img style = {{position: "absolute",width: "2.5%;",height: "auto",left: "42.0833333333%",top: "71.2545676005%", filter: "drop-shadow(0px 4px 4px rgba(84, 114, 174, 0.2))"}} src = {bigCheckIcon} alt="Big Check Icon"/>
                </div>
                : 
                <div/>} 
              </div>
              :
              <div/>}

              {this.state.failAlert ?
                <div>
                  {this.state.barHeight >= 24 ? 
                  <div>
                    <div className = "alertText" style= {{top: "45.3105968331%"}}>Compared the hash</div>
                    <img className = "checkIcon" style = {{top: "44.9451887942%"}} src = {crossIcon} alt="Cross Icon"/>
                  </div> 
                  : 
                  <div/>}

                  {this.state.barHeight >= 100 ? 
                  <div>
                    <div className = "alertFailTitle" style ={{top: "72.3507917174%", left: "45%"}}>This file has been published on our network before</div>
                    <img style = {{position: "absolute",width: "2.5%",height: "auto",left: "42.0833333333%",top: "71.2545676005%"}} src = {bigCrossIcon} alt="Big Cross Icon"/>
                  </div> 
                  : 
                  <div/>}
                </div>
                :
                <div/>}
            </div>
            : 
            <div>
              <div className= "browseFilesBackground" style = {{width: "9.02777777778%", height: "4.62850182704%",top: "56.1510353228%", left: "45.5555555556%"}}/>
              <div className= "publishText" onClick={this.verifyFile}>Verify</div>
              {this.state.alertBackground ?
              <div>
                <div className = "alertBackgroundFade"/>
                <div className = "alertBackground"/>
                <img className = "closeButton" style = {{position: "absolute",left: "67.7777777778%",top: "20.9500609013%"}} src = {closeAlert} alt="Close alert button" onClick = {this.handleRefresh}/>
                <img style = {{position: "absolute",width: "3.88888888889%",height: "auto",left: "45.2083333333%",top: "23.8733252132%"}} src = {fileImage} alt="File Img"/>
                <div className= "fileText" style ={{left: "49.7916666667%", top: "24.4823386114%", color: "#1E1E1E"}}>{this.handleFileName(this.state.fileName)}</div>
                <div className= "fileSize" style ={{left: "49.7916666667%", top: "27.7710109622%", color: "rgba(30, 30, 30, 0.8)"}}>{this.state.fileSize}</div>
                <img style = {{position: "absolute",width: "38.8888888889%;",height: "0.12180267965%",left: "30.5555555556%",top: "35.5663824604%"}} src = {line} alt="line"/>
                <div className="Progress">
                  <div className="ProgressBar"/>
                </div>
              </div>
              :
              <div/>
              }
              {this.state.barHeight >= 3 ?
              <div>
                <div className = "alertText" style= {{top: "38.6114494519%"}}>File is encrypted with ipfs</div>
                <img className = "checkIcon" style = {{top: "38.1242387333%"}} src = {checkIcon} alt="Check Icon"/>
              </div> 
              : 
              <div/>}
              
              {this.state.successAlert ?
              <div>
                {this.state.barHeight >= 33 ? 
                <div>
                  <div className = "alertText" style= {{top: "48.7210718636%"}}>Compared the hash</div>
                  <img className = "checkIcon" style = {{top: "48.3556638246%"}} src = {checkIcon} alt="Check Icon"/>
                </div> 
                : 
                <div/>}

                {this.state.verifyAddressFail ? 
                <div>
                  {this.state.barHeight >= 70 ? 
                  <div>
                    <div className = "alertText" style= {{top: "61.5103532278%"}}>The owner of this collectibles is {this.state.verifyOwner.slice(0,15)}...</div>
                    <img className = "checkIcon" style = {{top: "61.1449451888%"}} src = {crossIcon} alt="Cross Icon"/>
                  </div>
                  : 
                  <div/>}
                </div> 
                : 
                <div>
                  {this.state.barHeight >= 70 ? 
                  <div>
                    <div className = "alertText" style= {{top: "61.5103532278%"}}>You are the owner of this collectible</div>
                    <img className = "checkIcon" style = {{top: "61.1449451888%"}} src = {checkIcon} alt="Check Icon"/>
                  </div>
                  : 
                  <div/>}
                </div>}
                

                {this.state.barHeight >= 99 ? 
                <div>
                  <div className = "alertSuccessBigTitle">VERIFIED</div>
                  <div className = "alertSuccessTitle" style ={{top: "72.7161997564%"}}> This is a valid certificate </div>
                  <a style = {{position: "absolute", left: "45%", top: "74.6650426309%", fontFamily:"Open Sans", fontStyle: "normal", fontWeight: "normal", fontSize: "0.8vw", color: "#6F6F6F"}}target="_blank" rel="noopener noreferrer" href={'https://testnet.bscscan.com/tx/' + this.state.transactionLink}>View transaction</a>
                  <img style = {{position: "absolute",width: "2.5%",height: "auto",left: "42.0833333333%",top: "71.2545676005%", filter: "drop-shadow(0px 4px 4px rgba(84, 114, 174, 0.2))"}} src = {bigCheckIcon} alt="Big Check Icon"/>
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
                    <div className = "alertText" style= {{top: "48.7210718636%"}}>Compared the hash</div>
                    <img className = "checkIcon" style = {{top: "48.3556638246%"}} src = {crossIcon} alt="Cross Icon"/>
                  </div> 
                  : 
                  <div/>}

                  {this.state.barHeight >= 99 ? 
                  <div>
                    <div className = "alertFailTitle" style ={{top: "72.3507917174%", left: "45%"}}>This file has not been published on our network</div>
                    <img style = {{position: "absolute",width: "2.5%;",height: "auto",left: "42.0833333333%",top: "71.2545676005%"}} src = {bigCrossIcon} alt="Big Cross Icon"/>
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
          <Dropzone style ={{position: "absolute",width: "58.4027777778%",height: "30.6942752741%",left: "20.8333333333%",top: "34.9573690621%", background: "rgba(0, 117, 255, 0.6)",mixBlendMode: "screen"}} onDrop = {this.handleOnDrop}>
            <img style = {{position: "absolute",width: "6.02777777778%",height: "auto",left: "46.61117717%", top: "15.873015873%"}} src={browseFileIcon} alt="Browse File Icon"/>
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

export default App;