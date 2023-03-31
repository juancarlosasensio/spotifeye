const fetch = require('node-fetch');
const processErrorResponse = require('../utils/processErrorResponse.js');
const { filterEmptyURL, sortByDate } = require('../utils/hnDataFilters');


let token = {
  'value': '',
  'issued_at': ''
}

const getArtist = async (req, res) => {
  const { query } = req.params;
  let currentToken = token.value;
  console.log("You've hit /api/spotify/artist with query: ", query)
  
  try {
    const URL = `https://api.spotify.com/v1/search?query=${encodeURIComponent(query)}&type=artist&tag:hipster`
    console.log('This is the URL, lads', URL)

    let response = await getSpotifySearch(URL, currentToken)
    let data = await response.json();

    
    //TODO: find a better way to handle retries? 
    // https://markmichon.com/automatic-retries-with-fetch
    while (data?.error) {
      if (data.error.status === 401) {
        token = getSpotifyAccessToken();
        response = await getSpotifySearch(URL, currentToken)
        data = await response.json();
      }
    }

    res.status(200).json(data.artists)
  } catch (error) {  
    let errMessage = `${error}`;
    console.log("There was an error", errMessage);
    processErrorResponse(res, 500, errMessage);  
  }
}

// Can I "save" the last token (or time of last token) between calls to Spotify using closure?
const getSpotifySearch = async (url, token) => {  
  try {
    const response = await fetch(URL, {
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
const getSpotifyAccessToken = async() => {
  try {
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method : 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `grant_type=client_credentials&client_id=${process.env.SPOTIFY_CLIENT_ID}&client_secret=${process.env.SPOTIFY_CLIENT_SECRET}`
    });
    
    const token = await tokenResponse.json().access_token;
    return token
  } catch (error) {
    throw new Error(`${error.message}`);
  }  
}

const getArticlesByQuery = async (req, res) => {
  const { query } = req.params
  console.log("You've hit /api/hackerNewsTest with query: ", query)
  try { 
    const URL = `https://hn.algolia.com/api/v1/search?query=${query}`;
    const response = await fetch(URL, {
      host: 'hn.algolia.com',
      port: process.env.PORT || 8081,
      path: `/api/v1/search?query=${query}`,
      method : 'GET'
    });
    const data = await response.json();
    const articles = data.hits;

    const filteredArticles = articles.filter(filterEmptyURL);
    filteredArticles.sort(sortByDate)

    res.status(200).json(filteredArticles);

  } catch (err) {
    let errMessage = `${err}`;
    processErrorResponse(res, 500, errMessage); 
  }
}

module.exports = {
  getArtist
};