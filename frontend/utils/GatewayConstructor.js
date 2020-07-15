import { abi } from '../../build/contracts/Gateway.json';
const address = '0x18a6fda262f14ae1ec8bf4d6adacc0375fb30822';

export default function gatewayContractSetup (dappWeb3) {
  return new dappWeb3.eth.Contract(abi, address)
}