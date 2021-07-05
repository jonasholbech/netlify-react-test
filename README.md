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
   - `npx netlify env:set VAR_NAME value`
5. use the vars in `functions/`:

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

## Netlify identity

## Routing and protected paths
