import React, { useState, useEffect } from 'react';
import { useStateValue } from '../../state';
import Layout from '../../components/Layout';
import {
  Grid,
  Message,
  Modal,
  Form,
  Button,
  Checkbox
} from 'semantic-ui-react';
import Moment from 'react-moment';
import Loader from 'react-loader-spinner';
import GatewayObjSetup from '../../utils/GatewayConstructor';
import marked from 'marked';

const Content = ({
  address,
  locationHash,
  previewHash,
  fileType,
  fileName,
  title,
  description,
  date,
  fee,
  publisher,
  publisherName,
  publisherFee,
  image
}) => {
  const [{ dapp }, dispatch] = useStateValue();
  const GatewayContractObj = GatewayObjSetup();
  const [errorMessage, setError] = useState('');
  const [paymentModal, setPaymentModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [access, setAccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buynow, setBuynow] = useState(false);
  const [subscribe, setSubscribe] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
        console.log(fee);
      try {
        if (fee > 0 && dapp.address) {
        let isSubscribed = await GatewayContractObj.methods
        .isSubscribed(publisher, dapp.address)
        .call();
        console.log(isSubscribed);
          const isWhitelisted = await GatewayContractObj.methods
            .isWhitelisted(address, dapp.address)
            .call();
          if (isWhitelisted || isSubscribed[1] > isSubscribed[2]) {
            setAccess(true);
          } else {
            setPaymentModal(true);
          }
        } else if (fee == 0) {
          setAccess(true);
        }
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(''), 5000);
      }
    };

    const getUserProfile = async () => {
      try {
        if (dapp.address) {
          const user = await GatewayContractObj.methods
            .getUserProfile(dapp.address)
            .call();

          if (user[0] !== '0x0000000000000000000000000000000000000000') {
            dispatch({
              type: 'SET_USER_CONTRACT',
              payload: user[0]
            });
          }
        }
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(''), 5000);
      }
    };

    getUserProfile();
    checkAuth();
  }, [dapp.address]);

  const purchaseContent = async () => {
    if (dapp.userContract) {
      await GatewayContractObj.methods
        .purchaseContent(address, fee)
        .send({ from: dapp.address })
        .on('transactionHash', (hash) => {
          dispatch({
            type: 'SET_CURRENTLY_MINING',
            payload: true
          });
          setLoading(true);
        })
        .on('receipt', (hash) => {
          dispatch({
            type: 'SET_CURRENTLY_MINING',
            payload: false
          });
          setLoading(false);
          setPaymentModal(false);
          setAccess(true);
        });
    } else {
      await GatewayContractObj.methods
        .createNewUserAndPurchase(name, email, address, fee, publisher)
        .send({
          from: dapp.address,
          value: fee
        })
        .on('transactionHash', (hash) => {
          dispatch({
            type: 'SET_CURRENTLY_MINING',
            payload: true
          });
          setLoading(true);
        })
        .on('receipt', (hash) => {
          dispatch({
            type: 'SET_CURRENTLY_MINING',
            payload: false
          });
          setLoading(false);
          setPaymentModal(false);
          setAccess(true);
        });
    }
  };

  const subscribeToPublisher = async () => {
    if (dapp.userContract) {
      dapp.web3.eth.sendTransaction(
        {
          to: publisher,
          from: dapp.address,
          value: publisherFee
        },
        async function (error) {
          await GatewayContractObj.methods
            .addSubscriber(publisher, publisherFee)
            .send({ from: dapp.address })
            .on('transactionHash', (hash) => {
              dispatch({
                type: 'SET_CURRENTLY_MINING',
                payload: true
              });
              setLoading(true);
            })
            .on('receipt', (hash) => {
              dispatch({
                type: 'SET_CURRENTLY_MINING',
                payload: false
              });
              setLoading(false);
              setPaymentModal(false);
              setAccess(true);
            });
        }
      );
    } else {
      await GatewayContractObj.methods
        .createNewUserAndSubscribe(name, email, publisher, publisherFee)
        .send({
          from: dapp.address,
          value: dapp.web3.utils.toWei(publisherFee)
        })
        .on('transactionHash', (hash) => {
          dispatch({
            type: 'SET_CURRENTLY_MINING',
            payload: true
          });
          setLoading(true);
        })
        .on('receipt', (hash) => {
          dispatch({
            type: 'SET_CURRENTLY_MINING',
            payload: false
          });
          setLoading(false);
          setPaymentModal(false);
          setAccess(true);
        });
    }
  };

const getMarkdownText = () => {
    //if not image, read file, push in here \/
    var rawMarkup = marked();
    return { __html: rawMarkup };
}

  return (
    <Layout style={{ backgroundColor: '#041727' }}>
      {errorMessage && <Message error header='Oops!' content={errorMessage} />}
      {access === false ? (
        <Grid centered>
          <Loader
            type='Oval'
            color='#00BFFF'
            height={100}
            width={100}
            style={{ marginTop: '50px' }}
          />
        </Grid>
      ) : (
    <Grid centered>
    <Grid.Row>
        <Grid.Column width={16}>
        <div style={{ textAlign: 'center' }}>
            <h1>{title}</h1>
            <h3>{description}</h3>
        </div>
        <br />
        <div style={{ textAlign: 'center' }}>
            <p><strong>by:</strong> {publisherName}&nbsp;&nbsp;<strong> on:</strong> <Moment format='Do MMM YYYY' unix>{date}</Moment></p><br/><br/>
        </div>
        </Grid.Column>
        <Grid.Column width={16} style={{border:'1px solid #333',borderRadius:'10px', height:'100%'}}>
            <div style={{ textAlign: 'center' }}>
            <br/>
            {fileType == 'image/jpg' || fileType == 'image/jpeg' ||fileType == 'image/png' || fileType == 'image/gif' ? 
            <img src={image} />
            :
                <div dangerouslySetInnerHTML={getMarkdownText()} />
            }
            </div>
        </Grid.Column>
    </Grid.Row>
    
    </Grid>
      )}
      <Modal open={paymentModal} size='small'>
        <Modal.Header style={{ textAlign: 'center' }}>Paywall</Modal.Header>
        <Modal.Content style={{ backgroundColor: '#999' }}>
          <Modal.Description style={{ textAlign: 'center' }}>
            <Form>
              {!dapp.userContract && (
                <>
                  <h4>Create an Account!</h4>
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
                </>
              )}
              <h4>
                This content costs : {dapp.web3.utils.fromWei(fee, 'ether')} Eth
                to purchase!
              </h4>
              <Form.Field>
                <br />
                <Checkbox
                  className='blacktext'
                  checked={buynow}
                  onChange={() => setBuynow(!buynow)}
                  label={`Buy now! ${dapp.web3.utils.fromWei(
                    fee,
                    'ether'
                  )} ETH`}
                  disabled={subscribe}
                />
              </Form.Field>
              <Form.Field>
                <Checkbox
                  className='blacktext'
                  checked={subscribe}
                  onChange={() => setSubscribe(!subscribe)}
                  label={`Subscribe to ${publisherName} for ${dapp.web3.utils.fromWei(publisherFee, 'ether')} ETH per month!`}
                  disabled={buynow}
                />
              </Form.Field>
              {(buynow || subscribe) && (
                <Button
                  loading={loading}
                  primary
                  onClick={() => {
                    buynow ? purchaseContent() : subscribeToPublisher();
                  }}
                >
                  {buynow
                    ? 'Purchase Content'
                    : subscribe
                    ? 'Subscribe to Publisher'
                    : 'Purchase'}
                </Button>
              )}
            </Form>
          </Modal.Description>
        </Modal.Content>
      </Modal>
    </Layout>
  );
};

export async function getStaticProps({ params }) {
  const GatewayContractObj = await GatewayObjSetup();
  const contentSummary = await GatewayContractObj.methods
    .getContentInfo(params.id)
    .call();

  const image = await fetch(`http://localhost:8888/api/download/${contentSummary[8]}/${contentSummary[0]}`);

  return {
    props: {
      address: params.id,
      locationHash: contentSummary[0],
      previewHash: contentSummary[1],
      fileType: contentSummary[2],
      fileName: contentSummary[3],
      title: contentSummary[4],
      description: contentSummary[5],
      date: contentSummary[6],
      fee: contentSummary[7],
      publisher: contentSummary[8],
      publisherName: contentSummary[9],
      publisherFee: contentSummary[10],
      image: image.url
    }
  };
}

export async function getStaticPaths() {
  const GatewayContractObj = await GatewayObjSetup();
  const contentContracts = await GatewayContractObj.methods
    .getContentContracts()
    .call();

  const paths = contentContracts.map((address) => `/content/${address}`);

  return { paths, fallback: false };
}

export default Content;
