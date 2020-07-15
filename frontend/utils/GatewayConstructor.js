import { abi } from '../../build/contracts/Gateway.json';
const address = '0xf2dA0229Aff5EB044D05451094FB3D64C312d0cE';

export default function gatewayContractSetup (dappWeb3) {
  return new dappWeb3.eth.Contract(abi, address)
}