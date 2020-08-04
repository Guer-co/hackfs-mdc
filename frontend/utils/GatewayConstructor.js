import web3 from './getWeb3';
import { abi, networks } from '../../build/contracts/Gateway.json';

export default function gatewayContractSetup() {
    if (!process.env.FLEEK) {
        return new web3.eth.Contract(abi, networks[5777].address)
    } else {
        return new web3.eth.Contract(abi, networks[5].address)
    }
}