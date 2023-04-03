import { useFetch } from "./useFetch";

export const useSpotify = (query, options) => {
  return useFetch(`api/spotify/search/${query}`, options);
}