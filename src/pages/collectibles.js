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
import {Link} from "react-router-dom"
import {Row, Col, Card, UncontrolledCollapse} from "reactstrap"

class Collectibles extends Component {
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

    if (JSON.parse(localStorage.getItem('Transaction')) != null){
      this.setState({transaction: JSON.parse(localStorage.getItem('Transaction'))})
    }
  }

  constructor(props){
    super(props);
    this.state = {
      account: '',
      transaction: [],
      collapse: false
    }
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({ collapse: !this.state.collapse });
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
        <div className = "metamaskText">{this.state.account.slice(0,10) + '...' + this.state.account.slice(38,42)}</div>

      <div className = "v2content" style={{background: "black"}}>
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
                        <div className = "detailButtonText" style ={{left: "123px", top:"279px"}} id={"toggler" + key}>Detail</div>
                        <img style = {{position: "absolute",width: "9px",height: "5px",left: "168px",top: "285px"}}src = {detailIcon} alt="Detail icon"/>
                        <UncontrolledCollapse toggler={"#toggler" + key}>
                          <div className = "detailBackground"/>
                          <div className = "date">Posted in {transaction.date.slice(8,10)} / {transaction.date.slice(5,7)} / {transaction.date.slice(0,4)}</div>
                          <a style = {{position: "absolute", width: "274px",height: "57px",left: "13px",top: "320px",fontFamily: "Open Sans", fontStyle: "normal", fontWeight: "600", fontSize: "14px", lineHeight: "19px",display: "flex", alignItems:"center", color: "#FFFFFF" }}target="_blank" rel="noopener noreferrer" href={'https:testnet.bscscan.com/tx/' + transaction.transactionHash}>View transaction</a>
                          <a style = {{position: "absolute", width: "274px",height: "57px",left: "13px",top: "353px",fontFamily: "Open Sans", fontStyle: "normal", fontWeight: "600", fontSize: "14px", lineHeight: "19px",display: "flex", alignItems:"center", color: "#FFFFFF" }}target="_blank" rel="noopener noreferrer" href={'https:ipfs.infura.io/ipfs/' + transaction.input}>View certificate</a>
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
                          <img class="editedImg" src={'https:ipfs.infura.io/ipfs/' + transaction.input} alt = "source"/>
                        </div>
                        <div className= "fileName">{transaction.fileName}</div>
                        <img style = {{position: "absolute",width: "274px",height: "1px",left: "13px",top: "265px"}}src = {collectiblesLine} alt="Collectibles Line"/>
                        <div className = "detailButtonText" style ={{left: "123px", top:"279px"}} id={"toggler" + key}>Detail</div>
                        <img style = {{position: "absolute",width: "9px",height: "5px",left: "168px",top: "285px"}}src = {detailIcon} alt="Detail icon"/>
                        <UncontrolledCollapse toggler={"#toggler" + key}>
                          <div className = "detailBackground"/>
                          <div className = "date">Posted in {transaction.date.slice(8,10)} / {transaction.date.slice(5,7)} / {transaction.date.slice(0,4)}</div>
                          <a style = {{position: "absolute", width: "274px",height: "57px",left: "13px",top: "320px",fontFamily: "Open Sans", fontStyle: "normal", fontWeight: "600", fontSize: "14px", lineHeight: "19px",display: "flex", alignItems:"center", color: "#FFFFFF" }}target="_blank" rel="noopener noreferrer" href={'https:testnet.bscscan.com/tx/' + transaction.transactionHash}>View transaction</a>
                          <a style = {{position: "absolute", width: "274px",height: "57px",left: "13px",top: "353px",fontFamily: "Open Sans", fontStyle: "normal", fontWeight: "600", fontSize: "14px", lineHeight: "19px",display: "flex", alignItems:"center", color: "#FFFFFF" }}target="_blank" rel="noopener noreferrer" href={'https:ipfs.infura.io/ipfs/' + transaction.input}>View file</a>
                        </UncontrolledCollapse>
                      </Card>
                    </Col>
                  )
                }
              }
            })}
          </Row>
        </div>
        <div className="collectiblesFooter"/>
      </div>
      // <div className = "fullPage">
      //   <img style = {{position: "absolute", width: "159px",height: "39px",left: "75px",top: "18px"}} src = {logoVBC} alt="logo VBC"/>

      //   {/* Home Button */}
      //   <Link to= "/home">
      //     <img style = {{position: "absolute",width: "20px", height: "19px", left:"475px", top: "27px"}} src = {homeLogo} alt="Home Logo Active"/>
      //     <div className = "inactivePageText" style ={{left: "504px"}}>Home</div>
      //   </Link>

      //   {/* Collectibles Button */}
      //   <Link to= "/collectibles">
      //     <img style = {{position: "absolute",width: "26px", height: "26px", left:"652px", top: "24px"}} src = {collectiblesLogoActive} alt="Collectibles Logo"/>
      //     <div className = "activePageText" style ={{left: "684px"}}>Collectibles</div>
      //   </Link>

      //   {/* About Button */}
      //   <Link to= "/about">
      //     <img style = {{position: "absolute",width: "26px", height: "26px", left:"880px", top: "24px"}} src = {aboutLogo} alt="About Logo"/>
      //     <div className = "inactivePageText" style={{left: "912px"}}>About</div>
      //   </Link>

      //   {/* Metamask Button */}
      //   <div className = "metamaskBackground"/>
      //   <div className = "metamaskText">{this.state.account.slice(0,10) + '...' + this.state.account.slice(38,42)}</div>

      //   <div className="footer"/>

      //   <div className = "v1content" style={{background: "black"}}>
      //     <Row style= {{margin: "0 0 0 0"}}>
      //       {this.state.transaction.map((transaction, key) => {
      //         if (transaction.address === this.state.account){
      //           if (transaction.fileName.split('.').pop().toLowerCase() === "pdf"){
      //             return(
      //               <Col key = {key} className = 'col-sm-3'>
      //                 <div className = "card" style ={{marginBottom: "112px", paddingLeft: "0px"}}>
      //                   <div className = "pdfBackground"/>
      //                   <img style = {{position: "absolute",width: "84px",height: "84px",left: "108px",top: "47px"}}src = {pdfPicture} alt="Pdf pic"/>
      //                   <div className= "fileName">{transaction.fileName}</div>
      //                   <img style = {{position: "absolute",width: "274px",height: "1px",left: "13px",top: "265px"}}src = {collectiblesLine} alt="Collectibles Line"/>
      //                   <div className = "detailButtonText" style ={{left: "123px", top:"279px"}} id={"toggler" + key}>Detail</div>
      //                   <img style = {{position: "absolute",width: "9px",height: "5px",left: "168px",top: "285px"}}src = {detailIcon} alt="Detail icon"/>
      //                   <UncontrolledCollapse toggler={"#toggler" + key}>
      //                     <div className = "detailBackground"/>
      //                     <div className = "date">Posted in {transaction.date.slice(8,10)} / {transaction.date.slice(5,7)} / {transaction.date.slice(0,4)}</div>
      //                     <a style = {{position: "absolute", width: "274px",height: "57px",left: "13px",top: "320px",fontFamily: "Open Sans", fontStyle: "normal", fontWeight: "600", fontSize: "14px", lineHeight: "19px",display: "flex", alignItems:"center", color: "#FFFFFF" }}target="_blank" rel="noopener noreferrer" href={'https:testnet.bscscan.com/tx/' + transaction.transactionHash}>View transaction</a>
      //                     <a style = {{position: "absolute", width: "274px",height: "57px",left: "13px",top: "353px",fontFamily: "Open Sans", fontStyle: "normal", fontWeight: "600", fontSize: "14px", lineHeight: "19px",display: "flex", alignItems:"center", color: "#FFFFFF" }}target="_blank" rel="noopener noreferrer" href={'https:ipfs.infura.io/ipfs/' + transaction.input}>View certificate</a>
      //                   </UncontrolledCollapse>
      //                 </div>
      //               </Col>
      //             )
      //           }
      //           if (transaction.fileName.split('.').pop().toLowerCase() === "png" || transaction.fileName.split('.').pop().toLowerCase() === "jpg" || transaction.fileName.split('.').pop().toLowerCase() === "jpeg"){
      //             return(
      //               <Col key = {key} className = 'col-sm-3'>
      //                 <Card style ={{marginBottom: "112px", paddingLeft: "0px"}}>
      //                   <div class="editedImg-container">
      //                     <img class="editedImg" src={'https:ipfs.infura.io/ipfs/' + transaction.input} alt = "source"/>
      //                   </div>
      //                   <div className= "fileName">{transaction.fileName}</div>
      //                   <img style = {{position: "absolute",width: "274px",height: "1px",left: "13px",top: "265px"}}src = {collectiblesLine} alt="Collectibles Line"/>
      //                   <div className = "detailButtonText" style ={{left: "123px", top:"279px"}} id={"toggler" + key}>Detail</div>
      //                   <img style = {{position: "absolute",width: "9px",height: "5px",left: "168px",top: "285px"}}src = {detailIcon} alt="Detail icon"/>
      //                   <UncontrolledCollapse toggler={"#toggler" + key}>
      //                     <div className = "detailBackground"/>
      //                     <div className = "date">Posted in {transaction.date.slice(8,10)} / {transaction.date.slice(5,7)} / {transaction.date.slice(0,4)}</div>
      //                     <a style = {{position: "absolute", width: "274px",height: "57px",left: "13px",top: "320px",fontFamily: "Open Sans", fontStyle: "normal", fontWeight: "600", fontSize: "14px", lineHeight: "19px",display: "flex", alignItems:"center", color: "#FFFFFF" }}target="_blank" rel="noopener noreferrer" href={'https:testnet.bscscan.com/tx/' + transaction.transactionHash}>View transaction</a>
      //                     <a style = {{position: "absolute", width: "274px",height: "57px",left: "13px",top: "353px",fontFamily: "Open Sans", fontStyle: "normal", fontWeight: "600", fontSize: "14px", lineHeight: "19px",display: "flex", alignItems:"center", color: "#FFFFFF" }}target="_blank" rel="noopener noreferrer" href={'https:ipfs.infura.io/ipfs/' + transaction.input}>View file</a>
      //                   </UncontrolledCollapse>
      //                 </Card>
      //               </Col>
      //             )
      //           }
      //         }
      //       })}
      //     </Row>
      //   </div>
      // </div>
    );
  }
}
export default Collectibles;