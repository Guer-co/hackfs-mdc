import React, { useState, useEffect } from 'react';
import { useStateValue } from '../state';
import Layout from '../components/Layout';
import { Message, Icon, Button, Grid } from 'semantic-ui-react';
import Loader from 'react-loader-spinner';
import GatewayContractObjSetup from '../utils/GatewayConstructor';
import Moment from 'react-moment';


const Publish = () => {
    const [{ dapp }, dispatch] = useStateValue();
    const [loading, setLoading] = useState(false);
    //const [file, setFile] = useState('');
    const [filename, setFilename] = useState('');
    const [filehash, setFilehash] = useState('');
    const [errorMessage, setError] = useState('');
    const [mycontracts, setMycontracts] = useState('');
    const [contentarray, setContentarray] = useState([]);
    const [allcontent, setAllcontent] = useState([]);
    const [myprofile, setMyprofile] = useState('');


    const GatewayContractObj = GatewayContractObjSetup(dapp.web3);

    useEffect(() => {
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
                        console.log(result);
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
        data.append('file', file);
        setFilename(file.name);
        fetch('http://localhost:8888/api/ipfs', {
        body: data,
        method: 'POST'
        })
        .then((res) => res.json())
        .then((res) => {
            console.log(res);
            setFilehash(res);
            setLoading(false);
        })
        .catch((err) => {
            setError(err.message);
            setTimeout(() => setError(''), 3000);
        });
    };

    const addContentToContract = async () => {
        await GatewayContractObj.methods
        .createContent(myprofile[0], filehash, filename, true, 1)
        .send({ from: dapp.address })
        .then(function (result) {
            console.log(result);
            window.location.reload(false);
        })
        .catch(function (error) {
            console.log(error);
        });
    };

    const updateProfile = async () => {
    };

    return (
        <Layout style={{ backgroundColor: '#041727' }}>
        {errorMessage && <Message error header='Oops!' content={errorMessage} />}
        <Grid centered>
            <Grid.Column width={16}>
                <div style={{textAlign:'center'}}>
                    <h3>Publisher Dashboard P3 [logo]</h3>
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
                                <img src={`https://cloudflare-ipfs.com/ipfs/${filehash}`}/>
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
                                href={`https://cloudflare-ipfs.com/ipfs/${filehash}`}
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
                    <h2 style={{margin:'0px'}}>$222.22 ETH </h2>
                    <br/>
                    <h5 style={{margin:'0px'}}>Users</h5>
                    <h2 style={{margin:'0px'}}>3333 users</h2>
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
                        return(
                        <div className='imagebox' key={result[0]}>
                            <a
                            rel='noopener noreferrer'
                            target='_blank'
                            href={'https://gateway.ipfs.io/ipfs/' + result[0]}
                            >
                            <div><img style={{border:'1px dotted #999', maxWidth:'125px',maxHeight:'125px', margin:'5px'}} src={`https://cloudflare-ipfs.com/ipfs/${result[0]}`}/></div>
                            </a>
                        <p>{result[1]}<br/>
                        <Moment format='MM/DD/YY HH:mm' unix>
                            {result[2]}
                        </Moment>
                        </p>
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
