import config from "../config.json";
import { ApiUrls } from "../utils/constants";
import useApiGateway from "./useApiGateway";

export function useGetAssetListingTypesGateway(keyword, status) {
  let objBody = {
    Keyword: keyword,
    Status: status,
  };

  const { data: assetListingTypesList, isDataLoading } = useApiGateway(
    `${config.apiBaseUrl}${ApiUrls.getAssetListingTypes}`,
    "post",
    objBody,
    true
  );
  return { assetListingTypesList, isDataLoading };
}
