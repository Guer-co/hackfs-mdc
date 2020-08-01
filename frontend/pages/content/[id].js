import React, { useState, useEffect } from 'react';
import { useStateValue } from '../../state';
import Layout from '../../components/Layout';
import { Grid, Message } from 'semantic-ui-react';
import Moment from 'react-moment';
import Loader from 'react-loader-spinner';
import GatewayObjSetup from '../../utils/GatewayConstructor';

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
  publisherFee
}) => {
  const [{ dapp }, dispatch] = useStateValue();
  const GatewayContractObj = GatewayObjSetup();
  const [errorMessage, setError] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (dapp.address) {
          // const isSubscribed = await GatewayContractObj.methods
          //   .isSubscribed(publisher, dapp.address)
          //   .call();
          const isWhitelisted = await GatewayContractObj.methods
            .isWhitelisted(address, dapp.address)
            .call();

          console.log(isWhitelisted)

          // isSubscribed || isWhitelisted ? true : false;
        }
      } catch (err) {
        setError(err.message);
        // setTimeout(() => setError(''), 5000);
      }
    };

    const fetchImage = async () => {
      const temp = await fetch(
        `http://localhost:8888/api/download/${publisher}/${locationHash}`,
        {
          method: 'GET'
        }
      );
      setImage(temp.url);
    };

    fetchImage();
    checkAuth();
  }, [dapp.address, image]);


  return (
    <Layout style={{ backgroundColor: '#041727' }}>
      {errorMessage && <Message error header='Oops!' content={errorMessage} />}
      <Grid centered>
        <Grid.Row>
          <Grid.Column width={16}>
            <div style={{ textAlign: 'center' }}>
              <h1>{title}</h1>
            </div>
            <br/>
            <div style={{ textAlign: 'center' }}>
              <h3>by: {publisherName}</h3>
            </div>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <div style={{ textAlign: 'right' }}>
              <Moment format='Do MMM YYYY' unix>
                {date}
              </Moment>
            </div>
            <br/>
            <div style={{ textAlign: 'center' }}>
              <h3>{description}</h3>
            </div>
          </Grid.Column>
          <Grid.Column width={8}>
            { image && <img src={image} />}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Layout>
  );
};

export async function getStaticProps({ params }) {
  const GatewayContractObj = await GatewayObjSetup();
  const contentSummary = await GatewayContractObj.methods
    .getContentInfo(params.id)
    .call();

  console.log(contentSummary);

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
      publisherFee: contentSummary[10]
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
