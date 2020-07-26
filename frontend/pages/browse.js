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
  Checkbox
} from 'semantic-ui-react';
import GatewayObjSetup from '../utils/GatewayConstructor';
import Moment from 'react-moment'

const Browse = () => {
  const [{ dapp }, dispatch] = useStateValue();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setError] = useState('');
  const [myprofile, setMyprofile] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [logo, setLogo] = useState('');
  const [cost, setCost] = useState(1);
  const [content, setContent] = useState([]);
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

  const GatewayContractObj = GatewayObjSetup(dapp.web3);
  let temparray = [];

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
          setMyprofile(profilefetch);
        }
        if (userfetch[0] !== '0x0000000000000000000000000000000000000000') {
          setMyprofile(userfetch);
        }
        if (content.length === 0 && contentinfo.length === 0) {
        const getcontent = await GatewayContractObj.methods
        .getContentContracts()
        .call({ from: dapp.address });
        setContent(getcontent);
            getcontent.map(async (cadd) => {
                let c = await GatewayContractObj.methods.getContentInfo(cadd).call({ from: dapp.address })
                temparray.push(c);
            })
            setContentinfo(temparray);
        }
      }
    };

    loadProfile();
  }, [dapp.address, myprofile, content,contentinfo]);

  return (
    <Layout style={{ backgroundColor: '#041727' }}>
      {errorMessage && <Message error header='Oops!' content={errorMessage} />}
      <Grid centered>
        <Grid.Column width={16}>
          <div style={{ textAlign: 'center' }}>
            <p>
              Welcome: {myprofile[1]} {myprofile[2]}
            </p>
            <h2>Browse decentralized content on P3!</h2>
            <hr />
          </div>
        </Grid.Column>
        <Grid.Column width={16}>
          <div style={{ padding: '25px', display: 'flex' }}>
            {contentinfo.map((result) => {
                console.log(result);
                return (
                    <div key={result[6]} style={{position:'relative'}}
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
                            setContentmodal(true);
                        }}
                    
                    >
                        <div
                        className="hex"
                        style={{ backgroundImage: 'url(' + result[0] + ')',backgroundPosition: 'center'  }}
                        >
                            <div className="titleblock">{result[3]}</div>
                            {result[7] ? <div className="freeflag">Free!</div> : ''}
                        </div>
                    </div>
                )
            }
            )}
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
            <div style={{ color: 'white' }}>
              <h2 style={{margin:'0px'}}>{modalfiletitle}</h2>
              <h4 style={{margin:'0px 0px 0px 0px'}}>{modalfiledescription}</h4>
              <h4 style={{margin:'0px 0px 10px 0px'}}><Moment format='MM/DD/YY HH:mm' unix>{modalfiledate}</Moment></h4>            

              <img src={modalfilepreview}/>
              <br/>
              {!modalfilefree ? (
              <Form>
                <Form.Field>
                  <Checkbox label='Buy now!!!!!' />
                </Form.Field>
                <Form.Field>
                  <Checkbox label='Subscribe' />
                </Form.Field>
                <Button
                  style={{ backgroundColor: 'green', color: 'white' }}
                  onClick={() => console.log('submit')}
                >Purchase
                </Button>
              </Form>
              ) : (
                <Button
                style={{ backgroundColor: 'green', color: 'white' }}
                onClick={() => console.log('submit')}
                >View the full content!
                </Button>
              )}
            </div>
          </Modal.Description>
        </Modal.Content>
      </Modal>
    </Layout>
  );
};

export default Browse;
