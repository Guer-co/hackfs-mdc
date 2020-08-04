import Web3 from 'web3';

let web3;
let url = '';

if (process.env.FLEEK) {
    url = `https://goerli.infura.io/v3/${process.env.INFURA_ID}`;
} else {
    url = 'http://127.0.0.1:8545'
}

if (typeof window !== 'undefined') {
  // Modern dapp browsers...
  if (typeof window.ethereum !== 'undefined') {
    window.ethereum.autoRefreshOnNetworkChange = false;
    web3 = new Web3(window.ethereum);
  }
  // Legacy dapp browsers...
  else if (typeof window.web3 !== 'undefined') {
    // Use Mist/MetaMask's provider.
    window.ethereum.autoRefreshOnNetworkChange = false;
    web3 = new Web3(window.web3.currentProvider);
    console.log('Injected web3 detected.');
  }      
}        
// Fallback to Infura Node.
else {
  const provider = new Web3.providers.HttpProvider(
    url
  );
  web3 = new Web3(provider);
}


export default web3;