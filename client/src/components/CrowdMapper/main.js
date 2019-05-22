import React, { Component } from 'react';
import '../../App.css';
import {logout, isMod} from '../auth'

import PropTypes from 'prop-types';
import _ from 'lodash';
import {Link} from 'react-router-dom'


import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';

import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardContent';

import LineIcon from '@material-ui/icons/Timeline';
import Typography from '@material-ui/core/Typography';
import PlaceIcon from '@material-ui/icons/Place';
import LeftIcon from '@material-ui/icons/ChevronLeft';
import RightIcon from '@material-ui/icons/ChevronRight';
import Button from '@material-ui/core/Button';
import EditIcon from '@material-ui/icons/Edit';



import 'ol/ol.css';
import Map from 'ol/Map';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';

import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';

import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';

import Icon from 'ol/style/Icon';
import {fromLonLat} from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import View from 'ol/View';

import Feature from 'ol/Feature';


import PlacePNG from '../../assets/place.png';

import * as moment from 'moment';
import Masonry from 'react-masonry-component';



let cardmap = [];
const pngScale =0.18;
const pngAnchor = [0.5, 200];


class MapCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);

  }

 render() {
   return (
     <Card style={{margin:'8px'}}>
       <CardHeader
            avatar={
              <Avatar aria-label="Icon" style={{backgroundColor:"#fff"}}>
                {((this.props.data.point === null)? <LineIcon style={{color:this.props.data.color, verticalAlign:'middle'}}/> : <PlaceIcon style={{color:this.props.data.color, verticalAlign:'middle'}}/>)}
              </Avatar>
            }
            title= {<strong>{this.props.data.name}</strong>}
            subheader={(this.props.data.date) ? moment(this.props.data.date).format('MMMM Do YYYY, h:mm a') : ''}
          />
         <div id={'cardmap-'+this.props.data.id} className='cardmap'></div>
         <CardContent>
           <Typography component="p">
             {this.props.data.comment}
            </Typography>
        </CardContent>{isMod() && (
          <Link to={'/moderate/'+this.props.data.id} style={{textDecoration:'none'}}>
            <CardActions style={{padding:'8px 8px'}}>
              <Button size="small"><EditIcon /> &nbsp;&nbsp;Moderate</Button>
            </CardActions>
          </Link>
        )}

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
         anchor: pngAnchor,
         anchorXUnits: 'fraction',
         anchorYUnits: 'pixels',
         crossOrigin: 'anonymous',
         src: PlacePNG,
         color: color,
         scale: pngScale
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

class Paginate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1
    };
    this.renderMapCard = this.renderMapCard.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.prevPage = this.prevPage.bind(this);


  }

  nextPage(){
    this.setState({currentPage:this.state.currentPage+1});
    window.scrollTo(0,0);
  }

  prevPage(){
    this.setState({currentPage:this.state.currentPage-1});
    window.scrollTo(0,0);
  }


  renderMapCard(item){
    return <MapCard data={item} />
  }

  render(){
    let featureArrayWithColors = [];
    if(this.props.data){
      featureArrayWithColors = this.props.data.map(function(feature){
        this.props.layers.map(function(layer){
          if(feature.name === layer.name){
            feature.color = layer.color;
            feature.viewResults = layer.viewResults;
            return(feature);
          }
        })
      }.bind(this));

    }
    let features;
    if (this.props.data){
      features = this.props.data;
    }
    else{
      features = {};
    }
    let sortedFeatures
    if(!_.isEmpty(features)){
      sortedFeatures = features.sort(function(a,b){
        if(this.props.cardSortState === 'newest'){
          return(new Date(b.date)-new Date(a.date))
        }
        else if(this.props.cardSortState === 'oldest'){
          return(new Date(a.date)-new Date(b.date))
        }
        else{
          return(new Date(b.date)-new Date(a.date))
        }
      }.bind(this));
    }
    let numberOfItems = features.length;
    let itemsPerPage = 30;
    let totalPages = Math.ceil(numberOfItems/itemsPerPage);
    let cards;
    if(!_.isEmpty(sortedFeatures)){
      cards = sortedFeatures.map(function(item, count){
        if(item.viewResults === true && count < (itemsPerPage*this.state.currentPage) && (this.state.currentPage===1 || (count >= (itemsPerPage*this.state.currentPage-itemsPerPage)&& count <= itemsPerPage*this.state.currentPage))){
          return(
            <div key={item.id} className='resultCard' style={{flex:'1 auto', margin:'0px'}}>{this.renderMapCard(item)}</div>
          )
        }
      }.bind(this))
    }



    return(
      <div>
        <Masonry
          style={{display:'flex', flexFlow:'row wrap', paddingTop:'8px', margin:'8px'}}
          options={{transitionDuration: 0}}
        >{cards}</Masonry>
        <div style={{textAlign:"center"}}>
          <Button
            disabled={(this.state.currentPage === 1)?true:false}
            onClick = {this.prevPage}
          >
            <LeftIcon />
          </Button>
          Page {this.state.currentPage} of {totalPages}
          <Button
            disabled={(this.state.currentPage === totalPages)?true:false}
            onClick = {this.nextPage}
          >
            <RightIcon />
          </Button>
        </div>
        <br />
      </div>
    )
  }
}

class MainDisplay extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }



  render() {
    if(this.props.mode === 'map' || this.props.view === 0){
      return (" ");
    }
    else{

      return (
          <div id='cards'>
            <Paginate
              data={this.props.data}
              layers = {this.props.layers}
              cardSortState = {this.props.cardSortState}
              />
          </div>
      );
    }
  }



}
export default MainDisplay;
