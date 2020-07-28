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
import Moment from 'react-moment';

const Index = () => {
  const [{ dapp }, dispatch] = useStateValue();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setError] = useState('');
  const [myprofile, setMyprofile] = useState('');
  const [myuser, setMyuser] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [logo, setLogo] = useState('');
  const [cost, setCost] = useState(1);
  const [content, setContent] = useState([]);
  const [contentAddress, setContentAddress] = useState('');
  const [profilemodal, setProfilemodal] = useState(false);
  const [usermodal, setUsermodal] = useState(false);
  const [contentmodal, setContentmodal] = useState(false);
  const [contentinfo, setContentinfo] = useState([]);
  const [modalfilename, setModalfilename] = useState('');
  const [modalfilehash, setModalfilehash] = useState('');
  const [modalfiletype, setModalfiletype] = useState('');
  const [modalfiletitle, setModalfiletitle] = useState('');
  const [modalfiledescription, setModalfiledescription] = useState('');
  const [modalfilepreview, setModalfilepreview] = useState('');
  const [modalfilefee, setModalfilefee] = useState('');
  const [modalfilefree, setModalfilefree] = useState('');
  const [modalfiledate, setModalfiledate] = useState('');
  const [forcerefresh, setForcerefresh] = useState(false);
  const GatewayContractObj = GatewayObjSetup();

  let temparray = [];

  useEffect(() => {
    const loadProfile = async () => {
      if (content.length === 0) {
          console.log(content.length);
        const getcontent = await GatewayContractObj.methods
          .getContentContracts()
          .call({ from: dapp.address });
        if (getcontent.length > 0) {
            getcontent.map(async (cadd) => {
            let c = await GatewayContractObj.methods
                .getContentInfo(cadd)
                .call({ from: dapp.address });
            temparray.push(c);
            });
            setContentinfo(temparray);

            setContent(getcontent);
        }

      }
      if (dapp.address && myprofile === '') {
        const profilefetch = await GatewayContractObj.methods
          .getPublisherProfile(dapp.address)
          .call({ from: dapp.address });
        const userfetch = await GatewayContractObj.methods
          .getUserProfile(dapp.address)
          .call({ from: dapp.address });
        if (profilefetch[0] !== '0x0000000000000000000000000000000000000000') {
          setMyprofile(profilefetch);
        }
        if (userfetch[0] !== '0x0000000000000000000000000000000000000000') {
          setMyuser(userfetch);
        }
      }
    };

    loadProfile();
  }, [dapp.address, myprofile,content]);

  const createPublisherProfile = async () => {
    try {
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
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
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
      <Grid centered>
        <Grid.Column width={16}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              {myprofile ? (
                <Button href='/dashboard'>My Publisher Dashboard</Button>
              ) : (
                <Button onClick={() => setProfilemodal(true)}>
                  I want to publish on Pay3
                </Button>
              )}
              {/*
                <p>
                Welcome: {myprofile[1]} {myprofile[2]} 
                </p>
                <h2>Browse decentralized content on P3!</h2>
                <hr />
                */}
            </div>
          </div>
        </Grid.Column>
        <Grid.Column width={16}>
          <div style={{ padding: '25px', display: 'flex' }}>
            {contentinfo.map((result) => {
              return (
                <div
                  key={result[6]}
                  style={{ position: 'relative' }}
                  onClick={() => {
                    setModalfilehash(result[0]);
                    setModalfilepreview(result[1]);
                    setModalfiledate(result[6]);
                    setModalfilename(result[3]);
                    setModalfiletype(result[2]);
                    setModalfilefree(result[7]);
                    setModalfilefee(result[8]);
                    setModalfiletitle(result[4]);
                    setModalfiledescription(result[5]);
                    setContentAddress(result[9])
                    setContentmodal(true);
                  }}
                >
                  {result[2] == 'image/png' ||
                  result[2] == 'image/jpg' ||
                  result[2] == 'image/jpeg' || 
                  result[2] == 'image/gif'? (
                    <div
                      className='contentholder'
                      style={{
                        backgroundImage: 'url(' + result[0] + ')',
                        backgroundPosition: 'center'
                      }}
                    >
                      <div className='titleblock'>{result[3]}</div>
                      {result[7] ? <div className='freeflag'>Free!</div> : ''}
                    </div>
                  ) : (
                    <div
                      className='contentholder'
                      style={{
                        backgroundColor: 'black',
                        backgroundPosition: 'center'
                      }}
                    >
                      <div className='titleblock'>{result[3]}</div>

                      <Icon
                        style={{ margin: 'auto', color: 'white' }}
                        name='file outline'
                        size='massive'
                        onClick={() => setOpenmodal(true)}
                      />
                      {result[7] ? <div className='freeflag'>Free!</div> : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Grid.Column>
      </Grid>
      <Modal
        closeIcon
        open={contentmodal}
        size='small'
        onClose={() => setContentmodal(false)}
      >
        <Modal.Content style={{ backgroundColor: '#999' }}>
          <Modal.Description style={{ textAlign: 'center' }}>
            <div className='blacktext'>
              <h2 style={{ margin: '0px' }}>{modalfiletitle}</h2>
              <h4 style={{ margin: '0px 0px 0px 0px' }}>
                {modalfiledescription}
              </h4>
              <h4 style={{ margin: '0px 0px 10px 0px' }}>
                <Moment format='MM/DD/YY HH:mm' unix>
                  {modalfiledate}
                </Moment>
              </h4>
              {modalfiletype ? (
                <img src={modalfilepreview} />
              ) : (
                <Icon
                  style={{ margin: 'auto', color: 'white' }}
                  name='file outline'
                  size='massive'
                  onClick={() => setOpenmodal(true)}
                />
              )}
              <br />
              {!modalfilefree ? (
                <Form>
                  This content costs : {modalfilefee} Eth
                  <Form.Field>
                    <Checkbox label='Buy now!!!!!' />
                  </Form.Field>
                  <Form.Field>
                    <Checkbox label='Subscribe' />
                  </Form.Field>
                  <Button
                    style={{ backgroundColor: 'green', color: 'white' }}
                    onClick={() => console.log('submit')}
                  >
                    Purchase
                  </Button>
                </Form>
              ) : (
                <Link href={`/content/${contentAddress}`}>
                  <a>
                    <Button
                      style={{ backgroundColor: 'green', color: 'white' }}
                      onClick={() => console.log('submit')}
                    >
                    View the full content!
                    </Button>
                  </a>
                </Link>
              )}
            </div>
          </Modal.Description>
        </Modal.Content>
      </Modal>
      <Modal
        open={profilemodal}
        size='small'
        closeIcon
        onClose={() => setProfilemodal(false)}
      >
        <Modal.Content style={{ backgroundColor: '#999' }}>
          <Modal.Description style={{ textAlign: 'center' }}>
            <div className='blacktext'>
              <h2>Create publisher account</h2>
              <h4>Ethereum Address: {dapp.address}</h4>
              <Form>
                <Form.Field>
                  <label>Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Field>
                <Form.Field>
                  <label>Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Field>
              </Form>
              <br />
              <p className='blacktext'>Logo? Profile Image?</p>
              <Button
                style={{ backgroundColor: 'green', color: 'white' }}
                onClick={createPublisherProfile}
              >
                Create Publisher Profile
              </Button>
            </div>
          </Modal.Description>
        </Modal.Content>
      </Modal>
      <Modal
        open={usermodal}
        size='small'
        closeOnEscape={false}
        closeOnDimmerClick={false}
        onClose={() => setUsermodal(false)}
      >
        <Modal.Content style={{ backgroundColor: '#999' }}>
          <Modal.Description style={{ textAlign: 'center' }}>
            <div className='blacktext'>
              <h2>Welcome</h2>
              <h4>Address: {dapp.address}</h4>
              <Form>
                <Form.Field>
                  <label>Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Field>
                <Form.Field>
                  <label>Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Field>
              </Form>
              <br />
            
              <Button
                style={{ backgroundColor: 'blue', color: 'white' }}
                onClick={createUserProfile}
              >
                Create User Profile
              </Button>
            </div>
          </Modal.Description>
        </Modal.Content>
      </Modal>
    </Layout>
  );
};

// export async function getStaticProps() {
//   const GatewayContractObj = await GatewayObjSetup();
//   const contentContracts = await GatewayContractObj.methods
//     .getContentContracts()
//     .call();

//   return {
//     props: { contentContracts }
//   };
// }

export default Index;
