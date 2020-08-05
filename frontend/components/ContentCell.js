import React from 'react';
import { useState, useEffect } from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import Badge from '@material-ui/core/Badge';
import Avatar from '@material-ui/core/Avatar';
import { Grid, Container, Header, Button, Icon } from 'semantic-ui-react';
import Chance from 'chance';
import Moment from 'react-moment';

const chance = new Chance()

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

const TopCell = (props) => {
    const maxRand = 10240;
    const classes = useStyles();
    const [numFollower, setNumFollower] = useState(chance.integer({ min: 100, max: maxRand }));
    const [numUpload, setNumUpload] = useState(chance.integer({ min: 10, max: 1024 }));
    const [numLike, setNumLike] = useState(chance.integer({ min: 100, max: maxRand }));
    const [numDownload, setNumDownload] = useState(chance.integer({ min: 100, max: maxRand }));
    const [numRevenue, setNumRevenus] = useState(chance.integer({ min: 100, max: maxRand }));

    return (
        //<div class='verticallinewhitecontentcell'>
        <div>
        <Grid verticalAlign='middle'>
              <Grid.Column width={3}>
                <div class='textalignleft'>
                    <Header as='h1' inverted>{props.title}</Header>
                </div>
              </Grid.Column>

              <Grid.Column width={4}>
              </Grid.Column>

              <Grid.Column width={9}>
                <Container fluid>
                    <div class='textalignright'>
                    <Button
                        inverted
                        color='green'
                        icon='users'
                        size='mini'
                        label={{ as: 'a',basic: true,color: 'green',pointing: 'left', content: numFollower }}
                      />
                    <Button
                        inverted
                        color='purple'
                        icon='upload'
                        size='mini'
                        label={{ as: 'a',basic: true,color: 'purple',pointing: 'left', content: numUpload }}
                      />
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
        </div>
    );
};

const UploadCell = (props) => {
    const classes = useStyles();
    return (
        <div class='uploadcell'>

        <Grid verticalAlign='middle'>
              <Grid.Column width={3}>
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

              <Grid.Column width={9}>
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
              <Grid.Column width={3}>
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

              <Grid.Column width={9}>
                <Container fluid>
                    <Header as='h2' inverted>{
                        props.isLoading === true ? (
                                "Uploading"
                            ) : (
                                "Ready to publish"
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
    const [showDes, setShowDes] = useState(props.defaultShowDes ? true : false);
    const [randLineHeight, setRandLineHeight] = useState(chance.integer({ min: 32, max: maxRandLineHeight }));
    const [numLike, setNumLike] = useState(chance.integer({ min: 100, max: maxRand }));
    const [numDownload, setNumDownload] = useState(chance.integer({ min: 100, max: maxRand }));
    const [numRevenue, setNumRevenus] = useState(chance.integer({ min: 100, max: maxRand }));

    return (
        //<div class='verticallinewhitecontentcell'>
        <div>
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
                    <SimpleP show={showDes} text={ props.filefee == 0 ? 'Free' : 'Price: ' + props.filefee + ' ETH'} alignRight/>

                    <div class='textalignright'>
                      <Button
                        inverted
                        color='red'
                        icon='heart'
                        size='mini'
                        label={{ as: 'a',basic: true,color: 'red',pointing: 'left', content: numLike }}
                      />
                      { props.isConsumerMode ? (
                          <></>
                      ) : (
                        <>  
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
                      </>
                      ) }
                    </div>
                </Container>
              </Grid.Column>
        </Grid>
        <div style={{height: randLineHeight}}></div>
        </div>
    );
};

const ConsumeCell = (props) => {
    const classes = useStyles();
    const maxRandLineHeight = 128;
    const [randLineHeight, setRandLineHeight] = useState(chance.integer({ min: 32, max: maxRandLineHeight }));

    const maxRand = 10240;
    const [showDes, setShowDes] = useState(false);
    const [numLike, setNumLike] = useState(chance.integer({ min: 100, max: maxRand }));

    return (
        <div>
        <div style={{height: 32}}></div>
        <Grid.Row verticalAlign='middle'>
              <Grid.Column width={4}>
                  <div class='textaligncenter'>
                      <div class='displayinlineblock'>
                          <div class='circlewhite circlesizemedium'>
                              <div class='cellcenter circlesizemedium'>
                                { props.isPlayable ? (
                                      <Badge
                                      overlap="circle"
                                      anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'right',
                                      }}    
                                      badgeContent={<Button circular color='green' icon='play' size='mini' onClick={props.playFunc}/>}
                                      >
                                      <Avatar alt="Preview" src={props.previewUrl} className={classes.bigAvatar} />
                                      </Badge>      
                                  ) : (
                                      <Badge
                                      overlap="circle"
                                      anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'right',
                                      }}    
                                      badgeContent={<Button circular color='yellow' icon='dollar' size='mini' onClick={props.modelFunc}/>}
                                      >
                                      <Avatar alt="Preview" src={props.previewUrl} className={classes.bigAvatar} />
                                      </Badge>      
                                  ) }
                              </div>
                          </div>
                      </div>
                  </div>
              </Grid.Column>

            { showDes ? (
              <Grid.Column width={4} onClick={() => {setShowDes(!showDes)}}>
              <Container fluid>
                  <Header as='h3' inverted>{props.title}</Header>
                  <SimpleP show={showDes} text={props.description}/>

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
                  </div>
              </Container>
            </Grid.Column>
            ) : (
                <></>
            ) }
        </Grid.Row>
        <div style={{height: 32}}></div>
        </div>
    );
};

export {
    TopCell,
    UploadCell,
    PublishCell,
    ContentCell,
    ConsumeCell,
};