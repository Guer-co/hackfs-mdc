import React, { useState, useEffect } from 'react';
import { useStateValue } from '../../state';
import Layout from '../../components/Layout';
import { Grid } from 'semantic-ui-react';
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
  free,
  price
}) => {
  const [{ dapp }, dispatch] = useStateValue();

  useEffect(() => {}, [dapp.address]);

  return (
    <Layout>
      <h1>{title}</h1>
      <h3>{description}</h3>
    </Layout>
  );
};

export async function getStaticProps({ params }) {
  console.log(params.id);
  const GatewayContractObj = await GatewayObjSetup();
  const contentSummary = await GatewayContractObj.methods
    .getContentInfo(params.id)
    .call();
  

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
      free: contentSummary[7],
      price: contentSummary[8]
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
