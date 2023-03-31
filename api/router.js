const { Router } = require('express');
const { 
  getArticlesByQuery, 
  getFrontPageArticles 
} = require('./handlers/hackerNews');
const { getArtist } = require('./handlers/spotify')

const router = Router();

router.get('/hn', getFrontPageArticles)
router.get('/hn/:query', getArticlesByQuery)
router.get('/spotify/artist/:query', getArtist)

module.exports = router;