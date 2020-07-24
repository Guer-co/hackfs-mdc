import React, { useState, useEffect } from 'react';
import { useStateValue } from '../state';
import Layout from '../components/Layout';
import { Message, Icon, Button, Grid, Modal, Form, Popup } from 'semantic-ui-react';
import Loader from 'react-loader-spinner';
import GatewayContractObjSetup from '../utils/GatewayConstructor';
import Moment from 'react-moment';


const Publish = () => {
    const [{ dapp }, dispatch] = useStateValue();
    const [loading, setLoading] = useState(false);
    //const [file, setFile] = useState('');
    const [filename, setFilename] = useState('');
    const [filehash, setFilehash] = useState('');
    const [filetype, setFiletype] = useState('');
    const [filepreview, setFilepreview] = useState('');
    const [errorMessage, setError] = useState('');
    const [mycontracts, setMycontracts] = useState('');
    const [contentarray, setContentarray] = useState([]);
    const [allcontent, setAllcontent] = useState([]);
    const [myprofile, setMyprofile] = useState('');
    const [openmodal,setOpenmodal] = useState(false);



    const GatewayContractObj = GatewayContractObjSetup(dapp.web3);

    useEffect(() => {
        console.log(filehash);
        const loadProfile = async () => {
            if (dapp.address && myprofile === '') {
            const profilefetch = await GatewayContractObj.methods
                .getPublisherProfile(dapp.address)
                .call({ from: dapp.address });
                setMyprofile(profilefetch);
            }
            if (dapp.address && contentarray.length === 0) {
            const contentaddresses = await GatewayContractObj.methods
                .getPublisherContracts(dapp.address)
                .call({ from: dapp.address });
                setContentarray(contentaddresses);
            }
            if (contentarray.length > 0 && allcontent.length === 0) {
            const contentdetails = async () => {
                console.log('contentdetails');
                let temparray = [];
                for (let i = 0; i < contentarray.length; i++) {
                await GatewayContractObj.methods
                    .getContentInformation(myprofile[0],contentarray[i])
                    .call({ from: dapp.address })
                    .then(function (result) {
                        temparray.push(result);
                    });
                }
                setAllcontent(temparray);
            };
            contentdetails();
            }
        };
        loadProfile();
    }, [dapp.address, myprofile, allcontent, contentarray]);

    const uploadToIPFS = async () => {
        setLoading(true);
        const data = new FormData();
        const file = document.getElementById('data_file').files[0];
        console.log(file);
        data.append('file', file);
        setFilename(file.name);
        setFiletype(file.type);

        fetch('http://localhost:8888/api/ipfs', {
        body: data,
        method: 'POST'
        })
        .then((res) => res.json())
        .then((res) => {
            console.log(res);
            setFilehash(res);
            setFilepreview(res);
            setLoading(false);
        })
        .catch((err) => {
            setError(err.message);
        });
    };

    const addContentToContract = async () => {
        await GatewayContractObj.methods
        .createContent(myprofile[0], filehash, filepreview, filename, filetype, true, 1)
        .send({ from: dapp.address })
        .then(function (result) {
            console.log(result);
            window.location.reload(false);
        })
        .catch(function (error) {
            console.log(error);
        });
    };

    //const updateProfile = async () => {
    //};

    return (
        <Layout style={{ backgroundColor: '#041727' }}>
        {errorMessage && <Message error header='Oops!' content={errorMessage} />}
        <Grid centered>
            <Grid.Column width={16}>
                <div style={{textAlign:'center'}}>
                    <h3>Publisher Dashboard P3 <img src="https://bafzbeidknbjj5i2q76banhbj37etrruoeogtmbd7qeycyxuvtqpazvnmoa.ipns.hub.textile.io/p3.png" style={{width:'50px',backgroundColor:"white",borderRadius:'25px'}}/></h3>
                    <hr />
                    <div>Publisher Address: {myprofile[0]}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Name:  {myprofile[1]}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Email: {myprofile[2]} </div>
                </div>
            </Grid.Column>
            <Grid.Column width={3}>
                <div style={{padding:'25px',fontSize:'16px',color:'white'}}>
                    <a href="/dashboard">home</a><br/><br/>
                    <a href="#">publish</a><br/><br/>
                    <a href="#">payments</a><br/><br/>
                    <a href="#">profile</a><br/><br/>
                    <a href="/browse">browse</a><br/><br/>
                </div>
            </Grid.Column>
            <Grid.Column width={7}>
                <div style={{borderLeft:'1px solid #999',padding:'25px'}}>
                    <h3>Publish New Content</h3>
                    {filehash === '' ? (
                    loading === true ? (
                        <>
                        <Loader
                            type='Grid'
                            color='#fcfcfc'
                            height={100}
                            width={100}
                            timeout={10000} //3 secs
                        />
                        </>
                    ) : (
                        <>
                            <input
                            id='data_file'
                            type='file'
                            style={{ display: 'none' }}
                            onChange={uploadToIPFS}
                            />
                            <label htmlFor='data_file'>
                            <div
                                id='uploadarea file-field input-field'
                                className='ui basic button'
                                style={{
                                borderRadius: '20px',
                                width: '100%',
                                height: '150px',
                                border: 'dashed 2px #999',
                                textAlign: 'center',
                                paddingTop:'20px'
                                }}
                            >
                                <Icon
                                style={{ margin: 'auto', color: 'white' }}
                                name='add'
                                size='huge'
                                />
                                <br />
                                <br />
                                <br />
                                <p style={{ color: 'white', fontSize: '18px' }}>
                                Upload New Content
                                </p>
                            </div>
                            </label>
                            <br />
                            <br />
                        </>
                    )
                    ) : (
                        <>
                            <div id='img'>
                                <img src={filehash}/>
                            </div>
                            <div id='name'>
                                <strong>Name:</strong> {filename}
                            </div>
                            <div id='name'>
                                <strong>IPFS HASH:</strong> {filehash}
                            </div>
                            <div id='link'>
                                <strong>Link to file:</strong>{' '}
                                <a
                                target='_blank'
                                rel='no-follow'
                                href={filehash}
                                >
                                LINK
                                </a>
                            </div>
                            <Button onClick={addContentToContract}>
                                Publish this content
                            </Button>
                        </>
                        )}                    
                </div>
            </Grid.Column>
            <Grid.Column width={6}>
                <div style={{borderLeft:'1px solid #999',padding:'25px'}}>
                    <h5 style={{margin:'0px'}}>Payments</h5>
                    <h2 style={{margin:'0px'}}>$111.11 ETH</h2>
                    <br/>
                    <h5 style={{margin:'0px'}}>Costs</h5>
                    <h2 style={{margin:'0px'}}>$222.22 ETH &nbsp;
                    </h2>
                    <br/>
                    <h5 style={{margin:'0px'}}>Extra $</h5>
                    <h2 style={{margin:'0px'}}>$1,000&nbsp;&nbsp;&nbsp;&nbsp;
                        <Popup content='Withdraw Funds' trigger={<Button icon='add' onClick={() => console.log('a')}/>} />
                    </h2>
                    <br/>
                    <h5 style={{margin:'0px'}}>Users</h5>
                    <h2 style={{margin:'0px'}}>3333 users&nbsp;&nbsp;&nbsp;&nbsp;
                        <Popup content='View Subscriber Addresses' trigger={<Button icon='add' onClick={() => console.log('b')}/>} />
                    </h2>
                </div>
            </Grid.Column>
            <Grid.Column width={3}>
                <div>
                </div>
            </Grid.Column>
            <Grid.Column width={13}>
                <div>
                    <h3>Recent Uploaded Content</h3>
                    <hr />
                    <div style={{display:'flex'}}>
                    {allcontent.map((result => {
                        console.log(result);
                        return(
                        <div className='imagebox' key={result[0]}>
                            {/*<a rel='noopener noreferrer' target='_blank' href={result[0]}>*/}
                            <div onClick={() => setOpenmodal(true)}><img style={{border:'1px dotted #999', width:'125px',height:'125px', margin:'5px'}} src={result[0]}/></div>
                            {/*</a>*/}
                        <p>{result[1]}<br/>
                        <Moment format='MM/DD/YY HH:mm' unix>
                            {result[2]}
                        </Moment>
                        </p>
                            <Modal
                            open={openmodal}
                            size="small"
                            closeIcon
                                onClose={() => setOpenmodal(false)}

                            >
                                <Modal.Header style={{backgroundColor:'#666',textAlign:'center',color:"whie"}}>Content Details</Modal.Header>
                                <Modal.Content  style={{backgroundColor:'#666'}}>
                                <Modal.Description  style={{textAlign:'center'}}>
                                    <a rel='noopener noreferrer' target='_blank' href={result[0]}>
                                    <img style={{border:'1px dotted #999', width:'125px',height:'125px', margin:'5px'}} src={result[0]}/>
                                    </a>
                                    <br/>
                                    <p style={{fontSize:'18px'}}>Filename: {result[1]}</p>
                                    <p style={{fontSize:'18px'}}>Uploaded:&nbsp;
                                        <Moment format='MM/DD/YY HH:mm' unix>
                                        {result[2]}
                                    </Moment></p>
                                    <p style={{fontSize:'18px'}}>{result[3] ? "Free content" : "Paid content"}</p>
                                    <p style={{fontSize:'18px'}}>Price: {result[4]}</p>


                                    <Button>shrug_emoji</Button>
                                </Modal.Description>
                                </Modal.Content>
                            </Modal>
                        </div>
                        )
                    }))}
                    <div style={{border:'1px dotted #999', width:'140px',height:'100px', margin:'5px'}}>image here that links to the content on IPFS</div>
                    </div>
                </div>
            </Grid.Column>
        </Grid>
        </Layout>
    );
    };

    export default Publish;
