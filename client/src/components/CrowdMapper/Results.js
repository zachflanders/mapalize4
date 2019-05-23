import React from 'react';
import MainDisplay from './main.js';



class Results extends React.Component{
  constructor(props) {
    super(props);
    this.state = {};
  }
  render(){
    return(
      <div>
        <MainDisplay
          mode={this.props.mode}
          view={this.props.view}
          data={this.props.featureData}
          layers = {this.props.features}
          cardSortState = {this.props.cardSortState}
        />
      </div>
    )
  }


  componentDidMount() {
    const {map, resultsLayerArray, layerArray, cancelEdit, overlay, resultsOverlay, select, hover, getResults, clusterSelectClick} = this.props;
    this.props.features.map(function(item, count){
      console.log(item);
      if(item.viewResults === true){
        return (
          map.addLayer(resultsLayerArray[count]),
          map.removeLayer(layerArray[count]),
          cancelEdit(count)
        )
      }
      else{
        return (
          map.removeLayer(layerArray[count]),
          cancelEdit(count)
        )
      }
    });
    map.removeOverlay(overlay);
    map.addOverlay(resultsOverlay);
    map.removeInteraction(select);
    hover.forEach((item)=>{
      map.addInteraction(item);
    })
    getResults();
    if(clusterSelectClick !== null){
      map.addInteraction(clusterSelectClick);
    }
  }
}

export default Results;
