import React, { useState, useEffect } from 'react';
import { useStateValue } from '../state';
import Layout from '../components/Layout';

const Index = () => {
  const [{ dapp }, dispatch] = useStateValue();
  
  return (
    <Layout style={{backgroundColor:'#041727'}}>
    </Layout>
  )
}

export default Index;