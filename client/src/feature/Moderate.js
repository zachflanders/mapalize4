import React, {Component} from 'react';
import axios from 'axios';
import {isAuthenticated, isMod} from '../auth'
import  './Moderate.css';
import PlacePNG from '../assets/place.png';
import {Link, Redirect} from 'react-router-dom';
import Nav from '../components/Nav';




import 'ol/ol.css';
import Map from 'ol/Map';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Text from 'ol/style/Text';
import Icon from 'ol/style/Icon';
import GeoJSON from 'ol/format/GeoJSON';
import {fromLonLat} from 'ol/proj';
import {transform} from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import View from 'ol/View';
import Zoom from 'ol/control/Zoom';
import Heatmap from 'ol/layer/Heatmap';
import Overlay from 'ol/Overlay';
import Feature from 'ol/Feature';
import Select from 'ol/interaction/Select.js';
import {click, pointerMove} from 'ol/events/condition.js';
import Cluster from 'ol/source/Cluster';
import {defaults as defaultInteractions} from 'ol/interaction.js';
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster';

import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Snackbar from '@material-ui/core/Snackbar';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import red from '@material-ui/core/colors/red';




const pngScale =0.18;
const pngAnchor = [0.5, 200];

let modMap = {};
let source = new VectorSource();
let layer = new VectorLayer({
  source: source,
  style: new Style({
    stroke: new Stroke({
      width: 8
    }),
    image: new Icon({
      anchor: pngAnchor,
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      crossOrigin: 'anonymous',
      color: '#000000',
      src: PlacePNG,
      scale: pngScale
    })
  })
});
let view = new View({});
let modify = new Modify({
  source: source,
  style: new Style({
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({
        color: '#fff'
      }),
      stroke: new Stroke({
        width: 1,
        color: '#000'
      })
    })
  })
});


class Moderate extends Component {
  constructor(){
    super()
    this.state = {
      feature: {},
      featureComment: '',
      showSnackbar: false,
      snackMessage: '',
      redirectToReferer: false
    }
    this.handleChange = this.handleChange.bind(this);
    this.saveFeature = this.saveFeature.bind(this);


  }

  componentDidMount(){
    source.clear()

    isMod();
    const featureId = this.props.match.params.featureId;

    axios.get(`/api/feature/${featureId}`)
    .then(res=>{
      console.log(res);
      this.setState({feature: res.data.feature});
      this.setState({featureComment: res.data.feature.comment})
      if(res.data.feature.line){
        let coords = [];
        coords = res.data.feature.line.coordinates.map(function(coord){
          return(fromLonLat(coord));
        });
        source.addFeature(new Feature(new LineString(coords)));
        view.fit(layer.getSource().getExtent());
      }
      else{
        let coords = [];
        coords = fromLonLat(res.data.feature.point.coordinates);
        source.addFeature(new Feature(new Point(coords)));
        view.setCenter(coords);
        view.setZoom(20);
      }


    });
    let modBasemapLayers =new TileLayer({
      source: new TileWMS({
        url: 'http://ec2-34-214-28-139.us-west-2.compute.amazonaws.com/geoserver/wms',
        params: {'LAYERS': 'Mapalize:KC-Basemap-Light', 'TILED': true},
        serverType: 'geoserver',
        transition: 0
      })
    });
    modMap = new Map({
        target: 'mod-map',
        layers: [modBasemapLayers, layer],
        //overlays: [overlay, resultsOverlay],
        view: view,
        controls: [
          new Zoom({
            className: 'zoom-control'
          })
        ]
      });
      modMap.addInteraction(modify);
  }

  handleChange(event){
    this.setState({ featureComment: event.target.value});
  };

  openDialog = () =>{
    this.setState({showDialog: true});
  }

  closeDialog = () => {
    this.setState({showDialog: false});
  }

  closeSnackbar = () => {
    this.setState({showSnackbar: false});
  }

  saveFeature = event =>{
    event.preventDefault();
    modMap.removeInteraction(modify);
    source.refresh();
    const token = isAuthenticated().token
    const featureId = this.props.match.params.featureId;
    let writer = new GeoJSON();
    let editFeature = JSON.parse(writer.writeFeatures(layer.getSource().getFeatures()));
    let feature = editFeature.features[0];
    feature.properties = {};
    feature.properties.comment = this.state.featureComment;
    feature.properties.layerName = this.state.feature.name;
    console.log(feature);
    axios.put(`/api/feature/${featureId}`,
      {feature: feature},
      {headers:{
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }}
    )
    .then(response=>{
      this.setState({snackMessage: response.data.message || response.data.error});
      this.setState({showSnackbar: true});
      console.log(response);
    });
  }

  deleteFeature = event =>{
    event.preventDefault();
    const token = isAuthenticated().token
    const featureId = this.props.match.params.featureId;
    axios.delete(`/api/feature/${featureId}`,
      {headers:{
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }}
    )
    .then(()=>{
      this.setState({snackMessage:'Feature Deleted.'});
      this.setState({redirectToReferer: true});
    })
  }

  render() {
    const {redirectToReferer} = this.state;
    if(redirectToReferer){
      return <Redirect to='/' />
    }

    return(
      <div>
      <Nav />
      <div id='center-div'>
      <h1 style={{marginLeft: '20px'}}>Moderate</h1>

        <Card id='edit-feature-card'>
          <CardContent>

          <h2>{this.state.feature.name}</h2>
          <Typography variant='caption' color='textSecondary' >Edit Feature</Typography>
          <div id='mod-map'></div>
          <form noValidate autoComplete="off">
            <TextField
              id="standard-multiline-flexible"
              label="Comment"
              multiline
              rowsMax="4"
              value={this.state.featureComment}
              onChange={this.handleChange}
              margin="normal"
              style={{width:'100%'}}
            />
            <Button variant='contained' onClick={this.saveFeature}>Save</Button>
            <br/>
            <br/>
            <Button
              variant='contained'
              style={{backgroundColor:red[500], color:'#ffffff'}}
              onClick={this.openDialog}
              >
              Delete
              </Button>
            </form>
            </CardContent>
            </Card>
            <Snackbar
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              open={this.state.showSnackbar}
              ContentProps={{
                'aria-describedby': 'message-id',
              }}
              message={<span id="message-id">{this.state.snackMessage}</span>}
              autoHideDuration = {2000}
              onClose = {this.closeSnackbar}
              />
              <Dialog
                open={this.state.showDialog}
                onClose={this.closeDialog}
              >
                <DialogTitle>{"Delete Feature"}</DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    Are you sure you want to delete this feature? (This cannot be undone.)
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={this.deleteFeature}
                    style={{backgroundColor:red[500], color:'#ffffff'}}
                  >
                    Delete
                  </Button>
                  <Button onClick={this.closeDialog}>
                    Cancel
                  </Button>
                </DialogActions>
              </Dialog>
      </div>
      </div>
    );
  }
}


export default Moderate;
