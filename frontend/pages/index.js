import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStateValue } from '../state';
import Layout from '../components/Layout';
import {
  Message,
  Icon,
  Button,
  Grid,
  Modal,
  Form,
  Checkbox,
  Card
} from 'semantic-ui-react';
import GatewayObjSetup from '../utils/GatewayConstructor';

const Index = ({ contentContracts }) => {
  const [{ dapp }, dispatch] = useStateValue();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setError] = useState('');
  const [myprofile, setMyprofile] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [logo, setLogo] = useState('');
  const [cost, setCost] = useState(1);
  const [profilemodal, setProfilemodal] = useState(true);
  const [contentmodal, setContentmodal] = useState(false);

  const GatewayContractObj = GatewayObjSetup();
  
  useEffect(() => {
    const loadProfile = async () => {
      if (dapp.address && myprofile === '') {
        const profilefetch = await GatewayContractObj.methods
          .getPublisherProfile(dapp.address)
          .call({ from: dapp.address });
        const userfetch = await GatewayContractObj.methods
          .getUserProfile(dapp.address)
          .call({ from: dapp.address });
        if (profilefetch[0] !== '0x0000000000000000000000000000000000000000') {
          window.location.href = '/dashboard';
        }
        if (userfetch[0] !== '0x0000000000000000000000000000000000000000') {
          window.location.href = '/browse';
          //setMyprofile(userfetch);
          //setProfilemodal(false);
        }
      }
    };

    // loadProfile();
  }, [dapp.address, myprofile]);

  const renderContent = () => {
    const items = contentContracts.map(address => {      
      return {
        header: address, // tried to set this to the contractTitle but ran into some issues, gonna leave it like this for now. 
        description: (
          <Link href={`/content/${address}`}>
            <a>View Content</a>
          </Link>
        ),
        fluid: true
      }
    });
    
    return <Card.Group items={items} />;
  }

  const createPublisherProfile = async () => {
    await GatewayContractObj.methods
      .createNewPublisher(name, email, logo, cost)
      .send({ from: dapp.address })
      .on('transactionHash', (hash) => {
        dispatch({
          type: 'SET_CURRENTLY_MINING',
          payload: true
        });
      })
      .on('receipt', (hash) => {
        dispatch({
          type: 'SET_CURRENTLY_MINING',
          payload: false
        });
      });
    setProfilemodal(false);
    window.location.href = '/dashboard';
  };

  const createUserProfile = async () => {
    await GatewayContractObj.methods
      .createNewUser(name, email)
      .send({ from: dapp.address })
      .on('transactionHash', (hash) => {
        dispatch({
          type: 'SET_CURRENTLY_MINING',
          payload: true
        });
      })
      .on('receipt', (hash) => {
        dispatch({
          type: 'SET_CURRENTLY_MINING',
          payload: false
        });
      });
    setProfilemodal(false);
    window.location.reload(false);
  };

  return (
    <Layout style={{ backgroundColor: '#041727' }}>
      {errorMessage && <Message error header='Oops!' content={errorMessage} />}
      <Link href='/dashboard'>
        <a>
          <Button
            content='Start Publishing!'
            icon='add circle'
            primary
            floated='right'
          />
        </a>
      </Link>
      {renderContent()}
    </Layout>
  );
};

export async function getStaticProps() {
  const GatewayContractObj = await GatewayObjSetup();
  const contentContracts = await GatewayContractObj.methods.getContentContracts().call();

  return {
    props: { contentContracts }
  }    
}

export default Index;
