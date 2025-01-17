import TokenArt from '../abis/MemeArt.json'
import React, { Component } from 'react';
import Navbar from './Navbar'
import Main from './Main'
import Web3 from 'web3';
import './App.css';

const { RelayProvider } = require("@opengsn/gsn")
const relayHubAddress = require('../gsn/RelayHub.json').address
const stakeManagerAddress = require('../gsn/StakeManager.json').address
const paymasterAddress = require('../gsn/Paymaster.json').address

//Declare IPFS
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      // window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
      // const tmpProvider = new ethers.providers.Web3Provider(window.ethereum);
      // network = await tmpProvider.ready
      const gsnConfig = {
        relayHubAddress,
        paymasterAddress,
        stakeManagerAddress,
        methodSuffix: '_v4',
        jsonStringifyRequest: true,
        // TODO: this is actually a reported bug in MetaMask. Should be:
        // chainId: network.chainId
        // but chainID == networkId on top ethereum networks. See https://chainid.network/
        // chainId: window.ethereum.networkVersion
        chainId: 1337
      }
      const gsnProvider = new RelayProvider(window.ethereum, gsnConfig);
      window.web3 = new Web3(gsnProvider);
    }
    // else if (window.web3) {
    //   window.web3 = new Web3(window.web3.currentProvider)
    // }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    // Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = TokenArt.networks[networkId]
    if(networkData) {
      const tokenArt = new web3.eth.Contract(TokenArt.abi, networkData.address)
      this.setState({ tokenArt })
      const imagesCount = await tokenArt.methods.imageCount().call()
      this.setState({ imagesCount })
      // Load images
      for (var i = 1; i <= imagesCount; i++) {
        const image = await tokenArt.methods.images(i).call()
        this.setState({
          images: [...this.state.images, image]
        })
      }

      this.setState({ loading: false})
    } else {
      window.alert('TokenArt contract not deployed to detected network.')
    }
  }

  uploadImage = (price, buffer) => {
    console.log("Submitting file to ipfs...")

    //adding file to the IPFS
    ipfs.add(buffer, (error, result) => {
      console.log('Ipfs result', result)
      if(error) {
        console.error(error)
        return
      }

      this.setState({ loading: true })
      this.state.tokenArt.methods.uploadImage(result[0].hash, price).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
        // refresh
        window.location.reload(false);
      })
    })
  }

  buyNFT(id, price) {
     this.setState({ loading: true })
     this.state.tokenArt.methods.buyFromOwner(id).send({ from: this.state.account, value: price }).on('transactionHash', (hash) => {
       this.setState({ loading: false })
     })
   }

  getValueInput = event => {
      event.preventDefault()
      const searchValue = event.target.value
      const last = this.state.userSearchFilter

      this.setState({ userSearchFilterLast: this.state.userSearchFilter })
      this.setState({ userSearchFilter: searchValue })

      console.log("in getValueInput, last value =  ",  last)
      this.filterNames(searchValue)

      this.setState({ userSearchFilterLast: searchValue })
      if (searchValue == "" || last.length > searchValue.length)
        window.location.reload(false);
  }

  filterNames (searchValue) {
      const { images } = this.state
      console.log("in filterNames searchValue = ", searchValue)
      this.setState({
        images: images.filter(x => x.owner.includes(searchValue))
      })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      tokenArt: null,
      images: [],
      userSearchFilter: "",
      userSearchFilterLast: "",
      loading: true
    }

    this.uploadImage = this.uploadImage.bind(this)
    this.filterNames = this.filterNames.bind(this);
    this.getValueInput = this.getValueInput.bind(this);
    this.buyNFT = this.buyNFT.bind(this);
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
              images={this.state.images}
              uploadImage={this.uploadImage}
              filterNames={this.filterNames}
              getValueInput={this.getValueInput}
              buyNFT = {this.buyNFT}
            />
        }
      </div>
    );
  }
}

export default App;
