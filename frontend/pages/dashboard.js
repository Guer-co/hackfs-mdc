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
  Checkbox,
  Container
} from 'semantic-ui-react';
import Loader from 'react-loader-spinner';
import GatewayContractObjSetup from '../utils/GatewayConstructor';
import Moment from 'react-moment';
import { TopCell, UploadCell, PublishCell, ContentCell } from '../components/ContentCell'

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
  const [usd, setUsd] = useState(true);
  const [ethprice, setEthprice] = useState('');
  let cbalance;

  const GatewayContractObj = GatewayContractObjSetup(dapp.web3);

  useEffect(() => {
    const loadProfile = async () => {
      if (dapp.address && myprofile === '') {
        const profilefetch = await GatewayContractObj.methods
          .getPublisherProfile(dapp.address)
          .call();
        setMyprofile(profilefetch);
        web3.eth.getBalance(profilefetch[0], function (error, result) {
          if (error) {
            console.log(error);
          } else {
            setBalance(result);
            console.log(result);
          }
        });
      }

    await fetch('https://api.infura.io/v1/ticker/ethusd')
    .then((resp) => resp.json())
    .then(resp => setEthprice(resp.ask));
    
      if (dapp.address && contentarray.length === 0) {
        const contentaddresses = await GatewayContractObj.methods
          .getPublisherContracts(dapp.address)
          .call();
        if (contentaddresses.length > 0) {
          setContentarray(contentaddresses);
        }
      }
      if (contentarray.length > 0 && allcontent.length === 0) {
        const contentdetails = async () => {
          let temparray = [];
          for (let i = contentarray.length-1; i >= 0; i--) {
            await GatewayContractObj.methods
              .getContentInfo(contentarray[i])
              .call()
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
    free ? setPrice(0) : '';
      console.log(price);
    let calcprice;
    let finalprice = price;
    if (price) {
        if (usd) {
            calcprice = (price / ethprice);
            finalprice = dapp.web3.utils.toWei(calcprice.toString().substring(0, calcprice.toString().length - 2), 'ether');
        }
        else {
            finalprice = dapp.web3.utils.toWei(price);
        }
    }
    let msg = (finalprice === 0 ? "Publish this content for free!" : usd === true ? "Publish this content for " + calcprice.toFixed(6) + " ETH?" : "Publish this content for " + price + " ETH?");
    if (confirm(msg) == true) {
    console.log(myprofile[0]);
    console.log(myprofile[1]);
    console.log(myprofile[4]);

    await GatewayContractObj.methods
      .createContent(
        myprofile[0],
        filehash,
        filepreview,
        filename,
        filetype,
        title,
        description,
        finalprice,
        myprofile[1],
        myprofile[5]
      )
      .send({ from: dapp.address })
      .then(function (result) {
        console.log(result);
        window.location.reload(false);
      })
      .catch(function (error) {
        console.log(error);
      });
    }
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
      <div class='verticallinewhitecontentcell'>

      <Grid centered>
        <Grid.Column width={16}>
          <TopCell title={'Dashboard'}/>
        </Grid.Column>
          <div>
            <div style={{height: 256}}></div>
          </div>
        <Grid.Column width={16}>      
        <div>
            {filehash === '' ? (
              loading === true ? (
                <UploadCell isLoading={true}/>
              ) : (
                <>
                  <input
                    id='data_file'
                    type='file'
                    style={{ display: 'none' }}
                    onChange={uploadToIPFS}
                  />
                  <UploadCell/>
                </>
              )
            ) : (
              <PublishCell previewUrl={filepreview}/>
            )}
          </div>

        </Grid.Column>

        <Grid.Column width={3}>          
        </Grid.Column>
        <Grid.Column width={4}>
        </Grid.Column>
        <Grid.Column width={9}>
          {filehash === '' ? (
            <div style={{ padding: '25px' }}>
            </div>
          ) : (
            <div
              style={{
                padding: '25px'
              }}
            >
              <Form inverted>
                <Form.Field>
                  <label>Title</label>
                  <input placeholder={'Title'}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Form.Field>
                <Form.Field>
                  <label>Description</label>
                  <input placeholder={'Description'}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Form.Field>
                <Form.Field>
                  <span className='primarytextcolor'>Free? </span>
                  <Checkbox
                    checked={free}
                    onClick={() => setFree(!free)}
                  />
                </Form.Field>
                {!free ? (
                <>
                <div className='primarytextcolor' style={{display:'inline-block'}}>
                One time price for this content in {usd ? "$USD" : <Icon name='ethereum'>Eth </Icon>} <Button onClick={() => setUsd(!usd)}>Use {usd ? "ETH" : "USD"}?</Button>
                </div>
                <Form.Field>
                    <div className="ui labeled input">
                    <div className="ui label label">{usd ? <Icon name='usd'> USD</Icon> : <Icon name='ethereum'> ETH</Icon>}</div>
                    <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} />
                    </div>
                </Form.Field>
                </>
                ) : (
                ''
                )}
              </Form>
              <br />
              <div class='textalignright'>
              <Button
                circular
                inverted
                color='green'
                content='Publish'
                icon='paper plane'
                size='huge'
                onClick={addContentToContract}
              />
              </div>
            </div>
          )}
        </Grid.Column>

        <Grid.Column width={16}>
          {allcontent.map((result) => {
            return (
              <ContentCell title={result[4]}
              description={result[5]}
              previewUrl={result[1]}
              filehash={result[0]}
              filename={result[3]}
              filetype={result[2]}
              filedate={result[6]}
              filefee={dapp.web3.utils.fromWei(result[7], 'ether').substring(0, 8)}
              contentAddress={result[8]}
              />
            )
          })}
          <div>
            <div style={{height: 256}}></div>
          </div>
        </Grid.Column>
      </Grid>
      </div>
    </Layout>

  );
};

export default Publish;
