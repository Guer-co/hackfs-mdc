import { abi } from '../../build/contracts/Gateway.json';
const address = '0xBd9A8336adDae7BAa9E06408b24b055fB7727dFB';

export default function gatewayContractSetup (dappWeb3) {
  return new dappWeb3.eth.Contract(abi, address)
}