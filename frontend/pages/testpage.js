import React, { useState, useEffect } from 'react';
import { Menu, Message, Icon, Button,Grid } from 'semantic-ui-react';
const IPFS = require('ipfs-http-client');
import buffer from 'buffer';

//import { useStateValue } from '../state';


const TestPage = () => {
const [loading,setLoading] = useState(false);
const [file,setFile] = useState('');
const [filename,setFilename] = useState('');
const [filehash,setFilehash] = useState('');


const uploadToIPFS = async () => {
    const data = new FormData();
    const file = document.getElementById("data_file").files[0];
    data.append("file", file);
    setFilename(file.name);
    fetch('/api/ipfs', {
        body: data,
        method: 'POST'
    })
    .then(res => res.json())
    .then(res => {console.log(res); setFilehash(res);})
    .catch(error => error.message)
}

const ping = async () => {
    fetch('api/ping')
    .then(res => console.log(res))
}

return (
    <Grid centered columns={2}>
        <Grid.Column>
            <div style={{marginTop:'200px'}}>
                    <input
                        id="data_file"
                        type="file"
                        style={{display:'none'}}
                    onChange={uploadToIPFS}
                    />
                    <label htmlFor="data_file">
                    <div id="uploadarea file-field input-field" className="ui basic button" style={{borderRadius:'250px',width:'250px',height:'250px',border:'3px solid white',paddingTop:'75px',textAlign:'center'}}>
                        <Icon style={{margin:'auto',color:'white'}} name="add" size="huge" /><br/><br/><br/><p style={{color:'white',fontSize:'18px'}}>Upload File</p>
                    </div>
                </label>

                <div id="ipfsdata">

                </div>
                <br/><br/>
                <button onClick={() => ping()}>Test ping button</button>
            </div>
        </Grid.Column>
    </Grid>
)
}

export default TestPage;