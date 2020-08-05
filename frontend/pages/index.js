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
  Card,
  Header
} from 'semantic-ui-react';
import GatewayObjSetup from '../utils/GatewayConstructor';
import Moment from 'react-moment';
import { ConsumeCell, ContentCell } from '../components/ContentCell'

const Index = ({ contentContracts }) => {
  const [{ dapp }, dispatch] = useStateValue();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setError] = useState('');
  const [myprofile, setMyprofile] = useState([0,0,0,0,[0],1]);
  const [myuser, setMyuser] = useState([0,0,0,[0],[0],[0]]);
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
  const [publisherfee, setPublisherfee] = useState('');
  const [modalfilename, setModalfilename] = useState('');
  const [modalfilehash, setModalfilehash] = useState('');
  const [modalfiletype, setModalfiletype] = useState('');
  const [modalfiletitle, setModalfiletitle] = useState('');
  const [modalfiledescription, setModalfiledescription] = useState('');
  const [modalfilepreview, setModalfilepreview] = useState('');
  const [modalfilefee, setModalfilefee] = useState('');
  const [modalfiledate, setModalfiledate] = useState('');
  const [modalfilepublisher, setModalfilepublisher] = useState('');
  const [modalfilepublishername, setModalfilepublishername] = useState('');
  const [modalfilepublisherfee, setModalfilepublisherfee] = useState('');
  const [modalfilecontent, setModalfilecontent] = useState('');
  const [buynow, setBuynow] = useState(false);
  const [subscribe, setSubscribe] = useState(false);
  const [usd, setUsd] = useState(true);
  const [ethprice, setEthprice] = useState('');

  const GatewayContractObj = GatewayObjSetup();

  let temparray = [];

  useEffect(() => {
    const loadProfile = async () => {
      if (content.length === 0 && contentContracts.length > 0) {
        contentContracts.map(async (cadd) => {
          let c = await GatewayContractObj.methods.getContentInfo(cadd).call();
          temparray.push(c);
        });
        setContent(contentContracts);
        setContentinfo(temparray);
      }
        if (ethprice == '') {
        await fetch('https://api.infura.io/v1/ticker/ethusd')
        .then((resp) => resp.json())
        .then(resp => setEthprice(resp.ask));
        }
      if (dapp.address && myprofile[0] === 0) {
        const profilefetch = await GatewayContractObj.methods
          .getPublisherProfile(dapp.address)
          .call();
        const userfetch = await GatewayContractObj.methods
          .getUserProfile(dapp.address)
          .call();
        if (profilefetch[0] !== '0x0000000000000000000000000000000000000000') {
          setMyprofile(profilefetch);
          dispatch({
            type: 'SET_PUBLISHER',
            payload: profilefetch
          });
          console.log(profilefetch);
        }
        if (userfetch[0] !== '0x0000000000000000000000000000000000000000') {
          setMyuser(userfetch);
          dispatch({
            type: 'SET_USER',
            payload: userfetch
          });
        }
      }
    };

    loadProfile();

  }, [dapp.address, myprofile, content]);

  

  const createPublisherProfile = async () => {
    try {
    let calcprice;
    let finalprice = publisherfee;
    if (publisherfee) {
        //if (usd) {
        //    calcprice = (publisherfee / ethprice);
        //    finalprice = dapp.web3.utils.toWei(calcprice.toString().substring(0, calcprice.toString().length - 2), 'ether');
        //}
        //else {
            finalprice = dapp.web3.utils.toWei(publisherfee);
        //}
    }
      await GatewayContractObj.methods
        .createNewPublisher(name, email, logo, finalprice)
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

  const purchaseContent = async () => {
    dapp.web3.eth.sendTransaction(
    {
        to: modalfilepublisher,
        from: dapp.address,
        value: modalfilefee
    },
    async function (error) {
        await GatewayContractObj.methods
        .purchaseContent(modalfilecontent, modalfilefee)
        .send({ from: dapp.address });
        window.location.reload(false);
    }
    );
  };

    const createUserAndPurchase = async () => {
        await GatewayContractObj.methods
        .createNewUserAndPurchase('a','a',modalfilecontent, modalfilefee, modalfilepublisher)
        .send({ 
            from: dapp.address,
            value: modalfilefee
        });
        window.location.reload(false);
    };

    const createUserAndSubscribe = async () => {
        let a = await GatewayContractObj.methods
        .createNewUserAndSubscribe('a','a',modalfilepublisher,modalfilepublisherfee)
        .send({ 
            from: dapp.address,
            value: modalfilepublisherfee
        });
        //window.location.reload(false);
    };

  const subscribeToPublisher = async () => {
      console.log(modalfilepublisher);
    dapp.web3.eth.sendTransaction(
    {
        to: modalfilepublisher,
        from: dapp.address,
        value: modalfilepublisherfee
    },
    async function (error) {
    await GatewayContractObj.methods
      .addSubscriber(modalfilepublisher,modalfilepublisherfee)
      .send({ from: dapp.address });
      //take user to content
      //window.location.reload(false);
    }
    );
  };

  const checkIfSubscribedOrBought = async () => {
      console.log(modalfilepublisher)
    if (modalfilefee == 0) {
        return window.location.href = `/content/${modalfilecontent}`;
    }
        let ispurchased = await GatewayContractObj.methods
        .isWhitelisted(modalfilecontent,dapp.address)
        .call();
        console.log(ispurchased);
        if (ispurchased) {
            window.location.href = `/content/${modalfilecontent}`;
        } else {
        let issubbed = await GatewayContractObj.methods
        .isSubscribed(modalfilepublisher, dapp.address)
        .call();
        console.log(issubbed);
            if (issubbed[1] < issubbed[2]) {
                if( confirm(`oops, it looks like your subscription with this publisher is expired! Click yes to re-subscribe for ${dapp.web3.utils.fromWei(modalfilepublisherfee, 'ether').substring(0, 8)} ETH`) == true ) {
                    subscribeToPublisher();
                }
            } else {
                window.location.href = `/content/${modalfilecontent}`;                
            }
        }
  }

  return (
    <Layout style={{ backgroundColor: '#041727' }}>
      {errorMessage && <Message error header='Oops!' content={errorMessage} />}
      <Grid centered>
        <Grid.Column width={8} textAlign='left'>
          <Header as='h1' inverted>P3 Discovery</Header>
        </Grid.Column>
        <Grid.Column width={8} textAlign='right'>
        {myprofile[0] !== 0 ? (
                <Button inverted circular icon='paper plane' color='orange' href='/dashboard'>Publish</Button>
                ) 
                :
                (
                <Button inverted circular icon='paper plane' color='orange' onClick={() => setProfilemodal(true)}>
                  Publish
                </Button>
              )}
        </Grid.Column>
        <Grid.Column width={16}>
          <div style={{ padding: '25px', display: 'flex' }}>
            {contentinfo.map((result, i) => {
              return (
                <div style={{ padding: '32px', position: 'relative' }}>
                  <ConsumeCell                  
                  filehash={result[0]}
                  previewUrl={result[1]}
                  filetype={result[2]}
                  filename={result[3]}
                  title={result[4]}
                  description={result[5]}
                  filedate={result[6]}
                  filefee={result[7]}
                  filepublisher={result[8]}
                  filepublishername={result[9]}
                  filepublisherfee={result[10]}
                  contentAddress={contentContracts[i]}
                  filecontent={contentContracts[i]}
                  playFunc={() => window.open( `http://localhost:8888/api/download/${myprofile[0]}/${result[0]}`, "_blank") }
                  isPlayable={result[7] == 0 || (myuser[0] !== 0  || myprofile[0] !== 0  ? myuser[4].includes(contentContracts[i]) || myuser[5].includes(result[8]) || myprofile[4].includes(contentContracts[i]) : false)}
                  modelFunc={() => {
                    setModalfilehash(result[0]);
                    setModalfilepreview(result[1]);
                    setModalfiletype(result[2]);
                    setModalfilename(result[3]);
                    setModalfiletitle(result[4]);
                    setModalfiledescription(result[5]);
                    setModalfiledate(result[6]);
                    setModalfilefee(result[7]);
                    setModalfilepublisher(result[8]);
                    setModalfilepublishername(result[9]);
                    setModalfilepublisherfee(result[10]);
                    setContentAddress(contentContracts[i]);
                    setModalfilecontent(contentContracts[i]);
                    setContentmodal(true);
                  }}
                  />
                </div>
              );
            })}
          </div>
        </Grid.Column>
      </Grid>
      <Modal
        className="mymodal"
        closeIcon
        open={contentmodal}
        size='small'
        onClose={() => setContentmodal(false)}
      >
        <Modal.Content>
          <Modal.Description style={{ textAlign: 'left' }}>
            <div>
            <ContentCell title={modalfiletitle}
              description={modalfiledescription}
              previewUrl={modalfilepreview}
              filehash={modalfilehash}
              filename={modalfilename}
              filetype={modalfiletype}
              filedate={modalfiledate}
              filefee={dapp.web3.utils.fromWei(modalfilefee, 'ether').substring(0, 8)}
              contentAddress={modalfilecontent}
              defaultShowDes={true}
              isConsumerMode={true}
              />

              {/*
              <h2 style={{ margin: '0px' }}>{modalfiletitle}</h2>
              <h4 style={{ margin: '0px 0px 0px 0px' }}>
                {modalfiledescription}
              </h4>
              <h4 style={{ margin: '0px 0px 10px 0px' }}>
                <Moment format='MM/DD/YY HH:mm' unix>
                  {modalfiledate}
                </Moment>
              </h4>
              {modalfiletype == 'image/png' ||
              modalfiletype == 'image/jpg' ||
              modalfiletype == 'image/jpeg' ||
              modalfiletype == 'image/gif' ? (
                <img src={modalfilepreview} />
              ) : (
                <Icon
                  style={{ margin: 'auto', color: 'white' }}
                  name='file outline'
                  size='massive'
                />
              )}
              <br />
              */}

              {modalfilefee == 0 || (myuser[0] !== 0  || myprofile[0] !== 0  ? myuser[4].includes(modalfilecontent) || myuser[5].includes(modalfilepublisher) || myprofile[4].includes(modalfilecontent) : false) ? (
                <div style={{ textAlign: 'center' }}>
                <Button disabled={loading} inverted circular color='green' icon='play' size='huge'
                  onClick={() => window.open( `http://localhost:8888/api/download/${myprofile[0]}/${modalfilehash}`, "_blank")}
                ></Button>
                </div>
              ) : (
                <Form inverted>
                  <Form.Group>
                  <Form.Field width={2}>
                  </Form.Field>
                  <Form.Field width={10}>
                  <Checkbox
                        checked={buynow}
                        onChange={() => setBuynow(!buynow)}
                        label={`Buy now with ${dapp.web3.utils.fromWei(modalfilefee, 'ether').substring(0, 8)} ETH`} 
                        disabled={subscribe}
                    />
                  </Form.Field>                    
                  </Form.Group>

                <Form.Group>
                <Form.Field width={2}>
                </Form.Field>
                <Form.Field width={10}>
                    <Checkbox
                        checked={subscribe}
                        onChange={() => setSubscribe(!subscribe)}
                        label={`Subscribe to ${modalfilepublishername} with ${dapp.web3.utils.fromWei(modalfilepublisherfee, 'ether')} ETH per month!`}
                        disabled={buynow}
                    />
                </Form.Field>
                <Form.Field width={4}>
                <div style={{ textAlign: 'center' }}>
                {myuser[0] !== 0  || myprofile[0] !== 0  ?
                    <Button disabled={!(buynow || subscribe)} inverted circular color='yellow' icon='shop' size='massive'
                        onClick={() => {buynow ? purchaseContent() : subscribeToPublisher()}}
                    >
                    </Button>
                :
                    <Button disabled={!(buynow || subscribe)} inverted circular color='yellow' icon='shop' size='massive'
                        onClick={() => {buynow ? createUserAndPurchase() : createUserAndSubscribe()}}
                    >
                    </Button>
                }
                </div>
                </Form.Field>
                </Form.Group>
                </Form>
              )}
            </div>
          </Modal.Description>
        </Modal.Content>
      </Modal>
      <Modal
        className="mymodal"
        open={profilemodal}
        size='small'
        closeIcon
        onClose={() => setProfilemodal(false)}
      >
        <Modal.Content>
          <Modal.Description style={{ textAlign: 'center' }}>
            <div>
              <h2>Create publisher account</h2>
              <h4>Ethereum Address: {dapp.address}</h4>
              <Form>
                <Form.Field>
                  <label className="whitetext">Name</label>
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
                <Form.Field>
                  <label>
                    Publisher Subscription Fee{' '}
                    <small>
                      How much per month should someone pay to view all your
                      content?
                    </small>
                  </label>
                  <input
                    value={publisherfee}
                    onChange={(e) => setPublisherfee(e.target.value)}
                  />
                </Form.Field>
              </Form>
              <br />
              <Button
                style={{ backgroundColor: '#f6f6f6', color: 'black' }}
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

export async function getStaticProps() {
  const GatewayContractObj = await GatewayObjSetup();
  const contentContracts = await GatewayContractObj.methods
    .getContentContracts()
    .call();
  

  return {
    props: { contentContracts }
  };
}

export default Index;
