const filterEmptyURL = (article) => { 
  return article.url && article?.url?.includes('http'); 
};

const sortTracksByPopularity = (trackA, trackB) => { 
  return trackB.popularity - trackA.popularity 
};

module.exports = {
  filterEmptyURL, 
  sortTracksByPopularity
}