import { useState, useEffect } from "react";
import { axiosGet, axiosPost } from "../helpers/axiosHelper";

// Custom hook for fetching data
export default function useApiGateway(
  url,
  method = "post",
  objBody = {},
  isloading = true
) {
  const [data, setData] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(isloading);

  useEffect(() => {
    if (isloading) setIsDataLoading(true);
    if (method.toLowerCase() == "post") {
      axiosPost(url, objBody)
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            setData(objResponse.Data);
          } else {
            setData([]);
          }
        })
        .catch((err) => {
          console.error(`API :: ${url}, Error :: ${err}`);
          setData([]);
        })
        .finally(() => {
          setIsDataLoading(false);
        });
    }
    if (method.toLowerCase() == "get") {
      axiosGet(url)
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            setData(objResponse.Data);
          } else {
            setData([]);
          }
        })
        .catch((err) => {
          console.error(`API :: ${url}, Error :: ${err}`);
          setData([]);
        })
        .finally(() => {
          setIsDataLoading(false);
        });
    }
  }, [url]);

  return { data, isDataLoading };
}
