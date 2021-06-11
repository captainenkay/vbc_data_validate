import { Component } from 'react';

class Result extends Component {
  async componentWillMount(){
    await this.loadStorage()
  }

  async loadStorage(){
    if (localStorage.getItem('imageLink') != null){
      this.setState({image: 'https:ipfs.infura.io/ipfs/' + localStorage.getItem('imageLink')})
    }
  }
  constructor(props){
    super(props);
    this.state = {
      image: ''
    }
  }

  render(){
    return (
      <div>
        <img src={this.state.image} alt = "source"/>
      </div>
    );
  }
}

export default Result;
