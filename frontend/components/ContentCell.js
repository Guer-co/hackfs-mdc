import React from 'react'
//import { useState, useEffect } from 'react';
//import { useStateValue } from '../state';
//import Link from 'next/link';
//import { Menu, Message, Icon } from 'semantic-ui-react';
//import { Image } from 'semantic-ui-react'
import makeStyles from '@material-ui/styles/makeStyles'
//import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar';
//import TextField from '@material-ui/core/TextField';
import { Grid, Container, Header, Button, Icon } from 'semantic-ui-react'

const useStyles = makeStyles({
    root: {
      background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
      border: 0,
      borderRadius: 3,
      boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
      color: 'white',
      height: 48,
      padding: '0 30px',
    },
    avatar: {
        margin: 0,
      },
    bigAvatar: {
        margin: 0,
        width: 128,
        height: 128,
    },    
});

const SimpleP = (props) => {
    if (props.show && props.text) {
        return (
            <p>{props.text}</p>
        );    
    }
    return null;
}

const UploadCell = (props) => {
    const classes = useStyles();
    return (
        <div class='uploadcell'>

        <Grid verticalAlign='middle'>
              <Grid.Column width={6}>
              </Grid.Column>

              <Grid.Column width={4}>
                  <div class='textaligncenter'>
                      <div class='displayinlineblock'>
                          <div class='circlewhite'>
                              <div class='uploadcellbutton'>
                              <label htmlFor='data_file'>
                                    <div
                                      className='ui basic button inverted'
                                      style={{
                                        borderRadius: '113px',
                                        width: '226px',
                                        height: '226px',
                                        border: '2px #fff',
                                        textAlign: 'center',
                                        paddingTop: '0px',
                                        display: 'flex',
                                        'justify-content': 'center',
                                        'align-items': 'center',                                      
                                      }}
                                    >
                                      <Icon inverted style={{ margin: 'auto' }} name='add' size='big' />
                                    </div>
                                  </label>

                              </div>
                          </div>
                      </div>
                  </div>

              </Grid.Column>

              <Grid.Column width={6}>
                <Container fluid>
                    <Header as='h2' inverted>{"Upload content here"}</Header>
                </Container>
              </Grid.Column>
        </Grid>

        </div>
    );
};

const ContentCell = (props) => {
    const classes = useStyles();
    return (
        <div class='verticallinecenteredwhite'>
        <Grid verticalAlign='middle'>
              <Grid.Column width={6}>
              </Grid.Column>

              <Grid.Column width={4}>
                  <div class='textaligncenter'>
                      <div class='displayinlineblock'>
                        <Avatar alt="Content" src={props.content.previewUrl} className={classes.bigAvatar} />
                      </div>
                  </div>
              </Grid.Column>

              <Grid.Column width={6}>
                <Container fluid>
                    <Header as='h3' inverted>{props.content.title}</Header>
                    <SimpleP show={false} text={props.content.description}/>
                </Container>
              </Grid.Column>
        </Grid>

        </div>
    );
};

export {
    UploadCell,
    ContentCell,
};