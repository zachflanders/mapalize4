import React, {Component} from 'react';
import axios from 'axios';
import {isAuthenticated, isMod} from '../auth'
import  './Moderate.css';


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

import red from '@material-ui/core/colors/red';






let map = {};


class Moderate extends Component {
  constructor(){
    super()
    this.state = {
      feature: {},
      featureComment: '',
    }
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount(){
    let source = new VectorSource();
    let layer = new VectorLayer({
      source: source,
      style: new Style({
        stroke: new Stroke({
          width: 8
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
    isMod();
    const featureId = this.props.match.params.featureId;
    axios.get(`/api/feature/${featureId}`)
    .then(res=>{
      console.log(res);
      this.setState({feature: res.data.feature});
      this.setState({featureComment: res.data.feature.comment})
      let coords = [];
      coords = res.data.feature.line.coordinates.map(function(coord){
        return(fromLonLat(coord));
      });
      source.addFeature(new Feature(new LineString(coords)));
      view.fit(layer.getSource().getExtent());
    });
    let basemapLayers =new TileLayer({
      source: new TileWMS({
        url: 'http://ec2-34-214-28-139.us-west-2.compute.amazonaws.com/geoserver/wms',
        params: {'LAYERS': 'Mapalize:KC-Basemap-Light', 'TILED': true},
        serverType: 'geoserver',
        transition: 0
      })
    });
    map = new Map({
        target: 'mod-map',
        layers: [basemapLayers, layer],
        //overlays: [overlay, resultsOverlay],
        view: view,
        controls: [
          new Zoom({
            className: 'zoom-control'
          })
        ]
      });
      map.addInteraction(modify);
  }

  handleChange(event){

    this.setState({ featureComment: event.target.value});
  };

  render() {

    return(
      <div>
        <Card id='edit-feature-card'>
          <CardContent>
          <h1>Moderate</h1>
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
            <Button variant='contained'>Save</Button>
            <br/>
            <br/><Button variant='contained' style={{backgroundColor:red[500], color:'#ffffff'}}>Delete</Button>
            </form>
            </CardContent>
            </Card>
      </div>
    );
  }
}


export default Moderate;
