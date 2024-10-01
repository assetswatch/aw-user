import config from "../config.json";
import { ApiUrls } from "../utils/constants";
import useApiGateway from "./useApiGateway";

export function useGetAssetAccessTypesGateway(keyword, status) {
  let objBody = {
    Keyword: keyword,
    Status: status,
  };

  const { data: assetAccessTypesList, isDataLoading } = useApiGateway(
    `${config.apiBaseUrl}${ApiUrls.getAssetAcccessTypes}`,
    "post",
    objBody,
    true
  );
  return { assetAccessTypesList, isDataLoading };
}
