import { useFetch } from "./useFetch";

export const useSpotify = (query, options) => {
  console.log(query)
  return useFetch(`api/spotify/artist/${query}`, options);
}