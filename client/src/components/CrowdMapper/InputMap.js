import React, { Component } from 'react';

import PlacePNG from '../../assets/place.png';

import Overlay from 'ol/Overlay';
import 'ol/ol.css';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Icon from 'ol/style/Icon';
import Select from 'ol/interaction/Select.js';
import {click} from 'ol/events/condition.js';

import tippy from 'tippy.js';


  

class InputMap extends Component {
    constructor(props) {
      super(props);
      this.state = {};

    }

  
  
    render(){return(
        <div id='map' />
    )}

    componentDidMount(){
        if(typeof this.props.map  === 'function'){
            this.props.map.setTarget('map');
    
        
        }
        
    }
}

export default InputMap;