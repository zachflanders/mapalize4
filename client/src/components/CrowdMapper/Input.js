import React from 'react';



class Input extends React.Component{
  constructor(props) {
    super(props);
    this.state = {};
  }
  render(){
    return(
      <div>
        input
      </div>
    )
  }


  componentDidMount() {
    const {map, resultsLayerArray, layerArray, overlay, resultsOverlay, select, getInput, clusterSelectClick} = this.props;
    this.props.features.map(function(item, count){
      console.log(item);
      if(item.viewResults === true){
        return(
          map.removeLayer(resultsLayerArray[count])
          //map.addLayer(layerArray[count])
        )
      }
      else{
        return map.addLayer(layerArray[count]);
      }
    });
    map.addOverlay(overlay);
    //map.removeOverlay(resultsOverlay);
    map.addInteraction(select);
    if(clusterSelectClick !== null){
      map.removeInteraction(clusterSelectClick);
    }
    getInput();
  }
}

export default Input;
