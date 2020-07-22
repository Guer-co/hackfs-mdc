import { abi } from '../../build/contracts/Gateway.json';

export default function gatewayContractSetup (dappWeb3) {
    return new dappWeb3.eth.Contract(abi, process.env.Publisher_Address)
}