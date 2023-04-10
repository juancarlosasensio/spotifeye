const fetch = require('node-fetch');
const processErrorResponse = require('../utils/processErrorResponse.js');
const spotifyUtils = require('../utils/spotifyUtils');
const {
  containsArtist,
  removeDuplicates
} = spotifyUtils;

const getArtists = async (req, res) => {
  console.log("logging from getArtists, req.params and req.query", req.params, req.query);
  const { query } = req.params;
  
  if (!query) { res.status(204) };
  
  let spotifyResponse;
  let spotifyData;

  console.log("You've hit /api/spotify/search/artists with query: ", query)
  const URL = `https://api.spotify.com/v1/search?query=${encodeURIComponent(query)}&type=artist`;
  // https://stackoverflow.com/a/10185427
  const tokenAbsoluteURL = req.protocol + '://' + req.get('host') + '/api/spotify/getToken';

  //making fetch call with relative path: https://stackoverflow.com/a/36369553
  try {
      let tokenResponse = await fetch(tokenAbsoluteURL);
      let token = await tokenResponse.json();
      // console.log("logging from getArtists handler: ", token)
      spotifyResponse = await fetch(URL, {
        headers: {
            "Authorization": `Bearer ${token}`
          },
      });
      spotifyData = await spotifyResponse.json();
      res.status(200).json(spotifyData.artists);

    } catch (error) {  
      let errMessage = `${error}`;
      console.log("There was an error 2nd try", errMessage);
      processErrorResponse(res, 500, errMessage);  
  }
}

// Need to figure out how to get tracks for a particular artist
// Or how to filter tracks by a given artist from a tracks response
const getTracks = async (req, res) => {
  console.log("logging from getTracks MY LAD, req.params and req.query", req.params, req.query);
  const { query } = req.params;
  
  if (!query) { res.status(204) };
  
  let spotifyResponse;
  let spotifyData;

  console.log("You've hit /api/spotify/search/tracks with query: ", query)
  
  // Spotify doesn't expose an endpoint to search for tracks by a specific artist
  // So need to figure out how to get tracks for a given artist: https://stackoverflow.com/questions/41110986/searching-in-an-artists-tracks-spotify-apis  
  // https://api.spotify.com/v1/search?q=track:"' + song + '"%20artist:"' + artist + '"&type=track&limit=10
  const URL = `https://api.spotify.com/v1/search?query=${encodeURIComponent(query)}&type=track&limit=50`;
  // https://stackoverflow.com/a/10185427
  const tokenAbsoluteURL = req.protocol + '://' + req.get('host') + '/api/spotify/getToken';

  // Keys = track.name, and values = str of comma-separated track.artists
  const tracksAndArtistsCache = {}; 

  //making fetch call with relative path: https://stackoverflow.com/a/36369553
  try {
      let tokenResponse = await fetch(tokenAbsoluteURL);
      let token = await tokenResponse.json();
      // console.log("logging from getArtists handler: ", token)
      spotifyResponse = await fetch(URL, {
        headers: {
            "Authorization": `Bearer ${token}`
          },
      });
      spotifyData = await spotifyResponse.json();

      const uniqueTracks = spotifyData.tracks.items.filter(removeDuplicates(tracksAndArtistsCache));
      const filteredTracks = uniqueTracks.filter(containsArtist(query));
      
      /* 
      // Good for debugging:
        const duplicatedTracks = Object.keys(tracksAndArtistsCache);
        console.log('LOGGING NAMES OF DUPLICATED TRACKS')
        duplicatedTracks.forEach(trackName => console.log(`${trackName} by ${tracksAndArtistsCache[trackName]}`));
      */

      res.status(200).json(filteredTracks);

    } catch (error) {  
      let errMessage = `${error}`;
      console.log("There was an error on 2nd try", errMessage);
      processErrorResponse(res, 500, errMessage);  
  }
}

const getToken = async (req, res) => {
  try {
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
      throw new Error("No Spotify credentials provided"); 
    }
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method : 'POST',
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=client_credentials&client_id=${process.env.SPOTIFY_CLIENT_ID}&client_secret=${process.env.SPOTIFY_CLIENT_SECRET}`
    });
    const tokenData = await tokenResponse.json();
    // https://vercel.com/docs/concepts/functions/serverless-functions/edge-caching#:~:text=header.-,Request%20must%20not%20contain%20the,header.,-Request%20must%20not
    res.setHeader('Cache-Control','max-age=0, s-maxage=3600');
    res.status(200).json(tokenData.access_token);
  } catch (error) {
    res.status(500).send(error.message);
  }  
}

module.exports = {
  getArtists,
  getTracks,
  getToken
};