import config from "../config.json";
import { ApiUrls } from "../utils/constants";
import useApiGateway from "./useApiGateway";

export function useGetAssetTypesGateway(keyword, status) {
  let objBody = {
    Keyword: keyword,
    Status: status,
  };

  const { data: assetTypesList, isDataLoading } = useApiGateway(
    `${config.apiBaseUrl}${ApiUrls.getAssetTypes}`,
    "post",
    objBody,
    true
  );
  return { assetTypesList, isDataLoading };
}
