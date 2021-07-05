# steps

1. `npx create-react-app projectname`
2. `npm install netlify-cli`
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

7. add `"local-start": "netlify dev"` to scripts in package.json
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

11. Run your dev server: `npm run local-start`
