import config from "../config.json";
import { ApiUrls } from "../utils/constants";
import useApiGateway from "./useApiGateway";

export function useGetAssetContractTypesGateway(keyword, status) {
  let objBody = {
    Keyword: keyword,
    Status: status,
  };

  const { data: assetContractTypesList, isDataLoading } = useApiGateway(
    `${config.apiBaseUrl}${ApiUrls.getAssetContractTypes}`,
    "post",
    objBody,
    true
  );
  return { assetContractTypesList, isDataLoading };
}
