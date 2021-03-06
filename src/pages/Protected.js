import netlifyIdentity from "netlify-identity-widget";
import useFetch from "../hooks/useFetch";
import { getToken } from "../auth/netlifyAuth";

export default function Protected() {
  const user = netlifyIdentity.currentUser();
  //console.log(user.user_metadata.full_name);
  //TODO: denne her kan ikke være async så jeg kan ikke bruge getToken
  //Men det gør ikke noget, den kaldes efter netlifyAuth.init
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
    //const bearer = "Bearer " + user.token.access_token;
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
  async function deleteNote(_id) {
    //const bearer = "Bearer " + user.token.access_token;
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
  async function updateNote(_id, body) {
    console.log("received:", _id, body);
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
