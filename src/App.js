import React from "react";
import Protected from "./Protected";
import Public from "./Public";
import "./App.css";
import netlifyIdentity from "netlify-identity-widget";

import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter,
} from "react-router-dom";

console.log(netlifyIdentity);

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
const netlifyAuth = {
  isAuthenticated: false,
  user: null,
  //this method was not part of the netlify example, but it checks if the user is logged in on page load
  //TODO: noget med refresh token
  init() {
    netlifyIdentity.on("init", (user) => {
      this.isAuthenticated = true;
      this.user = user;
    });
  },
  authenticate(callback) {
    this.isAuthenticated = true;
    netlifyIdentity.open();
    netlifyIdentity.on("login", (user) => {
      this.user = user;
      callback(user);
    });
  },
  signout(callback) {
    this.isAuthenticated = false;
    netlifyIdentity.logout();
    netlifyIdentity.on("logout", () => {
      this.user = null;
      callback();
    });
  },
};
//call the added init function
netlifyAuth.init();
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

function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) =>
        netlifyAuth.isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
}

class Login extends React.Component {
  state = { redirectToReferrer: false };

  login = () => {
    netlifyAuth.authenticate(() => {
      this.setState({ redirectToReferrer: true });
    });
  };

  render() {
    let { from } = this.props.location.state || { from: { pathname: "/" } };
    let { redirectToReferrer } = this.state;

    if (redirectToReferrer) return <Redirect to={from} />;

    return (
      <div>
        <p>You must log in to view the page at {from.pathname}</p>
        <button onClick={this.login}>Log in</button>
      </div>
    );
  }
}
export default App;
