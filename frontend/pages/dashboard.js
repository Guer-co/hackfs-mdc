import React, { useState, useEffect } from 'react';
import { useStateValue } from '../state';
import Layout from '../components/Layout';
import { Message, Icon, Button, Grid } from 'semantic-ui-react';
import Loader from 'react-loader-spinner';
import PublisherContractObjSetup from '../utils/PublisherConstructor';
import Moment from 'react-moment';

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

  const PublisherContractObj = PublisherContractObjSetup(dapp.web3);

  useEffect(() => {
    const loadPublisherData = async () => {
      if (dapp.address && mycontract === '') {
        //need to fix this line in solidity to only look for message sender
        const contractfetch = await PublisherContractObj.methods
          .getUserContracts(dapp.address)
          .call({ from: dapp.address });
        if (contractfetch.length > 0) {
          setMycontract(contractfetch[0]);
        }
      }
      //   if (dapp.address && mycontract && allcontent.length === 0) {
      //     const contentcount = await PublisherContractObj.methods
      //       .doGetContentCount(mycontract)
      //       .call({ from: dapp.address });
      //     setContentcount(contentcount);
      //   }
      //   if (contentcount > 0) {
      //     //finally, lets read and dump any uploaded content into the console. This should be used on the 'dashboard' page that doesn't exist yet.
      //     //(this works, but I think you have to upload 2 pieces of data before it starts returning results --- need to review =( --- probably an issue in the smart contract
      //     const contentdetails = async () => {
      //       let temparray = [];
      //       for (let i = 1; i < contentcount; i++) {
      //         await PublisherContractObj.methods
      //           .doGetContent(mycontract, i)
      //           .call({ from: dapp.address })
      //           .then(function (result) {
      //             if (result[0].length > 0) {
      //               console.log(result);
      //               temparray.push(result);
      //             }
      //           });
      //       }
      //       setAllcontent(temparray);
      //     };
      //     contentdetails();
      //   }
    };
    loadPublisherData();
  }, [dapp.address, mycontract]);

  const enterPublisher = async () => {
    try {
      await PublisherContractObj.methods
        .createContent()
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

  return (
    <Layout style={{ backgroundColor: '#041727' }}>
      {errorMessage && <Message error header='Oops!' content={errorMessage} />}
      <Grid centered columns={3}>
        <Grid.Column>
          <h3>Dashboard</h3>
          <p>
            For now, simple implementation / data dump of all of your files in
            ipfs.
          </p>
          <div>
            First, a prompt if you don't already have a smart contract launched
            via our smart contract, we will auto detect this based on the
            address you are using when you land on the site.
          </div>
          <br />
          <hr />

          {allcontent.map((result) => {
            if (
              result[0] !== null &&
              result[0] !== undefined &&
              result[0] !== ''
            ) {
              return (
                <div className='imagebox' key={result[0]}>
                  <div>
                    <a
                      rel='noopener noreferrer'
                      target='_blank'
                      href={'https://gateway.ipfs.io/ipfs/' + result[0]}
                    >
                      <img
                        alt='pic'
                        src={'https://gateway.ipfs.io/ipfs/' + result[0]}
                        style={{ width: '80%' }}
                      />
                    </a>
                  </div>
                  <div>
                    <p>{result[1]}</p>
                    <p>
                      Uploaded:{' '}
                      <Moment format='MM/DD/YY HH:mm' unix>
                        {result[2]}
                      </Moment>
                    </p>
                  </div>
                  <br />
                  <hr />
                </div>
              );
            }
            return '';
          })}
        </Grid.Column>
      </Grid>
    </Layout>
  );
};

export default Publish;
