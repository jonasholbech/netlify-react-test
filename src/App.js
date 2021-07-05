import "./App.css";
import { useEffect, useState } from "react";
function App() {
  const [data, setData] = useState({});
  useEffect(() => {
    async function getData() {
      const res = await fetch("/api/simple");
      setData(await res.json());
    }
    getData();
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <p>{data.message}</p>
      </header>
    </div>
  );
}

export default App;
