import React from 'react'
import { useState, useEffect } from 'react';
//import { useStateValue } from '../state';
//import Link from 'next/link';
import makeStyles from '@material-ui/styles/makeStyles'
import Avatar from '@material-ui/core/Avatar';
import { Grid, Container, Header, Button, Icon } from 'semantic-ui-react'
import Chance from 'chance';
import Moment from 'react-moment';

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
        width: 134,
        height: 134,
    },
    publishCellAvatar: {
        margin: 0,
        width: 232,
        height: 232,
    }, 
});

const circleButtonStyle = {
  borderRadius: '113px',
  width: '226px',
  height: '226px',
  border: '2px #fff',
  textAlign: 'center',
  paddingTop: '0px',
  display: 'flex',
  'justify-content': 'center',
  'align-items': 'center',                                      
};

const SimpleP = (props) => {
    if (props.show && props.text) {
        if (props.alignRight) {
            return (<p class='textalignright'>{props.text}</p>);
        } else {
            return (<p>{props.text}</p>);
        }
    }
    return null;
}

const SimpleDate = (props) => {
    if (props.show && props.text) {
        if (props.alignRight) {
            return (
<p class='textalignright'>
{props.text}:&nbsp;
<Moment format='MM/DD/YY HH:mm' unix>
  {props.date}
</Moment>
</p>            
            );
        } else {
<p>
{props.text}:&nbsp;
<Moment format='MM/DD/YY HH:mm' unix>
  {props.date}
</Moment>
</p>            
        }
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
                          <div class='circlewhite circlesizelarge'>
                              <div class='cellcenter circlesizelarge'>
                                        { props.isLoading === true ? (
                                          <div
                                            className='ui loading button inverted'
                                            style={circleButtonStyle}
                                          >
                                          </div>
                                      ) : (
                                            <label htmlFor='data_file'>
                                            <div
                                              className='ui basic button inverted'
                                              style={circleButtonStyle}
                                            >
                                            <Icon inverted style={{ margin: 'auto' }} name='add' size='big' />
                                            </div>
                                            </label>
                                        ) }
                              </div>
                          </div>
                      </div>
                  </div>

              </Grid.Column>

              <Grid.Column width={6}>
                <Container fluid>
                    <Header as='h2' inverted>{
                        props.isLoading === true ? (
                                "Uploading"
                            ) : (
                                "Upload content here"
                                )
                    }</Header>
                </Container>
              </Grid.Column>
        </Grid>

        </div>
    );
};

const PublishCell = (props) => {
    const classes = useStyles();
    return (
        <div class='uploadcell'>

        <Grid verticalAlign='middle'>
              <Grid.Column width={6}>
              </Grid.Column>

              <Grid.Column width={4}>
                  <div class='textaligncenter'>
                      <div class='displayinlineblock'>
                          <div class='circlewhite circlesizelarge'>
                              <div class='cellcenter circlesizelarge'>
                                        { !props.previewUrl ? (
                                          <Icon
                                            style={{ margin: 'auto' }}
                                            name='file outline'
                                            size='huge'
                                          />                                        
                                      ) : (
                                        <Avatar alt="Preview" src={props.previewUrl} className={classes.publishCellAvatar} />
                                        ) }
                              </div>
                          </div>
                      </div>
                  </div>
              </Grid.Column>

              <Grid.Column width={6}>
                <Container fluid>
                    <Header as='h2' inverted>{
                        props.isLoading === true ? (
                                "Uploading"
                            ) : (
                                "Upload content here"
                                )
                    }</Header>
                </Container>
              </Grid.Column>
        </Grid>

        </div>
    );
};

const ContentCell = (props) => {
    const maxRand = 10240;
    const maxRandLineHeight = 128;
    const classes = useStyles();
    const [showDes, setShowDes] = useState(true);
    const [randLineHeight, setRandLineHeight] = useState(chance.integer({ min: 32, max: maxRandLineHeight }));
    const [numLike, setNumLike] = useState(chance.integer({ min: 100, max: maxRand }));
    const [numDownload, setNumDownload] = useState(chance.integer({ min: 100, max: maxRand }));
    const [numRevenue, setNumRevenus] = useState(chance.integer({ min: 100, max: maxRand }));

    return (
        <div class='verticallinewhitecontentcell'>
        <div style={{height: randLineHeight}}></div>
        <Grid verticalAlign='middle'>
              <Grid.Column width={3}>
              </Grid.Column>

              <Grid.Column width={4} onClick={() => {setShowDes(!showDes)}}>
                  <div class='textaligncenter'>
                      <div class='displayinlineblock'>
                          <div class='circlewhite circlesizemedium'>
                              <div class='cellcenter circlesizemedium'>
                                        { !props.previewUrl ? (
                                          <Icon
                                            style={{ margin: 'auto' }}
                                            name='file outline'
                                            size='big'
                                          />                                        
                                      ) : (
                                        <Avatar alt="Preview" src={props.previewUrl} className={classes.bigAvatar} />
                                        ) }
                              </div>
                          </div>
                      </div>
                  </div>

              </Grid.Column>

              <Grid.Column width={9} onClick={() => {setShowDes(!showDes)}}>
                <Container fluid>
                    <Header as='h3' inverted>{props.title}</Header>
                    <SimpleP show={showDes} text={props.description}/>
                    <SimpleP show={showDes} text={props.filename} alignRight/>


                    <SimpleDate show={showDes} text={"Published"} date={props.filedate} alignRight/>
                    <SimpleP show={showDes} text={props.filefee
                    ? 'Free'
                    : 'Price: ' + props.filefee + ' ETH'} alignRight/>

                    <div class='textalignright'>
                      <Button
                        inverted
                        color='red'
                        icon='heart'
                        size='mini'
                        label={{ as: 'a',basic: true,color: 'red',pointing: 'left', content: numLike }}
                      />
                      <Button
                        inverted
                        color='blue'
                        icon='download'
                        size='mini'
                        label={{ as: 'a',basic: true,color: 'blue',pointing: 'left',content: numDownload }}
                      />
                      <Button
                        inverted
                        color='yellow'
                        icon='dollar'
                        size='mini'
                        label={{ as: 'a',basic: true,color: 'yellow',pointing: 'left',content: numRevenue }}
                      />
                    </div>
                </Container>
              </Grid.Column>
        </Grid>
        <div style={{height: randLineHeight}}></div>
        </div>
    );
};

export {
    UploadCell,
    PublishCell,
    ContentCell,
};