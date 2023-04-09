import React, { useState } from "react";
import { useSpotify } from "./hooks/useSpotify";
import GetTracksBtn from "./GetTracksBtn";
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
  const { status, data, error } = useSpotify(query, 'artists', fetchOptions);

  const [trackData, setTrackData] = useState([]);

  const handleSearchSubmit = e => {
    e.preventDefault();

    const search = e.target.search.value;
    console.log(search)
    if (search) {
      setQuery(search);
      e.target.search.value = "";
    }
  };


    
  // let invalidTracks = []
  
  // function containsArtist(artist) {
  //   return function(track) {
  //     let containsCurrentArtist = false;
  //       for (let i = 0; i < track.artists.length; i++) {
  //         if (track.artists[i].name.toLowerCase().trim() === artist.toLowerCase().trim()) {
  //           containsCurrentArtist = true;
  //           break;
  //         } else {
  //           invalidTracks.push(track);
  //           continue;
  //         }  
  //       }
  //       return containsCurrentArtist;
  //   }
  // }

  const handleGetTracksBtnClick = async (e) => {
    e.preventDefault();

    const artistName = e.target.getAttribute('data-artist-name');
    const res = await fetch(`/api/spotify/search/tracks/${encodeURIComponent(artistName)}`, requestOptions)
    const data = await res.json();

    console.log("logging data from click event handler", data)
    console.log("logging data.length from click event handler", data.length)
    // const filteredTracks = data.items.filter(containsArtist(artistName))

    // console.log("filteredTracks.length === data.items.length??" , filteredTracks.length === data.items.length)
    // console.log("these are the invalidTracks", invalidTracks)
    setTrackData(data)
  };

  return (
    <div className="App">
      <header> Spotify Search </header>
      <form className="Form" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          autoFocus
          autoComplete="off"
          name="search"
          placeholder="Search Spotify"
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
                <div>
                  {/* <GetTracksBtn artist={artist.name} /> */}
                  <button 
                    data-artist-name={artist.name}
                    onClick={handleGetTracksBtnClick}
                  >
                    See tracks
                  </button>
                  {trackData.length < 1 && <p>No track data yet...</p>}
                  <ul>
                    {trackData.map((track, i) => (
                      <li key={`${i}-${track.name}`}>{i}. {track.name} by {track.artists.reduce((accumulator, artistObj) => (
          accumulator + ', ' + artistObj.name
      ), '')}</li>
                    ))}
                  </ul>
                </div>
              </div>              
            ))}
          </>
        )}
      </main>
    </div>
  );
};

export default App;