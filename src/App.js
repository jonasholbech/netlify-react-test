import "./App.css";
import useFetch from "./hooks/useFetch";
/*import { basic } from "./helpers/defaults";*/
function App() {
  const { data, loading, error } = useFetch("/api/simple");
  return (
    <div className="App">
      <header className="App-header">
        <p>{data && data.message}</p>
        <p>{loading && "Loading"}</p>
        <p>{error && error.message}</p>
      </header>
    </div>
  );
}

export default App;
