import { abi } from '../../build/contracts/Publisher.json';
const address = '0x97B4b4CCe2483C868D32d3014c4FcE3Cf1b883bF';

export default function publisherContractSetup (dappWeb3) {
  return new dappWeb3.eth.Contract(abi, address)
}