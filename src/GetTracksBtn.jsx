import { useState } from 'react';
import { useSpotify } from "./hooks/useSpotify";

const GetTracksBtn = ({artist}) => {
  const requestOptions = {
    headers: {
      'Authorization': `${process.env.REACT_APP_AUTH_HEADER}`, 
      'Content-Type': 'application/json'
    }  
  };
  const [fetchOptions, ] = useState(requestOptions);
  
  // TODO: figure out how to get an artists tracks? Spotify's api isn't really set up for that, 
  // but we do get the artist ID in App.jsx and can pass it as a prop to this component, and 
  // subsequently to this call to useSpotify
  const { query, setQuery } = useState(artist);

  /* 
    TODO: review this idea of calling the useSpotify hook sans params/args. 
    I thought it could work to set initial values for status, data, error without triggering a 
    fetch() call. But the problem is that if I then wanted to set values for status, data, error
    after a person clicks handleGetTracksBtnClick, we'd be violating the use of hooks.

    So perhaps a hook is not the solution here, and I just need to revert to doing a 
    fetch call and useState...not very DRY but hey, sometimes it rains.

    https://stackoverflow.com/questions/63363524/how-do-i-set-state-from-within-a-fetch-in-reactjs
  */
  const { status, data, error } = useSpotify();
  
  const handleGetTracksBtnClick = e => {
    e.preventDefault();
    setQuery(artist)
  };

  console.log(status, data, error)

  return (
    <>
    {status === "idle" && (
      <button onClick={handleGetTracksBtnClick}>Get Tracks</button>
    )}
    {status === "error" && <div>{error}</div>}
    {status === "fetching" && <div>loading tracks...</div>}
    {status === "fetched" && (
      <details>
        <summary>See tracks</summary>
        <ul>
          {data.items.map(track => (
            <li>{track['name']}</li>
          ))}
        </ul>
      </details>
    )}
  </>
  )
}

export default GetTracksBtn;