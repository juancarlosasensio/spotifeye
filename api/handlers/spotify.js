const fetch = require('node-fetch');
const processErrorResponse = require('../utils/processErrorResponse.js');


/*
  TODO: how could I use the same endpoint/handler to search for artists AND tracks??
  Returned JSON would still have a similar shape, maybe, like data.items, 
  but they will have different properties that we care about for each.

  Optional request params? One endpoint, multiple handlers?
*/
const getArtists = async (req, res) => {
  console.log("logging from getArtitsts, req.params and req.query", req.params, req.query);
  const { query, type } = req.params;
  
  if (!query) { res.status(204) };
  
  let spotifyResponse;
  let spotifyData;
  let resourceType = type ? type : 'artist'

  console.log("You've hit /api/spotify/search with query and type: ", query, type)
  const URL = `https://api.spotify.com/v1/search?query=${encodeURIComponent(query)}&type=${resourceType}`;
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

    //TODO: find a better way to handle retries? 
    // https://markmichon.com/automatic-retries-with-fetch
    // if (spotifyData?.error) {
    //   // console.log("There was an error (1st try): ", spotifyData.error.message);
    //   let tokenResponse = await fetch(tokenAbsoluteURL);
    //   let token = tokenResponse.json();
    //   response = await fetch(URL, {
    //     headers: {
    //         "Authorization": `Bearer ${token}`
    //       },
    //   });
    //   spotifyData = await response.json(); 
    // }


      
    res.status(200).json(spotifyData[`${resourceType}s`]);

    } catch (error) {  
      let errMessage = `${error}`;
      console.log("There was an error 2nd try", errMessage);
      processErrorResponse(res, 500, errMessage);  
  }
}

// const getArtist = async (req, res) => {
//   const { id } = req.params;
//   if (!query) { res.status(204) };
//   let spotifyResponse;
//   let spotifyData;
//   console.log("You've hit /api/spotify/artist with id: ", id)
  
//   const URL = `https://api.spotify.com/v1/artists/${encodeURIComponent(id)}`
//   // https://stackoverflow.com/a/10185427
//   const tokenAbsoluteURL = req.protocol + '://' + req.get('host') + '/api/spotify/getToken';

//   //making fetch call with relative path: https://stackoverflow.com/a/36369553
//   try {
//       let tokenResponse = await fetch(tokenAbsoluteURL);
//       let token = await tokenResponse.json();
//       // console.log("logging from getArtists handler: ", token)
//       spotifyResponse = await fetch(URL, {
//         headers: {
//             "Authorization": `Bearer ${token}`
//           },
//       });
//       spotifyData = await spotifyResponse.json();

//     //TODO: find a better way to handle retries? 
//     // https://markmichon.com/automatic-retries-with-fetch
//     // if (spotifyData?.error) {
//     //   // console.log("There was an error (1st try): ", spotifyData.error.message);
//     //   let tokenResponse = await fetch(tokenAbsoluteURL);
//     //   let token = tokenResponse.json();
//     //   response = await fetch(URL, {
//     //     headers: {
//     //         "Authorization": `Bearer ${token}`
//     //       },
//     //   });
//     //   spotifyData = await response.json(); 
//     // }
      
//     res.status(200).json(spotifyData.artist);

//     } catch (error) {  
//       let errMessage = `${error}`;
//       console.log("There was an error 2nd try", errMessage);
//       processErrorResponse(res, 500, errMessage);  
//   }
// }

  //TODO: um, this is a problem. https://developer.spotify.com/documentation/web-api/tutorials/getting-started#request-artist-data
  // Tokens are only valid for 1 hour :shrug

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
  getToken
};