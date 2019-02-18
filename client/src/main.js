import React, { Component } from 'react';
import './App.css';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import LineIcon from '@material-ui/icons/Timeline';
import Typography from '@material-ui/core/Typography';
import 'ol/ol.css';

class MapCard extends React.Component {
 render() {
   return (
     <Card style={{width:'100%'}}>
       <CardContent>
            <LineIcon style={{color:'#00c853', verticalAlign:'middle'}}/> &nbsp;&nbsp; <strong>Bike Infastructure</strong>
        </ CardContent>
         <div id={'cardmap-'+this.props.data.id} className='cardmap'></div>
         <CardContent>
           <Typography component="p">
             {this.props.data.line_comment}
           </Typography>
         </CardContent>
     </Card>
   );
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
    var self = this;
    if(this.props.mode === 'map'){
      return (" ");
    }
    else{
      var lines = this.props.data.reverse().map(function(item) {
        return (
          <div key={item.id} style={{width:'300px', flex:'1 auto', margin:'8px'}}>{self.renderMapCard(item)}</div>
        );
      });
      return (
          <div id='cards' style={{display:'flex', flexFlow:'row wrap', padding:'8px'}}>
            {lines}
          </div>
      );
    }
  }

}
export default MainDisplay;
