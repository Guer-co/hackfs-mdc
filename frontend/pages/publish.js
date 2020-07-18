import React, { useState, useEffect } from 'react';
import { useStateValue } from '../state';
import Layout from '../components/Layout';
import {  Message, Icon, Button, Grid,Modal,Form  } from 'semantic-ui-react';
import Loader from 'react-loader-spinner';
import buffer from 'buffer';
import PublisherObjSetup from '../utils/PublisherConstructor';

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
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [logo,setLogo] = useState('');


  const PublisherContractObj = PublisherObjSetup(dapp.web3);

  useEffect(() => {
    const loadPublisherData = async () => {
      try {        
        if (dapp.address && mycontract === '') {
          //need to fix this line in solidity to only look for message sender
          const contractfetch = await PublisherContractObj.methods
            .getContentContracts(dapp.address)
            .call({ from: dapp.address });
          if (contractfetch.length > 0) {
            setMycontract(contractfetch[0]);
          }
        }
        // if (dapp.address && mycontract && allcontent.length === 0) {
        //   const contentcount = await PublisherContractObj.methods
        //     .doGetContentCount(mycontract)
        //     .call({ from: dapp.address });
        //   setContentcount(contentcount);
        // }
        // if (contentcount > 0) {
        //   //finally, lets read and dump any uploaded content into the console. This should be used on the 'dashboard' page that doesn't exist yet.
        //   //(this works, but I think you have to upload 2 pieces of data before it starts returning results --- need to review =( --- probably an issue in the smart contract
        //   const contentdetails = async () => {
        //     let temparray = [];
        //     for (let i = 1; i < contentcount; i++) {
        //       await PublisherContractObj.methods
        //         .doGetContent(mycontract, i)
        //         .call({ from: dapp.address })
        //         .then(function (result) {
        //           if (result[0].length > 0) {
        //             console.log(result);
        //             temparray.push(result);
        //           }
        //         });
        //     }
        //     setAllcontent(temparray);
        //   };
        //   contentdetails();
        // }
        loadPublisherData();
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(''), 3000);
      }
    };
  }, [dapp.address, mycontract]);

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

  const createPublisherProfile = async () => {
    try {
      await PublisherContractObj.methods
        .updatePublisherProfile(name,email,logo)
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
    // window.location.reload(false);
  };

  const addContentToContract = async () => {
    await PublisherContractObj.methods
      .doAddContent(mycontract, filehash, filename)
      .send({ from: dapp.address })
      .then(function (result) {
        window.location.reload(false);
      })
      .catch(function (error) {
        console.log(error);
      });
    //redirect to '/dashboard/ maybe????'''
  };

  return (
    <Layout style={{ backgroundColor: '#041727' }}>
      {errorMessage && <Message error header='Oops!' content={errorMessage} />}
      <Grid centered columns={2}>
        <Grid.Column>
          <div style={{ marginTop: '100px' }}>
            <hr />
            {mycontract === '' ||
            mycontract === undefined ||
            mycontract.length === 0 ? (
              <>
                <h3>1. Create your publisher profile so you can start to upload content</h3>
                <br />
                <div>
                  First, a prompt if you don't already have publisher profile.
                </div>
                <br />
                <Modal trigger={<Button>Create Profile</Button>}>
                    <Modal.Header>Input your name and email to create a new profile</Modal.Header>
                    <Modal.Content image>
                    <Modal.Description>
                        <Form>
                        <Form.Field>
                        <label>Name</label>
                        <input value={name} onChange={(e) => setName(e.target.value)}/>
                        </Form.Field>
                        <Form.Field>
                        <label>Email</label>
                        <input value={email} onChange={(e) => setEmail(e.target.value)}/>                        
                        </Form.Field>
                        </Form>
                        <Button onClick={createPublisherProfile}>Submit Profile!</Button>
                    </Modal.Description>
                    </Modal.Content>
                </Modal>
              </>
            ) : (
              <>
                <h3>1. Your Pay3 contract is created! Whats next???</h3>
                <p>
                  {' '}
                  <strong>Contract address:</strong> {mycontract}
                </p>
              </>
            )}
            <br />
            <hr />
            <h3>
              {filehash === ''
                ? '2. Upload some piece of data to IPFS'
                : '2. File ready to upload, see step 3'}
            </h3>
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
                    <p style={{ color: 'white', fontSize: '18px' }}>
                      Upload File
                    </p>
                  </div>
                </label>
                <br />
                <br />
              </>
            ) : (
              ''
            )}

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
                  <div id='name'>
                    <strong>Name:</strong> {filename}
                  </div>
                  <div id='name'>
                    <strong>IPFS HASH:</strong> {filehash}
                  </div>
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
            <h3>3. Store that piece of data in your smart contract</h3>
            <br />
            <Button onClick={addContentToContract}>
              Upload this file to your smart contract!
            </Button>
          </div>
        </Grid.Column>
      </Grid>
    </Layout>
  );
};

export default Publish;
