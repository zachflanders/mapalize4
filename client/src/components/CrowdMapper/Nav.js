import React from 'react';
import {Link} from 'react-router-dom'

//Material-ui imports
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import EditIcon from '@material-ui/icons/Edit';
import FireIcon from '@material-ui/icons/Whatshot';
import BikeIcon from '@material-ui/icons/DirectionsBike';
import WalkIcon from '@material-ui/icons/DirectionsWalk';

import MenuIcon from '@material-ui/icons/Menu';

const Nav = (props) =>{
    return(
        <AppBar position="fixed" style={{zIndex: 1202, flexWrap:'wrap', width:'100%', maxWidth: '100%'}}>
            <Toolbar style={{flexWrap:'wrap', maxWidth: '100%'}} id='toolbar'>
              <Typography variant="h6" color="inherit" style={{flexGrow:2,  maxWidth: '100%'}} noWrap >
              <IconButton
                onClick = {props.toggleDrawer(true)}
                id='menuButton'
                color="inherit"
                aria-label="Menu"
                style={{marginLeft: -12, marginRight: 20}}
              >
                <MenuIcon />
              </IconButton>
                <WalkIcon style={{verticalAlign:'middle', marginBottom:'5px', height:'32px'}} />  
                <BikeIcon style={{verticalAlign:'middle', marginBottom:'5px', height:'32px'}} />
                &nbsp;&nbsp;{props.title}
              </Typography>
              <Tabs value={props.view} className='tabContainer' onChange = {props.switchView} variant='fullWidth' id='menuTabs'>
                <Tab label={<span><EditIcon style={{verticalAlign:'middle',top:'0px'}}/>&nbsp;&nbsp; Input</span>} style={{flexGrow: 1}} className='tab' />
                <Tab id='resultsTab' label={<span><FireIcon style={{verticalAlign:'middle'}}/>&nbsp;&nbsp; Results</span>} style={{flexGrow: 1}} />
              </Tabs>
            </Toolbar>
          </AppBar>
    );
}

export default Nav;