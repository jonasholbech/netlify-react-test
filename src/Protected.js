import netlifyIdentity from "netlify-identity-widget";
import useFetch from "./hooks/useFetch";
export default function Protected() {
  const user = netlifyIdentity.currentUser();
  console.log(user.user_metadata.full_name);
  const bearer = "Bearer " + user.token.access_token;
  const { data, loading, error } = useFetch("/api/first-db-call", {
    headers: {
      Authorization: bearer,
      "Content-Type": "application/json",
    },
  });

  async function addNote() {
    const bearer = "Bearer " + user.token.access_token;
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
    console.log(data);
  }
  async function deleteNote(_id) {
    const bearer = "Bearer " + user.token.access_token;
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
                <article>
                  <p key={note._id}>{note.note}</p>
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
