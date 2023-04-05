// https://codesandbox.io/s/thirsty-hellman-ovkwqr?file=/src/hooks.js
import { useEffect, useRef, useReducer } from "react";

export const useFetch = (url, options = {}) => {
  const cache = useRef({});

  const initialState = {
    status: "idle",
    error: null,
    data: []
  };
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case "FETCHING":
        return { ...initialState, status: "fetching" };
      case "FETCHED":
        return { ...initialState, status: "fetched", data: action.payload };
      case "FETCH_ERROR":
        return { ...initialState, status: "error", error: action.payload };
      default:
        return state;
    }
  }, initialState);

  useEffect(() => {
    let cancelRequest = false;

    const fetchData = async (endpoint) => {

      console.log("is there an endpoint?", !endpoint)

      if (!endpoint) {
        dispatch({ type: 'DEFAULT' })
      } else {
        if (cache.current[endpoint]) {
          console.log("This url was cached!!", endpoint);
          const data = cache.current[endpoint];

          dispatch({ type: "FETCHED", payload: data });
        } else {
          try {
            const response = await fetch(endpoint, options);
            const data = await response.json();
            cache.current[endpoint] = data;
            if (cancelRequest) return;

            dispatch({ type: "FETCHED", payload: data });
          } catch (error) {
            if (cancelRequest) return;

            dispatch({ type: "FETCH_ERROR", payload: error.message });
          }
        }
      }
    };

    fetchData(url);

    return function cleanup() {
      cancelRequest = true;
    };
  }, [url, options]);

  console.log(state);
  return state;
};
