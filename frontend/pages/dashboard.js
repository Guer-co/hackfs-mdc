import React, { useState, useEffect } from 'react';
import { useStateValue } from '../state';
import Layout from '../components/Layout';
import {
  Message,
  Icon,
  Button,
  Grid,
  Modal,
  Form,
  Popup,
  Checkbox
} from 'semantic-ui-react';
import Loader from 'react-loader-spinner';
import GatewayContractObjSetup from '../utils/GatewayConstructor';
import Moment from 'react-moment';

const Publish = () => {
  const [{ dapp }, dispatch] = useStateValue();
  const [loading, setLoading] = useState(false);
  //const [file, setFile] = useState('');
  const [filename, setFilename] = useState('');
  const [filehash, setFilehash] = useState('');
  const [filetype, setFiletype] = useState('');
  const [filepreview, setFilepreview] = useState('');
  const [errorMessage, setError] = useState('');
  const [mycontracts, setMycontracts] = useState('');
  const [contentarray, setContentarray] = useState([]);
  const [contentAddress, setContentAddress] = useState('');
  const [allcontent, setAllcontent] = useState([]);
  const [myprofile, setMyprofile] = useState('');
  const [openmodal, setOpenmodal] = useState(false);
  const [modalfilename, setModalfilename] = useState('');
  const [modalfilehash, setModalfilehash] = useState('');
  const [modalfiletype, setModalfiletype] = useState('');
  const [modalfiletitle, setModalfiletitle] = useState('');
  const [modalfiledescription, setModalfiledescription] = useState('');
  const [modalfilepreview, setModalfilepreview] = useState('');
  const [modalfilefee, setModalfilefee] = useState('');
  const [modalfilefree, setModalfilefree] = useState('');
  const [modalfiledate, setModalfiledate] = useState('');
  const [balance, setBalance] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [free, setFree] = useState(true);
  let cbalance;

  const GatewayContractObj = GatewayContractObjSetup(dapp.web3);

  useEffect(() => {
    const loadProfile = async () => {
      if (dapp.address && myprofile === '') {
        const profilefetch = await GatewayContractObj.methods
          .getPublisherProfile(dapp.address)
          .call({ from: dapp.address });
        setMyprofile(profilefetch);
        console.log(profilefetch);
        web3.eth.getBalance(profilefetch[0], function (error, result) {
          if (error) {
            console.log(error);
          } else {
            setBalance(result);
            console.log(result);
          }
        });
      }

      if (dapp.address && contentarray.length === 0) {
        const contentaddresses = await GatewayContractObj.methods
          .getPublisherContracts(dapp.address)
          .call({ from: dapp.address });
        if (contentaddresses.length > 0) {
          setContentarray(contentaddresses);
        }
      }
      if (contentarray.length > 0 && allcontent.length === 0) {
        const contentdetails = async () => {
          let temparray = [];
          for (let i = 0; i < contentarray.length; i++) {
            await GatewayContractObj.methods
              .getContentInfo(contentarray[i])
              .call({ from: dapp.address })
              .then(function (result) {
                temparray.push(result);
              });
          }
          setAllcontent(temparray);
        };
        contentdetails();
      }
    };
    loadProfile();
  }, [dapp.address, myprofile, allcontent, contentarray]);

  const uploadToIPFS = async () => {
    setLoading(true);
    const data = new FormData();
    const file = document.getElementById('data_file').files[0];
    console.log(file);
    data.append('file', file);
    setFilename(file.name);
    setFiletype(file.type);
    data.append('ownerId', myprofile[0]);
    data.append('description', "Published by " + myprofile[1])

    fetch('http://localhost:8888/api/upload', {
      body: data,
      method: 'POST'
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        setFilehash(res.bucketKey);
        setFilepreview(res.previewUrl);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  const addContentToContract = async () => {
    await GatewayContractObj.methods
      .createContent(
        myprofile[0],
        filehash,
        filepreview,
        filename,
        filetype,
        title,
        description,
        free,
        price,
        myprofile[1]
      )
      .send({ from: dapp.address })
      .then(function (result) {
        console.log(result);
        window.location.reload(false);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const withdrawEarnings = async () => {
    dapp.web3.eth.getBalance(myprofile[0], function (err, result) {
      if (err) {
        console.log(err);
      } else {
        cbalance = result;
        console.log(result);
      }
    });
    await GatewayContractObj.methods
      .doTransferFunds(dapp.address)
      .send({ from: dapp.address })
      .then(function (result) {
        console.log(result);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const doReceiveFunds = () => {
    dapp.web3.eth.sendTransaction(
      {
        to: myprofile[0],
        from: dapp.address,
        value: dapp.web3.utils.toWei('0.03', 'ether')
      },
      function (error, hash) {
        console.log(error);
        console.log(hash);
        window.location.reload(false);
      }
    );
  };

  //const updateProfile = async () => {
  //};

  return (
    <Layout style={{ backgroundColor: '#041727' }}>
      {errorMessage && <Message error header='Oops!' content={errorMessage} />}
      <Grid centered>
        <Grid.Column width={16}>
          <div style={{ textAlign: 'center' }}>
            <h3>
              Publisher Dashboard P3{' '}
              <img
                src='https://hub.textile.io/ipns/bafzbeid2hz44kd5zpnjbjeinjyyqxpbfgw5crazvmhf7tkmj4nfxy2hb4q/thumbnail.jpg'
                style={{
                  width: '50px',
                  backgroundColor: 'white',
                  borderRadius: '25px'
                }}
              />
            </h3>
            <hr />
            <div>
              Publisher Address: {myprofile[0]}
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Name: {myprofile[1]}
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Email: {myprofile[2]}{' '}
            </div>
          </div>
        </Grid.Column>
        <Grid.Column width={3}>
          <div style={{ padding: '25px', fontSize: '16px' }}>
            <a href='/'>home</a>
          </div>
        </Grid.Column>
        <Grid.Column width={7}>
          <div style={{ borderLeft: '1px solid #999', padding: '25px' }}>
            <h3>Publish New Content</h3>
            {filehash === '' ? (
              loading === true ? (
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
                        borderRadius: '20px',
                        width: '100%',
                        height: '150px',
                        border: 'dashed 2px #999',
                        textAlign: 'center',
                        paddingTop: '20px'
                      }}
                    >
                      <Icon style={{ margin: 'auto' }} name='add' size='huge' />
                      <br />
                      <br />
                      <br />
                      <p style={{ fontSize: '18px' }}>Upload New Content</p>
                    </div>
                  </label>
                  <br />
                  <br />
                </>
              )
            ) : (
              <>
                {filetype == 'image/png' ||
                filetype == 'image/jpg' ||
                filetype == 'image/jpeg' ||
                filetype == 'image/gif' ? (
                  <img
                    style={{
                      border: '1px dotted #999',
                      width: '125px',
                      height: '125px',
                      margin: '5px'
                    }}
                    src={filepreview}
                    onClick={() => setOpenmodal(true)}
                  />
                ) : (
                  <div
                    style={{
                      border: '1px dotted #999',
                      height: '125px',
                      width: '125px'
                    }}
                  >
                    <Icon
                      style={{ margin: 'auto' }}
                      name='file outline'
                      size='massive'
                      onClick={() => setOpenmodal(true)}
                    />
                  </div>
                )}
                <div id='name'>
                  <strong>Name:</strong> {filename}
                </div>
                <div id='hash'>
                  <strong>IPNS HASH:</strong> {filehash}
                </div>
                <div id='link'>
                  <strong>Link to file:</strong>{' '}
                  <a target='_blank' rel='no-follow' href={filehash}>
                    LINK
                  </a>
                </div>
              </>
            )}
          </div>
        </Grid.Column>
        <Grid.Column width={6}>
          {filehash === '' ? (
            <div style={{ borderLeft: '1px solid #999', padding: '25px' }}>
              <h5 style={{ margin: '0px' }}>Payments</h5>
              <h2 style={{ margin: '0px' }}>$111.11 ETH</h2>
              <br />
              <h5 style={{ margin: '0px' }}>Costs</h5>
              <h2 style={{ margin: '0px' }}>$222.22 ETH &nbsp;</h2>
              <br />
              <h5 style={{ margin: '0px' }}>Earnings $</h5>
              <h2 style={{ margin: '0px' }}>
                <Icon name='ethereum' />{' '}
                {balance ? balance / 1000000000000000000 + ' eth' : '0.00'}
                &nbsp;&nbsp;&nbsp;&nbsp;
                <Popup
                  content='Withdraw Funds'
                  trigger={
                    <Button
                      icon='external square'
                      onClick={() => withdrawEarnings()}
                    />
                  }
                />
                <button
                  className='btn btn-warning'
                  onClick={() => {
                    doReceiveFunds();
                  }}
                >
                  Test send $ to contract
                </button>
              </h2>
              <br />
              <h5 style={{ margin: '0px' }}>Users</h5>
              <h2 style={{ margin: '0px' }}>
                3333 users&nbsp;&nbsp;&nbsp;&nbsp;
                <Popup
                  content='View Subscriber Addresses'
                  trigger={
                    <Button icon='users' onClick={() => console.log('b')} />
                  }
                />
              </h2>
            </div>
          ) : (
            <div
              style={{
                borderLeft: '1px solid #999',
                padding: '25px'
              }}
            >
              <Form>
                <Form.Field>
                  <label className='blacktext'>Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Form.Field>
                <Form.Field>
                  <label className='blacktext'>Description</label>
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Form.Field>
                <Form.Field>
                  <span className='blacktext'>Free? </span>
                  <Checkbox
                    className='blacktext'
                    checked={free}
                    onClick={() => setFree(!free)}
                  />
                </Form.Field>
                {!free ? (
                  <Form.Field>
                    <label className='blacktext'>
                      Price for this content (in Eth)
                    </label>
                    <input
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </Form.Field>
                ) : (
                  ''
                )}
              </Form>
              <br />
              <br />
              <Button onClick={addContentToContract}>
                Publish this content
              </Button>
            </div>
          )}
        </Grid.Column>
        <Grid.Column width={3}>
          <div></div>
        </Grid.Column>
        <Grid.Column width={13}>
          <div>
            <h3>Recent Uploaded Content</h3>
            <hr />
            <div style={{ display: 'flex' }}>
              {allcontent.map((result) => {
                return (
                  <div className='imagebox' key={result[0]}>
                    <div
                      onClick={() => {
                        setModalfilehash(result[0]);
                        setModalfilepreview(result[1]);
                        setModalfiledate(result[6]);
                        setModalfilename(result[2]);
                        setModalfiletype(result[3]);
                        setModalfilefree(result[7]);
                        setModalfilefee(result[8]);
                        setModalfiletitle(result[4]);
                        setModalfiledescription(result[5]);
                        setContentAddress(result[9]);
                        setOpenmodal(true);
                      }}
                    >
                      {result[2] == 'image/png' ||
                      result[2] == 'image/jpg' ||
                      result[2] == 'image/jpeg' ||
                    result[2] == 'image/gif' ? (
                        <img
                          style={{
                            border: '1px dotted #999',
                            width: '125px',
                            height: '125px',
                            margin: '5px'
                          }}
                          src={result[1]}
                        />
                      ) : (
                        <div
                          style={{
                            border: '1px dotted #999',
                            height: '125px',
                            width: '125px'
                          }}
                        >
                          <Icon
                            style={{ margin: 'auto' }}
                            name='file outline'
                            size='massive'
                            onClick={() => setOpenmodal(true)}
                          />
                        </div>
                      )}
                    </div>
                    <p>
                      {result[3]}
                      <br />
                      <Moment format='MM/DD/YY HH:mm' unix>
                        {result[6]}
                      </Moment>
                    </p>
                    <Modal
                      open={openmodal}
                      size='small'
                      closeIcon
                      onClose={() => setOpenmodal(false)}
                    >
                      <Modal.Content style={{ backgroundColor: '#999' }}>
                        <Modal.Description style={{ textAlign: 'center' }}>
                          {result[2] == 'image/png' ||
                          result[2] == 'image/jpg' ||
                          result[2] == 'image/jpeg' ||
                          result[2] == 'image/gif' ? (
                            <a
                              rel='noopener noreferrer'
                              target='_blank'
                              href={modalfilehash}
                            >
                              <img
                                style={{
                                  border: '1px dotted #999',
                                  width: '125px',
                                  height: '125px',
                                  margin: '5px'
                                }}
                                src={result[1]}
                              />
                            </a>
                          ) : (
                            <a
                              rel='noopener noreferrer'
                              target='_blank'
                              href={modalfilehash}
                            >
                              <div
                                style={{
                                  border: '1px dotted #999',
                                  height: '125px',
                                  width: '125px',
                                  margin: '0 auto'
                                }}
                              >
                                <Icon
                                  style={{ margin: 'auto' }}
                                  name='file outline'
                                  size='massive'
                                  onClick={() => setOpenmodal(true)}
                                />
                              </div>
                            </a>
                          )}

                          <br />
                          <p style={{ fontSize: '18px' }}>
                            Filename: {modalfilename}
                            <br />
                            Hash: {modalfilehash}
                            <br />
                            Type: {modalfiletype}
                            <br />
                            Title: {modalfiletitle}
                            <br />
                            Desc: {modalfiledescription}
                            <br />
                            Uploaded:&nbsp;
                            <Moment format='MM/DD/YY HH:mm' unix>
                              {modalfiledate}
                            </Moment>
                            <br />
                            {modalfilefree
                              ? 'Free content'
                              : 'Price: ' + modalfilefee + ' ETH'}
                          </p>
                          <Button onClick={() => setOpenmodal(false)}>
                            close
                          </Button>
                        </Modal.Description>
                      </Modal.Content>
                    </Modal>
                  </div>
                );
              })}
            </div>
          </div>
        </Grid.Column>
      </Grid>
    </Layout>
  );
};

export default Publish;
