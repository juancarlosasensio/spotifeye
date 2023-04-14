import { useState, useRef } from 'react';
// import { useSpotify } from "./hooks/useSpotify";

const GetTracksBtn = ({ artist }) => {
  const requestOptsRef = useRef({
    headers: {
      'Authorization': `${process.env.REACT_APP_AUTH_HEADER}`, 
      'Content-Type': 'application/json'
    }  
  });
  
  const [trackData, setTrackData] = useState([]);

  /* 
    TODO: review this idea of calling the useSpotify hook sans params/args. 
    I thought this could work to set initial values for status, data, error without triggering a 
    fetch() call. But the problem is that if I then wanted to set values for status, data, error
    after a person clicks handleGetTracksBtnClick, we'd be violating the use of hooks.

    So perhaps a hook is not the solution here, and I just need to revert to doing a 
    fetch call and useState...not very DRY but hey, sometimes it rains.

    https://stackoverflow.com/questions/63363524/how-do-i-set-state-from-within-a-fetch-in-reactjs
  */
  // const { status, data, error } = useSpotify();


  const handleGetTracksBtnClick = async (e) => {
    e.preventDefault();

    const artistName = e.target.getAttribute('data-artist-name');
    const res = await fetch(`/api/spotify/search/tracks/${encodeURIComponent(artistName)}`, requestOptsRef.current)
    const data = await res.json();

    setTrackData(data)
  };


  return (
    <>
      <button 
        data-artist-name={artist.name}
        aria-label={`See least popular tracks by ${artist.name}`}
        onClick={handleGetTracksBtnClick}
      >
        See tracks
      </button>
      {trackData.length < 1 && <p>No track data yet...</p>}
        <ul>
          {trackData.map((track, i) => (
            <li key={`${i}-${track.name}`}>{i}. <a href={track.external_urls.spotify}>{track.name}</a> by {track.artists.reduce((accumulator, artistObj) => (
            accumulator + ', ' + artistObj.name
            ), '')}
            , <em>popularity: {track?.popularity}</em>
            </li>
          ))}
        </ul>
    </>
  )
}

export default GetTracksBtn;