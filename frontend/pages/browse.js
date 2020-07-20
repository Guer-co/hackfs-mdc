import React, { useState, useEffect } from 'react';
import { useStateValue } from '../state';
import Layout from '../components/Layout';
import {  Message, Icon, Button, Grid,Modal,Form  } from 'semantic-ui-react';
import Loader from 'react-loader-spinner';
import buffer from 'buffer';
import PublisherObjSetup from '../utils/PublisherConstructor';

const Browse = () => {
const [{ dapp }, dispatch] = useStateValue();
const [loading, setLoading] = useState(false);
const [errorMessage, setError] = useState('');

const PublisherContractObj = PublisherObjSetup(dapp.web3);

useEffect(() => {
    //grab random contracts maybe????
    const loadPublisherData = async () => {
    try {        
    } catch (err) {
    }
    };
}, [dapp.address]);


    return (
        <Layout style={{ backgroundColor: '#041727' }}>
        {errorMessage && <Message error header='Oops!' content={errorMessage} />}
        <Grid centered>
            <Grid.Column width={16}>
                <div style={{textAlign:'center'}}>
                    <h2>Browse decentralized content on P3!</h2>
                    <hr />
                </div>
            </Grid.Column>
            <Grid.Column width={16}>
                <div style={{padding:'25px',display:'flex'}}>
                    <span className="hex" style={{color:'#666'}}>&#x2B22;</span>
                    <span className="hex" style={{color:'green'}}>&#x2B22;</span>
                    <span className="hex" style={{color:'blue'}}>&#x2B22;</span>
                    <span className="hex" style={{color:'orangered'}}>&#x2B22;</span>
                    <span className="hex" style={{color:'pink'}}>&#x2B22;</span>
                    <span className="hex" style={{color:'yellow'}}>&#x2B22;</span>
                    <span className="hex" style={{color:'coral'}}>&#x2B22;</span>


                </div>
            </Grid.Column>
        </Grid>
        </Layout>
    );
};

export default Browse;
