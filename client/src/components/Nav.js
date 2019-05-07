import React from 'react';
import {Link, withRouter} from 'react-router-dom'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import BikeIcon from '@material-ui/icons/DirectionsBike';



const styles = {
  root: {
    flexGrow: 1,
  },
  grow: {
    flexGrow: 1,
  }
};



class Nav extends React.Component {
  render(){
    const { classes, history } = this.props;
    return (
      <div className={classes.root}>
      <AppBar position="fixed" style={{zIndex: 1202, flexWrap:'wrap', width:'100%' }}>
        <Toolbar style={{flexWrap:'wrap'}} id='toolbar'>
          <Typography component={Link} to='/' variant="h6" color="inherit" style={{flexGrow:2, textDecoration:'none'}} >
            <BikeIcon style={{verticalAlign:'middle', marginBottom:'5px', height:'32px'}} />
            &nbsp;&nbsp;NorthKC Bike Plan
          </Typography>
        </Toolbar>
      </AppBar>
      </div>
    );
  }
}

Nav.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Nav));
