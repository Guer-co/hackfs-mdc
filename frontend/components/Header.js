import { useState, useEffect } from 'react';
import { useStateValue } from '../state';
import Link from 'next/link';
import { Menu, Message, Icon } from 'semantic-ui-react';
import MiningIndicator from './MiningIndicator';
import addrShortener from '../utils/addrShortener';
import web3 from '../utils/getWeb3';

const Header = () => {
  const [{ dapp }, dispatch] = useStateValue();
  const [errorMessage, setError] = useState('');

  useEffect(() => {
    async function dispatchDapp() {
      try {
        dispatch({
          type: 'SET_WEB3',
          payload: web3
        });
        const network = await web3.eth.net.getId();
        dispatch({
          type: 'SET_NETWORK',
          payload: network
        });
        if (await ethereum._metamask.isApproved()) {
          let [address] = await ethereum.eth_requestAccounts;
          dispatch({
            type: 'SET_ADDRESS',
            payload: address
          });
          const balance = await web3.eth.getBalance(address);
          dispatch({
            type: 'SET_BALANCE',
            payload: balance
          });
        }
        // refreshes the dapp when a different address is selected in metamask
        ethereum.on('accountsChanged', (accounts) => {
          if (accounts) {
            dispatch({
              type: 'SET_ADDRESS',
              payload: accounts[0]
            });
          } else {
            dispatch({
              tyle: 'CLEAR_ACCOUNT'
            });
          }
        });
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(''), 3000);
      }
    }

    dispatchDapp();
  }, [dapp.address]);

  const handleSignInClick = async () => {
    try {
      let [address] = await ethereum.enable();
      dispatch({
        type: 'SET_ADDRESS',
        payload: address
      });
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <>
      <Menu style={{ marginTop: '10px' }}>
        <Link href='/'>
          <a>
            <Menu.Item><Icon name="home"/></Menu.Item>
          </a>
        </Link>
        <Menu.Menu position='right'>
          <Menu.Item onClick={handleSignInClick} onKeyUp={handleSignInClick}>
            {dapp.address === undefined
              ? <div><Icon name="ethereum"/ > Connect Wallet</div>
              : addrShortener(dapp.address)}
          </Menu.Item>
        </Menu.Menu>
      </Menu>
      {errorMessage && (
        <Message error header="Oops!" content={errorMessage} />
      )}
      {dapp.currentlyMining && (
        <div className='mining-state'>
          <span>Mining... &nbsp;</span>
          <MiningIndicator />
        </div>
      )}
      <style jsx>{`
        .mining-state {
          position: absolute;
          right: 0;
          display: flex;
          padding: 0 10px 0 0;
        }
      `}</style>
    </>
  );
};

export default Header;
