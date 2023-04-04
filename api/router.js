const { Router } = require('express');
const { 
  getArticlesByQuery, 
  getFrontPageArticles 
} = require('./handlers/hackerNews');
const { getArtists } = require('./handlers/spotify')

const router = Router();

router.get('/hn', getFrontPageArticles)
router.get('/hn/:query', getArticlesByQuery)
// router.get('/spotify/search/:query/type/:type', getArtists)
router.get('/spotify/search/:query/:type?', getArtists)

module.exports = router;