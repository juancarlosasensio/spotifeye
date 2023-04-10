const filterEmptyURL = (article) => { 
  return article.url && article?.url?.includes('http'); 
};

const sortTracksByPopularity = (trackA, trackB) => { 
  return trackB.popularity - trackA.popularity 
};

function buildArtistsString(artistsArr) {
  return (
    artistsArr.reduce((accumulator, artistObj) => (
      accumulator + ',' + artistObj.name.toLowerCase().trim()
    ), '')
  )
}

function containsArtist(artist) {
  return function(track) {
      const artistsStr = buildArtistsString(track.artists);
      const isArtistIncluded = artistsStr.toLowerCase().includes(artist.toLowerCase().trim());

      return isArtistIncluded;
  }
}

function removeDuplicates(cache) {
  return function(track) {
    const artists = buildArtistsString(track.artists);

    if (cache[track.name] && cache[track.name] === artists) {
      return false;  
    } else {
      cache[track.name] = artists;
      return true;
    }
  }
}

module.exports = {
  filterEmptyURL, 
  sortTracksByPopularity,
  buildArtistsString,
  containsArtist,
  removeDuplicates
}