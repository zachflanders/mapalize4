import React from 'react';
import {Route, Switch} from 'react-router-dom';
import MainApp from './components/CrowdMapper/MainApp.js';
import Results from './components/CrowdMapper/Results'
import Signup from './components/user/Signup';
import Signin from './components/user/Signin';
import Moderate from './components/Moderate/Moderate';


const MainRouter = () => (
  <div className="App">
    <Switch>
      <Route exact path='/signup' component={Signup}></Route>
      <Route exact path='/login' component={Signin}></Route>
      <Route exact path='/moderate/:featureId' component={Moderate}></Route>
      <Route exact path='/results'
        render = {(props) => <MainApp {...props} results={true} input={false} />}
      >
      </Route>
      <Route exact path='/input'
        render = {(props) => <MainApp {...props} results={false} input={true} />}
      >
      </Route>
      <Route path='/' render = {(props) => <MainApp {...props} results={false} input={true} />}></Route>
    </Switch>
  </div>
)

export default MainRouter;
