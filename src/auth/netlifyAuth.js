import netlifyIdentity from "netlify-identity-widget";
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

export default netlifyAuth;
