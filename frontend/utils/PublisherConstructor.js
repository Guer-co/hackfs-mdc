import { abi } from '../../build/contracts/Publisher.json';

export default function publisherContractSetup (dappWeb3) {
  return new dappWeb3.eth.Contract(abi, process.env.Publisher_Address)
}