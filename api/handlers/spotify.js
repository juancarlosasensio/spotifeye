const fetch = require('node-fetch');
const processErrorResponse = require('../utils/processErrorResponse.js');

const getArtist = async (req, res) => {
  const { query } = req.params;
  let response;
  let data;
  console.log("You've hit /api/spotify/artist with query: ", query)
  
  const URL = `https://api.spotify.com/v1/search?query=${encodeURIComponent(query)}&type=artist&tag:hipster`;
  // https://stackoverflow.com/a/10185427
  const tokenAbsoluteURL = req.protocol + '://' + req.get('host') + '/api/spotify/getToken';

  //making fetch call with relative path: https://stackoverflow.com/a/36369553
  try {
      let tokenResponse = await fetch(tokenAbsoluteURL);
      let token = await tokenResponse.json();
      // console.log("logging from getArtist handler: ", token)
      response = await fetch(URL, {
        headers: {
            "Authorization": `Bearer ${token}`
          },
      });
      data = await response.json();

    //TODO: find a better way to handle retries? 
    // https://markmichon.com/automatic-retries-with-fetch
    // if (data?.error) {
    //   // console.log("There was an error (1st try): ", data.error.message);
    //   let tokenResponse = await fetch(tokenAbsoluteURL);
    //   let token = tokenResponse.json();
    //   response = await fetch(URL, {
    //     headers: {
    //         "Authorization": `Bearer ${token}`
    //       },
    //   });
    //   data = await response.json(); 
    // }
      
    res.status(200).json(data.artists);

    } catch (error) {  
      let errMessage = `${error}`;
      console.log("There was an error 2nd try", errMessage);
      processErrorResponse(res, 500, errMessage);  
  }
}

// Can I "save" the last token (or time of last token) between calls to Spotify using closure?
const getSpotifySearch = async (url, token) => {
  // console.log("logging from getSpotifySearch...", token)  
  try {
    const response = await fetch(url, {
      headers: {
          "Authorization": `Bearer  ${token}`
        },
      });
    return response
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

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
    res.setHeader('Cache-Control','max-age=0, s-max-age=3600');
    res.status(200).json(tokenData.access_token);
  } catch (error) {
    res.status(500).send(error.message);
  }  
}

// const getArticlesByQuery = async (req, res) => {
//   const { query } = req.params
//   console.log("You've hit /api/hackerNewsTest with query: ", query)
//   try { 
//     const URL = `https://hn.algolia.com/api/v1/search?query=${query}`;
//     const response = await fetch(URL, {
//       host: 'hn.algolia.com',
//       port: process.env.PORT || 8081,
//       path: `/api/v1/search?query=${query}`,
//       method : 'GET'
//     });
//     const data = await response.json();
//     const articles = data.hits;

//     const filteredArticles = articles.filter(filterEmptyURL);
//     filteredArticles.sort(sortByDate)

//     res.status(200).json(filteredArticles);

//   } catch (err) {
//     let errMessage = `${err}`;
//     processErrorResponse(res, 500, errMessage); 
//   }
// }

module.exports = {
  getArtist,
  getToken
};