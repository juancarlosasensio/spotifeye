const { Router } = require('express');
const { getArtists, getTracks } = require('./handlers/spotify')

const router = Router();

router.get('/spotify/search/artists/:query', getArtists)
router.get('/spotify/search/tracks/:query', getTracks)

module.exports = router;