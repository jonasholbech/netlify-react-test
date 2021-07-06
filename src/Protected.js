import netlifyIdentity from "netlify-identity-widget";
import useFetch from "./hooks/useFetch";
export default function Protected() {
  const user = netlifyIdentity.currentUser();
  //console.log({ user });
  const { data, loading, error } = useFetch("/api/firstdbcall");
  return (
    <div>
      <h3>Protected Page</h3>
      You are logged in as <b>{user.email}</b>
      <section className="restaurants">
        <header className="App-header">
          {data &&
            data.map((rest) => {
              return <p key={rest._id}>{rest.name}</p>;
            })}

          <p>{loading && "Loading"}</p>
          <p>{error && JSON.stringify(error, null, 2)}</p>
        </header>
      </section>
    </div>
  );
}
