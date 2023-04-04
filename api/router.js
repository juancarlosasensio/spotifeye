const { Router } = require('express');
const { 
  getArticlesByQuery, 
  getFrontPageArticles 
} = require('./handlers/hackerNews');
const { getArtists, getTracks } = require('./handlers/spotify')

const router = Router();

router.get('/hn', getFrontPageArticles)
router.get('/hn/:query', getArticlesByQuery)
router.get('/spotify/search/artists/:query', getArtists)
router.get('/spotify/search/tracks/:query', getTracks)

module.exports = router;