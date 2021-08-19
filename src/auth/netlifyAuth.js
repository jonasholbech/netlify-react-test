import netlifyIdentity from "netlify-identity-widget";

export async function getToken() {
  const currentUser = netlifyIdentity.currentUser();
  if (!currentUser) {
    return "";
  }
  const token1 = currentUser.token.access_token;
  // fetchs new JWT token only if expired
  await currentUser.jwt();
  const token2 = currentUser.token.access_token;
  if (token1 !== token2) {
    console.log("updated token (expired)");
  }
  return currentUser.token.access_token;
}

const netlifyAuth = {
  isAuthenticated: false,
  user: null,
  //this method was not part of the netlify example, but it checks if the user is logged in on page load
  //TODO: noget med refresh token
  init() {
    netlifyIdentity.on("init", (user) => {
      console.log("netlifyauth init: ", { user });
      if (user) {
        this.isAuthenticated = true;
        //refresh token if needed (I think)
        user.jwt();
        console.log(user.token);
        this.user = user;
      }
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

export default netlifyAuth;
