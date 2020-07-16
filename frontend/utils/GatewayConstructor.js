import { abi } from '../../build/contracts/Gateway.json';
const address = '0x3B844c96d8faBF924615939d94e073080fC81c87';

export default function gatewayContractSetup (dappWeb3) {
  return new dappWeb3.eth.Contract(abi, address)
}