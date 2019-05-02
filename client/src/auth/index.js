export const signup = (user) =>{
    console.log(user);
    return fetch("/api/signup",{
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(user)
    })
    .then(response => {
      return response.json()
    })
    .catch(err => console.log(err))
};

export const signin = (user) =>{
  return fetch("/api/signin",{
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(user)
  })
  .then(response => {
    return response.json()
  })
  .catch(err => console.log(err))
};

export const authenticate = (jwt, next) => {
    if(typeof window !== "undefined"){
      localStorage.setItem("jwt", JSON.stringify(jwt));
      next();
    }
  }

  export const logout = (next) => {
    if(typeof window !== 'undefined'){
      localStorage.removeItem("jwt");
    }
    next();
    return fetch("/signout", {
      method: "GET"
    })
    .then(response => {
      console.log('signout', response)
      return response.json();
    })
    .catch(err => console.log(err));
  }

  export const isAuthenticated = () => {
    if(typeof window == "undefined"){
      return false
    }
    if(localStorage.getItem('jwt')){
      return JSON.parse(localStorage.getItem('jwt'))
    } else{
      return false
    }
  }

  export const isMod = () => {
    if(typeof window == "undefined"){
      return false
    }
    if(localStorage.getItem('jwt')){
      let user = JSON.parse(localStorage.getItem('jwt')).user;
      if(user.role === 'admin' || user.role === 'mod'){
        return JSON.parse(localStorage.getItem('jwt'));
      }
      else{
        return false
      }    
    } else{
      return false
    }
  }
