import React, { useState, useEffect } from 'react';
import { useStateValue } from '../state';
import Layout from '../components/Layout'

const Index = () => {
  const [{ dapp }, dispatch] = useStateValue();
  
  return (
    <Layout>
      // Your Markup here //
    </Layout>
  )
}

export default Index;