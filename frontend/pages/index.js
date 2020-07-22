import React, { useState, useEffect } from 'react';
import { useStateValue } from '../state';
import Layout from '../components/Layout';
import {  Message, Icon, Button, Grid,Modal,Form  } from 'semantic-ui-react';
import Loader from 'react-loader-spinner';

import GatewayObjSetup from '../utils/GatewayConstructor';

const Index = () => {
    const [{ dapp }, dispatch] = useStateValue();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setError] = useState('');
    const [myprofile, setMyprofile] = useState('');
    const [name,setName] = useState('');
    const [email,setEmail] = useState('');
    const [logo,setLogo] = useState('');
    const [cost,setCost] = useState(1);
    const [openmodal,setOpenmodal] = useState(false);

const GatewayContractObj = GatewayObjSetup(dapp.web3);

useEffect(() => {
    const loadProfile = async () => {
        if (dapp.address && myprofile === '') {
            console.log(dapp.address);
            const profilefetch = await GatewayContractObj.methods.getPublisherProfile(dapp.address).call({from: dapp.address});
            //setMyprofile(profilefetch);
        }
    };
    loadProfile();
}, [dapp.address,myprofile]);

const createPublisherProfile = async () => {
    await GatewayContractObj.methods.createNewPublisher(name,email,logo,cost)
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
    setOpenmodal(false);
    window.location.reload(false);
};
  
  return (
    <Layout style={{backgroundColor:'#041727'}}>
        <Grid centered columns={2}>
            <Grid.Column>
            <div style={{ marginTop: '100px' }}>
                <h2>Welcome to Pay3<br/>Would you like to do?</h2>
                <hr />
                    <h3>Browse Content</h3>
                    <br />
                    <div>
                        <a href="/browse"><Button>browse</Button></a>
                    </div>
                    <br />
                    <hr/>
                    <br/>
                    {myprofile === '' || myprofile === undefined ? (
                        console.log(myprofile),
                    <>
                        <h3>Create profile</h3>
                        <br/>
                        <Button onClick={() => setOpenmodal(true)}>Create Profile</Button>
                        <Modal 
                        open={openmodal}
                        size="large"
                        closeIcon
                        >
                            <Modal.Header>Input your name and email to create a new profile</Modal.Header>
                            <Modal.Content image>
                            <Modal.Description>
                                <Form>
                                <Form.Field>
                                <label>Name</label>
                                <input value={name} onChange={(e) => setName(e.target.value)}/>
                                </Form.Field>
                                <Form.Field>
                                <label>Email</label>
                                <input value={email} onChange={(e) => setEmail(e.target.value)}/>                        
                                </Form.Field>
                                </Form>
                                <br/>
                                <p style={{color:'black'}}>Future--- upload logo and subscription fee<br/>all of this can be edited later</p>
                                <Button onClick={createPublisherProfile}>Submit Profile!</Button>
                            </Modal.Description>
                            </Modal.Content>
                        </Modal>
                    </>
                ) : (
                    <>
                        <h3>Visit your Dashboard</h3>
                        <br />
                        <div>
                            <a href="/dashboard"><Button>Dashboard</Button></a>
                        </div>
                    </>
                )}
                <hr />

            </div>
            </Grid.Column>
        </Grid>
    </Layout>
  )
}

export default Index;