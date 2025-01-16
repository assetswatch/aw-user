import { useEffect, useState } from "react";
import config from "../config.json";
import { ApiUrls } from "../utils/constants";
import useApiGateway from "./useApiGateway";
import { axiosPost } from "../helpers/axiosHelper";

export function useGetAssetTypesGateway(
  keyword,
  status,
  classificationTypeId = 0
) {
  const [assetTypesList, setassetTypesList] = useState([]);
  useEffect(() => {
    let objBody = {
      ClassificationTypeId: classificationTypeId,
      Keyword: keyword,
      Status: status,
    };

    axiosPost(`${config.apiBaseUrl}${ApiUrls.getAssetTypes}`, objBody)
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          setassetTypesList(objResponse.Data);
        }
      })
      .catch((err) => {
        console.error(
          `API :: ${config.apiBaseUrl}${ApiUrls.getAssetTypes}, Error :: ${err}`
        );
      })
      .finally(() => {});
  }, [classificationTypeId]);

  return { assetTypesList, isDataLoading: false };
}
