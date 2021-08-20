# TODO:

- https://www.mongodb.com/community/forums/t/node-js-returnnewdocument-true-not-working/14013
  - db calls looks cleaner (first example)
  - this one too https://dev.to/moshe/implementing-access-control-with-netlify-identity-and-netlify-functions-3jpj
- Check auth for multiple users
- split db calls from Protected into module
-
- lazy load components
- add database
- efter lang itds ingenting siger den signed in men request failed, så noget med refresh token?
  - sign out siger: Cookie “nf_jwt” has been rejected because it is already expired.
  - Det her kunne være noget https://dev.to/moshe/implementing-access-control-with-netlify-identity-and-netlify-functions-3jpj
  - skal jeg køre med `getToken`?
- når alt virker, luk identity pop up efter sign in
- database for each user?
  - Super easy, just point to a db that does not exist
  - like: `const db = client.db("note_db_"+something);`

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
import React from "react";
import netlifyAuth from "./auth/netlifyAuth";
import {
  BrowserRouter as Router,
  Route,
  Link,
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
```

10. `src/auth/netlifyAuth.js`

```js
import netlifyIdentity from "netlify-identity-widget";
const netlifyAuth = {
  isAuthenticated: false,
  user: null,
  //this method was not part of the netlify example, but it checks if the user is logged in on page load
  //TODO: noget med refresh token
  init() {
    netlifyIdentity.on("init", (user) => {
      this.isAuthenticated = true;
      //refresh token if needed (I think)
      user.jwt();
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

export default netlifyAuth;
```

11. `src/auth/Login.js`

```js
import React from "react";
import { Redirect } from "react-router-dom";

import netlifyAuth from "./netlifyAuth";
export default class Login extends React.Component {
  state = { redirectToReferrer: false };

  login = () => {
    netlifyAuth.authenticate(() => {
      this.setState({ redirectToReferrer: true });
    });
  };

  render() {
    let { from } = this.props.location.state || { from: { pathname: "/" } };
    let { redirectToReferrer } = this.state;

    if (redirectToReferrer || netlifyAuth.isAuthenticated) {
      return <Redirect to={from} />;
    }
    return (
      <div>
        <p>You must log in to view the page at {from.pathname}</p>
        <button onClick={this.login}>Log in</button>
      </div>
    );
  }
}
```

12. Create `src/auth/PrivateRoute.js` and add

```js
import { Route, Redirect } from "react-router-dom";
import netlifyAuth from "./netlifyAuth";

export default function PrivateRoute({ component: Component, ...rest }) {
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
```

13. Create `src/pages/Public.js` and add

```js
export default function Public() {
  return <h3>Public</h3>;
}
```

14. Create `src/pages/Protected.js` and add

```js
import netlifyIdentity from "netlify-identity-widget";
import useFetch from "../hooks/useFetch";

export default function Protected() {
  const user = netlifyIdentity.currentUser();
  console.log(user.user_metadata.full_name);
  return (
    <div>
      <h3>Protected Page</h3>
      You are logged in as <b>{user.email}</b>
      <section className="notes"></section>
    </div>
  );
}
```

15. Deploy you site and test the login. If you do not deploy, you can not confirm your email :-)
16. Any component that you pass through `PrivateRoute` will have access to a user object through something along the following

```js
import netlifyIdentity from "netlify-identity-widget";
export default function Test() {
  const user = netlifyIdentity.currentUser();
  console.log({ user });
  return (
    <p>
      You are logged in as <b>{user.email}</b>
    </p>
  );
}
```

## Identity serverless functions (like hooks)

We have three hooks (not React hooks) we can use when the user interacts with Netlify Identity:

https://docs.netlify.com/visitor-access/identity/registration-login/#trigger-serverless-functions-on-identity-events

### App Meta Data

## Add a database

### MongoDB Atlas

1. Go to https://mongodb.com and sign in/up
2. Create a new Project
3. Create a new cluster (I chose AWS/Frankfurt)
4. Click connect to cluster
5. Allow access from anywhere (We can not get the IP for Netlify)
6. Create a Database User
   - remember that password
7. Choose a connection method (I chose Connect your application)
8. Copy the connection string and add it to `.env` as MONGO_ATLAS_KEY or something
9. Replace the &lt;password&gt; with the password you chose
10. Replace the `myFirstDatabase` with then name of your database (i chose to create a database called `note_db`)
11. Copy the "Include full driver code example" and paste it in `functions/first-db-call.js`
12. Use the env variable instead of the connection string

```js
// functions/first-db-call.js
require("dotenv").config();
const { MongoClient } = require("mongodb");
exports.handler = async function (event, context) {
  //const { user } = context.clientContext;
  const uri = process.env.MONGO_ATLAS_KEY;
  const client = await MongoClient.connect(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  const db = client.db("note_db");
  const all = await db.collection("notes").find().toArray();
  client.close();
  return {
    statusCode: 200,
    body: JSON.stringify(all),
  };
};
```

12. In your cluster, click collections and then add a collection called `notes`
13. Create your first dataentry with the following fields

- author: String
- note: String
- created: Date
- updated: Date

14. install mongodb `yarn add mongodb`
15. Restart the dev server
16. Add the connection string to Netlify ENV: `npx netlify env:set MONGO_ATLAS_KEY <connectionString>`
17. I created a hook for fetching data, but you can just use vanilla fetch, create this file:

```js
//src/hooks/useFetch.js
import { useState, useEffect } from "react";

export default function useFetch(url, options = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("re-render");
    setLoading(true);
    setData(null);
    setError(null);
    fetch(url, options)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Ressource not found");
          }
          throw new Error("Request failed");
        }
        return res.json();
      })
      .then((res) => {
        setLoading(false);
        setError(null);
        setData(res);
      })
      .catch((err) => {
        setLoading(false);
        setError(err.message);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);
  return { data, setData, loading, error };
}
```

17. Verify that you can fetch data:

```js
//src/pages/Protected.js
import netlifyIdentity from "netlify-identity-widget";
import useFetch from "../hooks/useFetch";

export default function Protected() {
  const user = netlifyIdentity.currentUser();
  const { data, loading, error } = useFetch("/api/first-db-call");

  return (
    <div>
      <h3>Protected Page</h3>
      You are logged in as <b>{user.email}</b>
      <section className="notes">
        <header className="App-header">
          {data &&
            data.map((note) => {
              return (
                <article key={note._id}>
                  <p>{note.note}</p>
                </article>
              );
            })}

          <p>{loading && "Loading"}</p>
          <p>{error && JSON.stringify(error, null, 2)}</p>
        </header>
      </section>
    </div>
  );
}
```

### Passing authentication to serverless functions

The whole world can read our data through the `/api/first-db-call.js`. So, let's send along the user credentials and verify that the user is logged in

1. change the `useFetch` call in `src/Protected.js` to include the user

```js
//src/Protected.js
...
const user = netlifyIdentity.currentUser();
const bearer = "Bearer " + user.token.access_token;
const { data, loading, error } = useFetch("/api/first-db-call", {
headers: {
    Authorization: bearer,
    "Content-Type": "application/json",
},
});
...
```

2. In `functions/first-db-call.js` check if the user exists, if he doesn't, send back a 403. Let's also make sure we only get the users own notes

```js
//functions/first-db-call.js
require("dotenv").config();
const { MongoClient } = require("mongodb");
exports.handler = async function (event, context) {
  const { user } = context.clientContext;
  if (!user || !user.email) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: "Not authorized" }),
    };
  }
  const uri = process.env.MONGO_ATLAS_KEY;
  const client = await MongoClient.connect(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  const db = client.db("note_db");
  const all = await db
    .collection("notes")
    .find({ authorId: user.sub })
    .toArray();
  client.close();
  return {
    statusCode: 200,
    body: JSON.stringify(all),
  };
};
```

## CRUD

We've got Read covered already
Let's add a helper funtion to renew our token. Add this to `auth/netlifyAuth.js`

```js
export async function getToken() {
  const currentUser = netlifyIdentity.currentUser();
  if (!currentUser) {
    return "";
  }
  // fetchs new JWT token only if expired
  await currentUser.jwt();
  return currentUser.token.access_token;
}
```

### Create / Insert

1. A new endpoint:

```js
//functions/add-note.js
require("dotenv").config();
exports.handler = async function (event, context) {
  const { user } = context.clientContext;

  console.log(user);
  if (!user) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: "Not authorized" }),
    };
  }
  const MongoClient = require("mongodb").MongoClient;
  const uri = process.env.MONGO_ATLAS_KEY;
  const client = await MongoClient.connect(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  const db = client.db("note_db");
  const body = JSON.parse(event.body);
  const note = await db
    .collection("notes")
    .insertOne({
      author: user.user_metadata.full_name,
      authorId: user.sub,
      note: body.note,
      created: Date.now(),
      updated: Date.now(),
    })
    .then(({ ops }) => ops[0]);
  client.close();
  return {
    statusCode: 200,
    body: JSON.stringify(note),
  };
};
```

```js
//src/pages/Protected.js
import netlifyIdentity from "netlify-identity-widget";
import useFetch from "../hooks/useFetch";
import { getToken } from "../auth/netlifyAuth";

export default function Protected() {
  const user = netlifyIdentity.currentUser();
  console.log(user.user_metadata.full_name);
  const bearer = "Bearer " + user.token.access_token;
  const { data, setData, loading, error } = useFetch("/api/first-db-call", {
    headers: {
      Authorization: bearer,
      "Content-Type": "application/json",
    },
  });

  async function addNote() {
    const token = await getToken();
    const bearer = "Bearer " + token;
    const response = await fetch("/api/add-note", {
      method: "post",
      headers: {
        Authorization: bearer,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        note: "Lorem ipsum",
      }),
    });
    const data = await response.json();
    setData((oldData) => oldData.concat(data));
    console.log(data);
  }
  return (
    <div>
      <h3>Protected Page</h3>
      You are logged in as <b>{user.email}</b>
      <section className="notes">
        ...
        <button onClick={addNote}>Add Note</button>
      </section>
    </div>
  );
}
```

### Delete

1. First we need an endpoint that can delete notes

```js
//functions/delete-note.js
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;

exports.handler = async function (event, context) {
  const { user } = context.clientContext;
  if (!user || !user.email) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: "Not authorized" }),
    };
  }
  const MongoClient = require("mongodb").MongoClient;
  const uri = process.env.MONGO_ATLAS_KEY;
  const client = await MongoClient.connect(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  const db = client.db("note_db");
  const body = JSON.parse(event.body);
  const o_id = ObjectId(body._id);
  const all = await db
    .collection("notes")
    .deleteOne({ _id: o_id, authorId: user.sub });
  client.close();
  return {
    statusCode: 200,
    body: JSON.stringify(all),
  };
};
```

2. then we need to call the endpoint, passing an id

```js
//src/pages/Protected.js
import netlifyIdentity from "netlify-identity-widget";
import useFetch from "../hooks/useFetch";
import { getToken } from "../auth/netlifyAuth";

export default function Protected() {
  const user = netlifyIdentity.currentUser();
  console.log(user.user_metadata.full_name);
  const bearer = "Bearer " + user.token.access_token;
  const { data, setData, loading, error } = useFetch("/api/first-db-call", {
    headers: {
      Authorization: bearer,
      "Content-Type": "application/json",
    },
  });

  ...
  async function deleteNote(_id) {
    const token = await getToken();
    const bearer = "Bearer " + token;
    const response = await fetch("/api/delete-note", {
      method: "post",
      headers: {
        Authorization: bearer,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ _id }),
    });
    const data = await response.json();
    if (data.deletedCount > 0) {
      console.log(data);
      //update state
      setData((old) => old.filter((entry) => entry._id !== _id));
    } else {
      console.error("SOMETHING BAD HAPPENED");
    }
  }
  return (
    <div>
      <h3>Protected Page</h3>
      You are logged in as <b>{user.email}</b>
      <section className="notes">
        <header className="App-header">
          {data &&
            data.map((note) => {
              return (
                <article key={note._id}>
                  <p>{note.note}</p>
                  <button onClick={() => deleteNote(note._id)}>Delete</button>
                </article>
              );
            })}

          <p>{loading && "Loading"}</p>
          <p>{error && JSON.stringify(error, null, 2)}</p>
        </header>
        <button onClick={addNote}>Add Note</button>
      </section>
    </div>
  );
}

```

### Update

1. First we need an endpoint that can update notes

```js
//functions/update-note.js
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;

exports.handler = async function (event, context) {
  const { user } = context.clientContext;
  if (!user || !user.email) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: "Not authorized" }),
    };
  }
  const MongoClient = require("mongodb").MongoClient;
  const uri = process.env.MONGO_ATLAS_KEY;
  const client = await MongoClient.connect(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  const db = client.db("note_db");
  const body = JSON.parse(event.body);
  const o_id = ObjectId(body._id);
  console.log(body);
  const all = await db.collection("notes").findOneAndUpdate(
    { authorId: user.sub, _id: o_id },
    {
      $set: { note: body.note, updated: Date.now() },
    },
    { returnDocument: "after" }
  );
  client.close();
  return {
    statusCode: 200,
    body: JSON.stringify(all),
  };
};
```

2. then we need to call the endpoint, passing an id

```js
//src/pages/Protected.js
import netlifyIdentity from "netlify-identity-widget";
import useFetch from "../hooks/useFetch";
import { getToken } from "../auth/netlifyAuth";

export default function Protected() {
  const user = netlifyIdentity.currentUser();
  console.log(user.user_metadata.full_name);
  const bearer = "Bearer " + user.token.access_token;
  const { data, setData, loading, error } = useFetch("/api/first-db-call", {
    headers: {
      Authorization: bearer,
      "Content-Type": "application/json",
    },
  });

  ...
  async function updateNote(_id, body) {
    console.log("received:", _id, body);
    //const bearer = "Bearer " + user.token.access_token;
    const token = await getToken();
    const bearer = "Bearer " + token;
    const response = await fetch("/api/update-note", {
      method: "post",
      headers: {
        Authorization: bearer,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ _id, note: body }),
    });
    const data = await response.json();
    console.log(data);
    if (data.ok === 1) {
      console.log(data);
      //update state
      setData((old) =>
        old.map((entry) => {
          if (entry._id === _id) {
            return data.value;
          }
          return entry;
        })
      );
    } else {
      console.error("SOMETHING BAD HAPPENED");
    }
  }
  return (
    <div>
      <h3>Protected Page</h3>
      You are logged in as <b>{user.email}</b>
      <section className="notes">
        <header className="App-header">
          {data &&
            data.map((note) => {
              return (
                <article key={note._id}>
                  <p>{note.note}</p>
                  <button onClick={() => deleteNote(note._id)}>Delete</button>
                  <button onClick={() => updateNote(note._id, "test")}>
                    Update
                  </button>
                </article>
              );
            })}

          <p>{loading && "Loading"}</p>
          <p>{error && JSON.stringify(error, null, 2)}</p>
        </header>
        <button onClick={addNote}>Add Note</button>
      </section>
    </div>
  );
}
```

## Notes

- https://free-for.dev/#/?id=dbaas
- artiklen fra telefonen??

```

```
