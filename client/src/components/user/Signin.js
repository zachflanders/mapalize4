import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Snackbar from '@material-ui/core/Snackbar';
import {Link, Redirect} from 'react-router-dom'
import {signin, authenticate} from '../auth'
import ReCAPTCHA from "react-google-recaptcha";
import Nav from '../Nav';




const styles = theme => ({

  textField: {
    width: '100%',
    marginBottom:'16px'
  }
});

class Signin extends Component {
  constructor(){
    super()
    this.state = {
      email: '',
      password:'',
      error: '',
      redirectToReferer: false,
      loading: false,
      recaptcha: false
    }
  }

  handleChange = (name) => (event) => {
    this.setState({error:''});
    this.setState({[name]: event.target.value})
  };

  clickSubmit = event => {
    event.preventDefault();
    this.setState({loading: true});
    const {name, email, password, recaptcha} = this.state;
    const user = {
      name,
      email,
      password,
      recaptcha
    };
    signin(user)
    .then(data =>{
      if(data.error){
        this.setState({error: data.error, loading: false})
      }
      else{
        //authenticate
        authenticate(data, ()=>{
          this.setState({redirectToReferer: true})
        })
        //redirect
      }
    });

  };



  signinForm = (email, password, classes) => (
    <form style={{textAlign:'center'}}>
      <TextField
        id="email"
        className={classes.textField}
        label="Email"
        type='email'
        onChange={this.handleChange("email")}
        value={email}
        />
      <TextField
        id="password"
        className={classes.textField}
        label="Password"
        type='password'
        onChange={this.handleChange("password")}
        value={password}
        />
    <Button
      onClick={this.clickSubmit}
      variant='contained'
      color='primary'>
        Login
    </Button>
    </form>
  )

  render() {
    const { classes } = this.props;
    const {name, email, password, error, redirectToReferer, loading} = this.state;
    if(redirectToReferer){
      return <Redirect to='/' />
    }
    return(
      <div>
        <Nav />
        <div style={{marginTop:'84px'}}>

        <Paper className='centered padded' style={{width:'350px'}}>
          <Typography variant="h5" component="h2" style={{textAlign:'center'}}>Login</Typography>
          {loading ? <div style={{textAlign:'center'}}>Loading...</div> : ""}
          {this.signinForm(email, password, classes)}
          <br />
          <Typography variant='caption' color='textSecondary' style={{textAlign:'center'}}>Don't have an account?  <Link to='/signup' style={{color:"rgba(0, 0, 0, 0.54)"}}>Create</Link></Typography>
        </Paper>
        <Snackbar
          open={this.state.error}
          message={this.state.error}
        />
        </div>
      </div>
    );
  }
  onloadCallback() {
    console.log("grecaptcha is ready!");
  };
  componentDidMount(){
    this.onloadCallback()
  }
}
Signin.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Signin);
