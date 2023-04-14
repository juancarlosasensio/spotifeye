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
  const URL = `https://api.spotify.com/v1/search?query=${encodeURIComponent(query)}&type=artist&limit=10`;
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
const getTracks = async (req, res) => { 
  const { query } = req.params;
  console.log("You've hit /api/spotify/search/tracks with query: ", query)
  
  if (!query) { res.status(204) };

  // Keys = track.name, and values = str of comma-separated track.artists
  const tracksAndArtistsCache = {};
  let allTracksResults = [];
  
  // https://stackoverflow.com/a/10185427
  const tokenAbsoluteURL = req.protocol + '://' + req.get('host') + '/api/spotify/getToken'; 

  try {
      let tokenResponse = await fetch(tokenAbsoluteURL); //fetch call w/relative path: https://stackoverflow.com/a/36369553
      let token = await tokenResponse.json();

      let response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        let data = await response.json();
        let tracks = data.tracks.items;

        console.log('first page has been fetched. There are this many tracks: ', tracks.length);
        allTracksResults = [...allTracksResults, ...tracks]    

        while (data.tracks.next) {
          response = await fetch(data.tracks.next, {
            headers: {
            Authorization: `Bearer ${token}`
          }
          });

          if (response.ok) {
            data = await response.json();
            tracks = data.tracks.items;
            allTracksResults = [...allTracksResults, ...tracks]
          }
        }
      } else {
        throw new Error('Failed to fetch first page of artist tracks');
      }
      const tracksByArtist = allTracksResults.filter(containsArtist(query));
      const uniqueTracksByArtist = tracksByArtist.filter(removeDuplicates(tracksAndArtistsCache))

      uniqueTracksByArtist.sort((a, b) => a.popularity - b.popularity);

      res.status(200).json(uniqueTracksByArtist.slice(0, 20));

    } catch (error) {  
      let errMessage = `${error}`;
      console.log(errMessage);
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

// const searchArtistTracks = async (artistName) => {
//   try {
//     // Encode the artist name for URL query
//     const encodedArtistName = encodeURIComponent(artistName);

//     // Initialize an empty array to store all the tracks
//     let allTracks = [];

//     // Make the initial fetch request to get the first page of tracks
//     let response = await fetch(`https://api.spotify.com/v1/search?q=${encodedArtistName}&type=track&limit=50`, {
//       headers: {
//         Authorization: `Bearer ${YOUR_ACCESS_TOKEN}` // Replace with your actual access token
//       }
//     });

//     if (response.ok) {
//       const data = await response.json();
//       const tracks = data.tracks.items;
//       allTracks = [...allTracks, ...tracks]; // Add the tracks to the array

//       // Check if there are more tracks, and fetch subsequent pages if needed
//       while (data.tracks.next) {
//         response = await fetch(data.tracks.next, { // Fetch the next page of tracks
//           headers: {
//             Authorization: `Bearer ${YOUR_ACCESS_TOKEN}` // Replace with your actual access token
//           }
//         });

//         if (response.ok) {
//           const data = await response.json();
//           const tracks = data.tracks.items;
//           allTracks = [...allTracks, ...tracks]; // Add the tracks to the array
//         } else {
//           // Handle error response
//           throw new Error('Failed to fetch artist tracks');
//         }
//       }

//       // Sort the tracks by popularity in ascending order
//       allTracks.sort((a, b) => a.popularity - b.popularity);

//       // Return the least popular tracks
//       return allTracks;
//     } else {
//       // Handle error response
//       throw new Error('Failed to fetch artist tracks');
//     }
//   } catch (error) {
//     console.error(error);
//   }
// };
// Note: As mentioned earlier, in the actual implementation, you will need to replace YOUR_ACCESS_TOKEN with your actual Spotify access token, which can be obtained through the Spotify Web API authorization process.




// jasensio@ufm.edu
// Write this function so that it uses a util function that gets an access token from Spotify and caches it for 1 hour 
// Sure! H