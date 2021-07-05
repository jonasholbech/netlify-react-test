import "./App.css";
import { useEffect, useState } from "react";
function App() {
  const [data, setData] = useState([]);
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
        {data.map((el) => {
          return <p>{el.name}</p>;
        })}
      </header>
    </div>
  );
}

export default App;
