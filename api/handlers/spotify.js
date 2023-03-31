const fetch = require('node-fetch');
const processErrorResponse = require('../utils/processErrorResponse.js');
const { filterEmptyURL, sortByDate } = require('../utils/hnDataFilters');

const getArtist = async (req, res) => {
  const { query } = req.params;
  console.log("You've hit /api/spotify/artist with query: ", query)
  
  try {
    const URL = `https://api.spotify.com/v1/search?query=${encodeURIComponent(query)}&type=artist&tag:hipster`
    console.log(URL)
    res.status(200).json({'hello': 'world'})
  } catch (error) {  
    let errMessage = `${error}`;
    processErrorResponse(res, 500, errMessage);  
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