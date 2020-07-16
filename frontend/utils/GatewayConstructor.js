import { abi } from '../../build/contracts/Gateway.json';
const address = '0x3e196A7204a901CD24f5832f3E93844b98a985Bb';

export default function gatewayContractSetup (dappWeb3) {
  return new dappWeb3.eth.Contract(abi, address)
}