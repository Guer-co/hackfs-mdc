import { abi } from '../../build/contracts/Gateway.json';

export default function gatewayContractSetup (dappWeb3) {
    return new dappWeb3.eth.Contract(abi, "0x97Bf69F399DF6a7921BFF322136fCe6544ceE6Ee")
}