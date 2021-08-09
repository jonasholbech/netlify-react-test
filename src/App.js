import React from "react";
import netlifyIdentity from "netlify-identity-widget";
import netlifyAuth from "./helpers/netlifyAuth";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter,
} from "react-router-dom";

import PrivateRoute from "./auth/PrivateRoute";
import Login from "./auth/Login";
import Protected from "./pages/Protected";
import Public from "./pages/Public";

import "./App.css";
netlifyAuth.init();
// copied straight from https://reacttraining.com/react-router/web/example/auth-workflow
////////////////////////////////////////////////////////////
// 1. Click the public page
// 2. Click the protected page
// 3. Log in
// 4. Click the back button, note the URL each time

function App() {
  return (
    <Router>
      <div className="App-header">
        <h1>Netlify identity and much more</h1>
        <p>This is just a tutorial I made for myself</p>
        <p>
          You can see{" "}
          <a href="https://github.com/jonasholbech/netlify-react-test">
            the steps at GitHub
          </a>
        </p>
        <AuthButton />
        <ul>
          <li>
            <Link to="/public">Public Page</Link>
          </li>
          <li>
            <Link to="/protected">Protected Page</Link>
          </li>
        </ul>
        <Route path="/public" component={Public} />
        <Route path="/login" component={Login} />
        <PrivateRoute path="/protected" component={Protected} />
      </div>
    </Router>
  );
}

//TODO: expires: https://github.com/netlify/netlify-identity-widget#usage
//https://github.com/netlify/netlify-identity-widget/issues/142
//https://github.com/netlify/netlify-identity-widget/issues/358

/*
const currentUser = netlifyIdentity.currentUser();
if (currentUser) {
   currentUser.jwt().then(accessToken => {
      // fetch the content that requires the access token
   });
} else {
    // show login
}
*/

const AuthButton = withRouter(({ history }) =>
  netlifyAuth.isAuthenticated ? (
    <p>
      Welcome!{" "}
      <button
        onClick={() => {
          netlifyAuth.signout(() => history.push("/"));
        }}
      >
        Sign out
      </button>
    </p>
  ) : (
    <p>You are not logged in.</p>
  )
);

export default App;
