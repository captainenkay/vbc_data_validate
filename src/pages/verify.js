import { Component } from 'react';
import "./../App.css"
import "./verify.css"
import closeAlert from "./../assets/closeAlert.png"

class Verify extends Component {
  async componentWillMount(){
    this.state.url = window.location.href.split('?').pop()
    this.state.ipfs = this.state.url.substr(0, this.state.url.indexOf('#'));
    this.state.transaction = this.state.url.substr(this.state.url.indexOf('#') + 1, this.state.url.length)
  }

  constructor(props){
    super(props)
    this.state = {
        ipfs: '',
        transaction: '',
        url: '',
        isVerify: false,
        detail: []
    }
  }

  handleVerify = (event) =>{
    event.preventDefault()
    this.setState({isVerify: true})
  }

  handleRefresh = (event) => {
    event.preventDefault()
    this.setState({isVerify: false})
  }

  handleDetail(){
    var string = this.state.transaction.split('%23')
    console.log(string)
  }


  render(){
    return (
      <div className = "fullPage" style = {{width: "376px" ,height:"560px"}}>
        <div className = "verifyCard">
          <img class="image" src={'https://ipfs.infura.io/ipfs/' + this.state.ipfs} alt = "source"/>
        </div>
        <div className = "Text">{this.handleDetail()}</div>
        {this.state.transaction}
        <div className = "verifyButton" onClick = {this.handleVerify}>
          <div className = "verifyText"> Verify</div>
        </div>
        {this.state.isVerify? 
        <div>
          <div className = "verifyBackground">
            <img class = "closeButton" style = {{left: "270px",top: "5px"}} src = {closeAlert} alt="Close alert button" onClick = {this.handleRefresh}/>
          </div>
        </div> 
        : 
        <div/>}
      </div>
    );
  }
}

export default Verify;