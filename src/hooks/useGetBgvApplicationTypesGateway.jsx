import config from "../config.json";
import { ApiUrls } from "../utils/constants";
import useApiGateway from "./useApiGateway";

export function useGetBgvApplicationTypesGateway(keyword, status) {
  let objBody = {
    Keyword: keyword,
    Status: status,
  };

  const { data: bgvApplicationTypesList, isDataLoading } = useApiGateway(
    `${config.apiBaseUrl}${ApiUrls.getBgvApplicationTypes}`,
    "post",
    objBody,
    true
  );
  return { bgvApplicationTypesList, isDataLoading };
}
