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
import { Grid, Container, Header } from 'semantic-ui-react'

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
        margin: 10,
      },
    bigAvatar: {
        margin: 10,
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

const ContentCell = (props) => {
    const classes = useStyles();
    return (
        <div>

        <Grid verticalAlign='middle' columns='equal'>
            <Grid.Row>
              <Grid.Column>
              </Grid.Column>

              <Grid.Column width={3} centered={true}>
                <Avatar alt="Content" src="https://hub.textile.io/ipns/bafzbeiavk6dqpd4ryw756jyp2y6haaonivk3fqadn65r3vej7jkbkacw4e/thumbnail.jpg" className={classes.bigAvatar} />
              </Grid.Column>

              <Grid.Column>
                <Container fluid>
                    <Header as='h3' inverted>{props.content.title}</Header>
                    <SimpleP show={false} text={props.content.description}/>
                </Container>
              </Grid.Column>
            </Grid.Row>
        </Grid>

        <Grid verticalAlign='middle' columns='equal'>
            <Grid.Row>
              <Grid.Column>
              </Grid.Column>

              <Grid.Column width={3}>
                <Avatar alt="Content" src="https://hub.textile.io/ipns/bafzbeiavk6dqpd4ryw756jyp2y6haaonivk3fqadn65r3vej7jkbkacw4e/thumbnail.jpg" className={classes.bigAvatar} />
              </Grid.Column>

              <Grid.Column>
                <Container fluid>
                    <Header as='h3' inverted>{props.content.title}</Header>
                    <SimpleP show={true} text={props.content.description}/>
                </Container>
              </Grid.Column>
            </Grid.Row>
        </Grid>

        </div>
    );
};

export default ContentCell;