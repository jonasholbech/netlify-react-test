# steps

1. `npx create-react-app projectname`
2. `yarn add netlify-cli --dev`
3. `push to github`
4. `mkdir functions`
5. `touch netlify.toml`
6. add the following:

```
[build]
  functions = "functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

7. add `"local-start": "netlify dev"` to scripts in `package.json`
8. `npx netlify init`
9. `touch functions/simple.js`
10. add the following:

```
exports.handler = async function (event, context) {
  console.log(event);
  console.log(context);
  return {
    statusCode: 200,
    body: JSON.stringify({message: "And so it begins"}),
  };
};
```

11. Run your dev server: `yarn local-start`

## Add ENV vars

1. Add `.env` to `.gitignore`
2. Not needed unless you need it elsewhere, Netlify (or CRA) does it for us: `npm install dotenv --save-dev`
3. Add your variables to `.env`
4. "mirror" the variables to Netlify using either of these:
   - through the GUI (site Settings => Build & Deploy => Environment)
   - `npx netlify env:set VAR_NAME remote value`
5. use the vars in `functions/`:
6. If changing a variable, I think you need to trigger a new deploy

```js
require("dotenv").config();
exports.handler = async function (event, context) {
  const myVar = process.env.VAR_NAME;
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "And so it begins " + myVar }),
  };
};
```

## Netlify identity (external providers)

Not fully tested / proven. Note to self: RTFM
In Dev mode / localhost, authenticating through external providers redirect you to the live site. You can (for now?) only use email/password auth

1. `yarn add netlify-identity-widget`
2. Go to netlify and enable identity
3. Bootstrap the identity widget (in `index.js`)

```js
import netlifyIdentity from "netlify-identity-widget";

window.netlifyIdentity = netlifyIdentity;
// You must run this once before trying to interact with the widget
netlifyIdentity.init();
```

4. Turn on any External Providers you need
5. In `index.js` open the identity widget and set the url of you site, add this line: `netlifyIdentity.open();`
6. Once done, delete the line
7. Install React Router: `yarn add react-router-dom`
8. Ready to blindly copy/paste?
9. `App.js`

```js
import Protected from "./Protected";
import Public from "./Public";
import netlifyIdentity from "netlify-identity-widget";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter,
} from "react-router-dom";

// copied straight from https://reacttraining.com/react-router/web/example/auth-workflow
////////////////////////////////////////////////////////////
// 1. Click the public page
// 2. Click the protected page
// 3. Log in
// 4. Click the back button, note the URL each time

function AuthExample() {
  return (
    <Router>
      <div>
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

const netlifyAuth = {
  isAuthenticated: false,
  user: null,
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
export default AuthExample;
```

10. Create `Protected.js` and add

```js
import netlifyIdentity from "netlify-identity-widget";
export default function Protected() {
  const user = netlifyIdentity.currentUser();
  console.log({ user });
  return (
    <div>
      <h3>Protected Page</h3>
      You are logged in as <b>{user.email}</b>
    </div>
  );
}
```

11. Create `Public.js` and add

```js
export default function Public() {
  return <h3>Public</h3>;
}
```

## Routing and protected paths
