import React, { useState, useEffect } from 'react';
import { useStateValue } from '../state';
import Layout from '../components/Layout';
import { Menu, Message, Icon, Button, Grid } from 'semantic-ui-react';
import Loader from 'react-loader-spinner';
import buffer from 'buffer';
import GatewayContractObjSetup from '../utils/GatewayConstructor';

const Publish = () => {
    const [{ dapp }, dispatch] = useStateValue();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState('');
    const [filename, setFilename] = useState('');
    const [filehash, setFilehash] = useState('');
    const [errorMessage, setError] = useState('');
    const [mycontract, setMycontract] = useState('');
    const [contentcount, setContentcount] = useState(0);
    const [allcontent, setAllcontent] = useState([]);
    
    const GatewayContractObj = GatewayContractObjSetup(dapp.web3);

    const uploadToIPFS = async () => {
        setLoading(true);
        const data = new FormData();
        const file = document.getElementById('data_file').files[0];
        data.append('file', file);
        setFilename(file.name);
        fetch('http://localhost:8888/api/ipfs', {
        body: data,
        method: 'POST'
        })
        .then((res) => res.json())
        .then((res) => {
            console.log(res);
            setFilehash(res);
            setLoading(false);
        })
        .catch((err) => {
            setError(err.message);
            setTimeout(() => setError(''), 3000);
        });
    };

    const enterGateway = async () => {
    try {
        await GatewayContractObj.methods
        .createSimple()
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
    } catch (err) {
        setError(err.message);
        setTimeout(() => setError(''), 3000);
    }
    window.location.reload(false);

};

    const addContentToContract = async () => {
        console.log(mycontract + ' ' + filehash + ' ' + filename + ' ' + dapp.address);
        await GatewayContractObj.methods.doAddContent(mycontract, filehash, filename).send({ from: dapp.address })
            .then(function(result){
                window.location.reload(false);
            }).catch(function(error){
                console.log(error);
        });
    }

useEffect(() => {
    
    const loadGatewayData = async () => {
        if (dapp.address && mycontract === '') {
            setLoading(true);
            //need to fix this line in solidity to only look for message sender
            const contractfetch = await GatewayContractObj.methods.getUserContracts(dapp.address).call({from:dapp.address});
            setMycontract(contractfetch[0]);
            setLoading(false);
        }
        console.log(dapp.address);
        console.log(mycontract);
        if (dapp.address && mycontract && allcontent === ''){
            setLoading(true);
            const contentcount = await GatewayContractObj.methods.doGetContentCount(mycontract).call({from:dapp.address});
            setContentcount(contentcount);
            setLoading(false);
        }
        if (contentcount > 0) {
            console.log(contentcount);
            const contentdetails = async () => {
            let temparray = [];
            for (let i = 0;i < contentcount;i++){
                await GatewayContractObj.methods.doGetContent(mycontract, i).call({from: props.myaccount})
                .then(function(result){
                    //console.log(result);
                    temparray.push(result);
                });
            }
            setAllcontent(temparray);
            }
            contentdetails();
        }
    }
    loadGatewayData();
    setLoading(false);
},[mycontract,dapp.address]);

  return (
    <Layout style={{ backgroundColor: '#041727' }}>
      {errorMessage && (
        <Message error header="Oops!" content={errorMessage} />
      )}
      <Grid centered columns={2}>
        <Grid.Column>
          <div style={{ marginTop: '100px' }}>
            <hr />
            {mycontract !== '' ?
                <>
                <h3>
                1. Create your smart contract
                </h3>
                <br />
                <div>
                First, a prompt if you don't already have a smart contract
                launched via our smart contract, we will auto detect this based on
                the address you are using when you land on the site.
                </div>
                <br />
                <Button onClick={enterGateway}>
                Create your own smart contract on Pay3!
                </Button>
                </>
            : 
                <>
                    <h3>
                    1. Your Pay3 contract is created! Whats next???
                    </h3>
                </>
            }
            <br />
            <hr />
            <h3>{filehash === '' ? ("2. Upload some piece of data to IPFS") : ("2. File ready to upload, see step 3")}</h3>
            <br />
            {filehash === '' ? (
            <>
            <input
              id='data_file'
              type='file'
              style={{ display: 'none' }}
              onChange={uploadToIPFS}
            />
            <label htmlFor='data_file'>
              <div
                id='uploadarea file-field input-field'
                className='ui basic button'
                style={{
                  borderRadius: '250px',
                  width: '250px',
                  height: '250px',
                  border: '3px solid white',
                  paddingTop: '75px',
                  textAlign: 'center'
                }}
              >
                <Icon
                  style={{ margin: 'auto', color: 'white' }}
                  name='add'
                  size='huge'
                />
                <br />
                <br />
                <br />
                <p style={{ color: 'white', fontSize: '18px' }}>Upload File</p>
              </div>
            </label>
            <br />
            <br />
            </>) : '' 
            }

            <div id='ipfsdata'>
              {loading === true ? (
                <>
                  <Loader
                    type='Grid'
                    color='#fcfcfc'
                    height={100}
                    width={100}
                    timeout={10000} //3 secs
                  />
                </>
              ) : (
                ''
              )}
              {filehash !== '' ? (
                <>
                  <div id='name'><strong>Name:</strong> {filename}</div>
                  <div id='name'><strong>IPFS HASH:</strong> {filehash}</div>
                  <div id='link'>
                    <strong>Link to file:</strong>{' '}
                    <a
                      target='_blank'
                      rel='no-follow'
                      href={`https://cloudflare-ipfs.com/ipfs/${filehash}`}
                    >
                      LINK
                    </a>
                  </div>
                </>
              ) : (
                ''
              )}
            </div>
            <br />
            <hr />
            <h3>
              3. Store that piece of data in your smart contract
            </h3>
            <br />
            <Button onClick={addContentToContract}>Upload this file to your smart contract!</Button>
          </div>
        </Grid.Column>
      </Grid>
    </Layout>
  );
};

export default Publish;
