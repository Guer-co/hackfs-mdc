import React, { useState, useEffect } from 'react';
import { useStateValue } from '../state';
import Layout from '../components/Layout';
import TestPage from './testpage.js';

const Index = () => {
  const [{ dapp }, dispatch] = useStateValue();
  
  return (
    <Layout style={{backgroundColor:'#041727'}}>
      <TestPage/>
    </Layout>
  )
}

export default Index;