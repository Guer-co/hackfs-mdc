import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import Web3 from 'web3';
import { DEV_ADDRESS } from './config';

//is everyone OK with material UI?
//browserrouter?

function Index() {

const [web3, setWeb3] = useState('');
const [loading, setLoading] = useState(false);


if (web3 === ''){
    setWeb3(new Web3(Web3.givenProvider));
}

useEffect(() => {
    const loadEthereumData = async () => {
        //this should prompt your metamask to ask you for access
        if (window.ethereum) {
            window.ethereum.autoRefreshOnNetworkChange = false;
            try {
                await window.ethereum.enable()
            } catch (error) {
                alert("Please allow us access to your metamask account to access this content");
            }
        }

    }
    loadEthereumData();
    setLoading(false);
},[]);
}

export default Index;

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
