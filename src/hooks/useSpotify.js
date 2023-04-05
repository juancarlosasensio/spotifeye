import { useFetch } from "./useFetch";


export function useSpotify(query, type = 'artists', options = {}) {
  let endpoint = `api/spotify/search/${encodeURIComponent(type)}/${encodeURIComponent(query)}`;
  if (arguments.length < 1) {
    endpoint = '';
  }
  // useFetch will handle endpoint as empty string
  return useFetch(endpoint, options);
}