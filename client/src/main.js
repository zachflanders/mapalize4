import React, { Component } from 'react';
import './App.css';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';

import CardContent from '@material-ui/core/CardContent';
import LineIcon from '@material-ui/icons/Timeline';
import Typography from '@material-ui/core/Typography';
import PlaceIcon from '@material-ui/icons/Place';

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

import PlaceSVG from './assets/place.svg';
import * as moment from 'moment'


let cardmap = [];

class MapCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);

  }

 render() {
   return (
     <Card style={{width:'100%'}}>
       <CardHeader
            avatar={
              <Avatar aria-label="Icon" style={{backgroundColor:"#fff"}}>
                {((this.props.data.point === null)? <LineIcon style={{color:this.props.data.color, verticalAlign:'middle'}}/> : <PlaceIcon style={{color:this.props.data.color, verticalAlign:'middle'}}/>)}
              </Avatar>
            }
            title= {<strong>{this.props.data.name}</strong>}
            subheader={(this.props.data.date) ? moment(this.props.data.date).subtract(5,'hours').format('MMMM Do YYYY, h:mm a') : ''}
          />
         <div id={'cardmap-'+this.props.data.id} className='cardmap'></div>
         <CardContent>
           <Typography component="p">
             {this.props.data.comment}
           </Typography>
         </CardContent>
     </Card>
   );
 }
 componentDidMount(){
   let color = this.props.data.color;
   var source = new VectorSource();
   var layer = new VectorLayer({
     source: source,
     style: new Style({
       image: new Icon(({
         anchor: [0.5, 60],
         anchorXUnits: 'fraction',
         anchorYUnits: 'pixels',
         crossOrigin: 'anonymous',
         src: PlaceSVG,
         color: color,
         scale: 0.5
       })),
       stroke: new Stroke({
         color: color,
         width: 8
       })
     })
   });

   cardmap[this.props.data.id] = new Map({
       target: 'cardmap-'+this.props.data.id,
       layers: [new TileLayer({
         source: new TileWMS({
           url: 'http://ec2-34-214-28-139.us-west-2.compute.amazonaws.com/geoserver/wms',
           params: {'LAYERS': 'Mapalize:OSM-KC-ROADS', 'TILED': true},
           serverType: 'geoserver',
           transition: 0
         })
       }), layer],
       interactions: [],
       view: new View({
         center: ((this.props.data.point !== null)?(fromLonLat(this.props.data.point.coordinates)):(fromLonLat([-94.573, 39.143]))),
         zoom: 16,
         maxZoom: 20,
         minZoom: 12
       }),
       controls: []
     });
     if(this.props.data.point !== null){
       source.addFeature(new Feature(new Point(fromLonLat(this.props.data.point.coordinates))))
     }
     else{
       let coords = [];
       coords = this.props.data.line.coordinates.map(function(coord){
         return(fromLonLat(coord));
       });
       source.addFeature(new Feature(new LineString(coords)));
       cardmap[this.props.data.id].getView().fit(source.getExtent());
       //cardmap[this.props.data.id].getView().fit(source.getExtent(), cardmap[this.props.data.id].getSize());
     }



 }
 componentDidUpdate(){
   cardmap[this.props.data.id].updateSize();
 }
}


class MainDisplay extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.renderMapCard = this.renderMapCard.bind(this);
  }

  renderMapCard(item){
    return <MapCard data={item} />
  }

  render() {
    let featureArrayWithColors = [];
    if(this.props.data){
      featureArrayWithColors = this.props.data.map(function(feature){
        this.props.layers.map(function(layer){
          if(feature.name === layer.name){
            feature.color = layer.color;
            return(feature);
          }
        })
      }.bind(this));

    }


    if(this.props.mode === 'map'){
      return (" ");
    }
    else{
      var features = this.props.data.map(function(item) {
        console.log(item);
        return (
          <div key={item.id} style={{width:'300px', flex:'1 auto', margin:'8px'}}>{this.renderMapCard(item)}</div>
        );
      }.bind(this));
      return (
          <div id='cards' style={{display:'flex', flexFlow:'row wrap', padding:'8px'}}>
            {features}
          </div>
      );
    }
  }



}
export default MainDisplay;
