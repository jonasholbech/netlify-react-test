import { useState, useEffect } from "react";

export default function useFetch(url, options = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //how do i use the passed down error? console.log res i første then?
  useEffect(() => {
    console.log("re-render");
    setLoading(true);
    setData(null);
    setError(null);
    fetch(url, options)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Ressource not found");
          }
          throw new Error("Request failed");
        }
        return res.json();
      })
      .then((res) => {
        setLoading(false);
        setError(null);
        setData(res);
      })
      .catch((err) => {
        setLoading(false);
        setError(err.message);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);
  return { data, setData, loading, error };
}
