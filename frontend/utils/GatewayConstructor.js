import web3 from './getWeb3';
import { abi, networks } from '../../build/contracts/Gateway.json';

export default function gatewayContractSetup() {
    return new web3.eth.Contract(abi, networks[5777].address)
}