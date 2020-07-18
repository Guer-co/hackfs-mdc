import { abi } from '../../build/contracts/Gateway.json';
const address = '0x54896829432823D1ad6C8833182AFce0bc59dD14';

export default function gatewayContractSetup (dappWeb3) {
  return new dappWeb3.eth.Contract(abi, address)
}