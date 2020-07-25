import React, { useState, useEffect } from 'react';
import { useStateValue } from '../state';
import Layout from '../components/Layout';
import { Grid } from 'semantic-ui-react';
import Loader from 'react-loader-spinner';
import GatewayContractObjSetup from '../utils/GatewayConstructor';

const Campaign = ({}) => {
  const [{ dapp }, dispatch] = useStateValue();

  return <Layout></Layout>;
};

export async function getStaticProps({ params }) {

}

export async function getStaticPaths() {

}

export default Campaign;
