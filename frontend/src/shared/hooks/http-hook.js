import { useState, useCallback, useRef, useEffect } from "react";

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const activeHttpRequests = useRef([]); // not a state bc no need to update UI when this info changes

  const sendRequest = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      setIsLoading(true);

      const httpAbortCtrl = new AbortController();
      activeHttpRequests.current.push(httpAbortCtrl);

      let response;
      try {
         response = await fetch(url, {
          method,
          body,
          headers,
          signal: httpAbortCtrl.signal,
        }); // if the request throws an error, fetch WILL return a proper response with the error code
        const responseData = await response.json();

        activeHttpRequests.current = activeHttpRequests.current.filter(
          (reqCtrl) => reqCtrl !== httpAbortCtrl
        );

        if (!response.ok) throw new Error(responseData.message); // ok = 2xx response code // throw, hence will go to catch block
        return responseData;
      } catch (e) {
        // for 404 errors i have pages telling no such thing found, no need to add error modal imo
        if(response && response.status === 404) return;
        setError(e.message);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // if you RETURN a function, its a clean-up function that WILL execute when the component unmounts
  useEffect(() => {
    return () => {
      activeHttpRequests.current.forEach((abortCtrl) => abortCtrl.abort());
    };
  }, []);

  return { isLoading, error, sendRequest, clearError };
};
