import React, { useState } from "react";
import { useSpotify } from "./hooks/useSpotify";
import "./App.css";

const App = () => {
  // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#supplying_request_options
  const requestOptions = {
    headers: {
      'Authorization': `${process.env.REACT_APP_AUTH_HEADER}`, 
      'Content-Type': 'application/json'
    }  
  };
  const [query, setQuery] = useState("");
  // Avoids infinite loop cause by resetting requestOptions value on every re-render. We don't want fetchOptions to change.
  const [fetchOptions, ] = useState(requestOptions);
  const { status, data, error } = useSpotify(query, fetchOptions);

  const handleSubmit = e => {
    e.preventDefault();

    const search = e.target.search.value;
    console.log(search)
    if (search) {
      setQuery(search);
      e.target.search.value = "";
    }
  };

  return (
    <div className="App">
      <header> Hackernews Search </header>
      <form className="Form" onSubmit={handleSubmit}>
        <input
          type="text"
          autoFocus
          autoComplete="off"
          name="search"
          placeholder="Search Hackernews"
        />
        <button> Search </button>
      </form>
      <main>
        {status === "idle" && (
          <div> Let's get started by searching for an article! </div>
        )}
        {status === "error" && <div>{error}</div>}
        {status === "fetching" && <div className="loading" />}
        {status === "fetched" && (
          <>
            <div>Showing results for: <em>{query}</em></div>
            {data.items.length < 1 && <div> No artists found!</div>}
            {data.items.map(artist => (
              <div className="article" key={artist.id}>
                <a target="_blank" href={artist.external_urls.spotify} rel="noopener noreferrer">
                  {artist.name}
                </a>{" "}
              </div>              
            ))}
          </>
        )}
      </main>
    </div>
  );
};

export default App;