import React from 'react';
import {Route, Switch} from 'react-router-dom';
import MainApp from './components/CrowdMapper';
import Signup from './components/user/Signup';
import Signin from './components/user/Signin';
import Moderate from './components/feature/Moderate';


const MainRouter = () => (
  <div className="App">
    <Switch>
      <Route exact path='/signup' component={Signup}></Route>
      <Route exact path='/login' component={Signin}></Route>
      <Route exact path='/moderate/:featureId' component={Moderate}></Route>

      <Route path='/' component={MainApp}></Route>
    </Switch>
  </div>
)

export default MainRouter;
