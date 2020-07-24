import React, { useState, useEffect } from 'react';
import { useStateValue } from '../state';
import Layout from '../components/Layout';
import {  Message, Icon, Button, Grid,Modal,Form,Checkbox  } from 'semantic-ui-react';
import GatewayObjSetup from '../utils/GatewayConstructor';

const Browse = () => {
const [{ dapp }, dispatch] = useStateValue();
const [loading, setLoading] = useState(false);
const [errorMessage, setError] = useState('');
const [myprofile, setMyprofile] = useState('');
const [name,setName] = useState('');
const [email,setEmail] = useState('');
const [logo,setLogo] = useState('');
const [cost,setCost] = useState(1);
const [profilemodal,setProfilemodal] = useState(true);
const [contentmodal,setContentmodal] = useState(false);

const GatewayContractObj = GatewayObjSetup(dapp.web3);

useEffect(() => {
    const loadProfile = async () => {
            if (dapp.address && myprofile === '') {
                const profilefetch = await GatewayContractObj.methods.getPublisherProfile(dapp.address).call({from: dapp.address});
                const userfetch = await GatewayContractObj.methods.getUserProfile(dapp.address).call({from: dapp.address});
                if (profilefetch[0] !== "0x0000000000000000000000000000000000000000")
                {
                    window.location.href = "/dashboard";
                }
                if (userfetch[0] !== "0x0000000000000000000000000000000000000000") {
                    //console.log(userfetch);
                    setMyprofile(userfetch);
                    setProfilemodal(false);
                }
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
        setProfilemodal(false);
        window.location.href = "/dashboard";
    };

    const createUserProfile = async () => {
        await GatewayContractObj.methods.createNewUser(name,email)
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
        setProfilemodal(false);
        window.location.reload(false);
    };

    return (
        <Layout style={{ backgroundColor: '#041727' }}>
        {errorMessage && <Message error header='Oops!' content={errorMessage} />}
        <Grid centered>
            <Grid.Column width={16}>
                <div style={{textAlign:'center'}}>
                    <p>Welcome: {myprofile[1]} {myprofile[2]}</p>
                    <h2>Browse decentralized content on P3!</h2>
                    <hr />
                </div>
            </Grid.Column>
            <Grid.Column width={16}>
                <div style={{padding:'25px',display:'flex'}}>
                    <span className="hex" style={{color:'#666'}} onClick={() => setContentmodal(true)}>&#x2B22;</span>
                    <span className="hex" style={{color:'green'}}>&#x2B22;</span>
                    <span className="hex" style={{color:'blue'}}>&#x2B22;</span>
                    <span className="hex" style={{color:'orangered'}}>&#x2B22;</span>
                    <span className="hex" style={{color:'pink'}}>&#x2B22;</span>
                    <span className="hex" style={{color:'yellow'}}>&#x2B22;</span>
                    <span className="hex" style={{color:'coral'}}>&#x2B22;</span>
                </div>
            </Grid.Column>
        </Grid>
            <Modal
            open={profilemodal}
            size="small"
            closeOnEscape={false}
            closeOnDimmerClick={false}
            onClose={() => setProfilemodal(false)}
            >
                <Modal.Content  style={{backgroundColor:'#999'}}>
                <Modal.Description  style={{textAlign:'center'}}>
                    <div style={{color:"white"}}>
                        <h2>Welcome to Pay3
                            <br/>Please create a profile to proceed!
                            </h2>
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
                        <p style={{color:'white'}}>Logo? Profile Image?</p>
                        <Button style={{backgroundColor:"green",color:"white"}}  onClick={createPublisherProfile}>Create Publisher Profile</Button>
                        &nbsp;&nbsp;&nbsp;&nbsp;<Button style={{backgroundColor:"blue",color:"white"}} onClick={createUserProfile}>Create User Profile</Button>
                    </div>
                </Modal.Description>
                </Modal.Content>
            </Modal>
            <Modal
            closeIcon
            open={contentmodal}
            size="small"
            onClose={() => setContentmodal(false)}
            >
                <Modal.Content  style={{backgroundColor:'#999'}}>
                <Modal.Description  style={{textAlign:'center'}}>
                    <div style={{color:"white"}}>
                        <h2>|Pay modal|</h2>
                        <p style={{border:'3px solid yellow',padding:'50px',fontSize:'18px'}}>Possible content area???
                            <br/>...
                        <br/>...
                        <br/>...
                        <br/>...<br/>...
                        <br/>...
                        <br/>...
                        <br/>...
                        </p>
                        <Form>
                            <Form.Field>
                            <Checkbox label='Buy now!!!!!' />
                            </Form.Field>
                            <Form.Field>
                            <Checkbox label='Subscribe' />
                            </Form.Field>
                        <Button style={{backgroundColor:"green",color:"white"}}  onClick={() => console.log('submit')}>Purchase</Button>
                        </Form>
                    </div>
                </Modal.Description>
                </Modal.Content>
            </Modal>
        </Layout>
    );
};

export default Browse;
