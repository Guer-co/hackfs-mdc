import Web3 from 'web3';

let web3;
const provider = new Web3.providers.HttpProvider(
    `https://goreli.infura.io/v3/${process.env.INFURA_ID}` 
);
web3 = new Web3(provider);



export default web3;