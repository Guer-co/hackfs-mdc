import { abi, networks } from '../../build/contracts/Gateway.json';

export default function gatewayContractSetup (dappWeb3) {
    return new dappWeb3.eth.Contract(abi, networks[5777].address)
}