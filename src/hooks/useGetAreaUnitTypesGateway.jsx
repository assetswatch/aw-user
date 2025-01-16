import config from "../config.json";
import { ApiUrls } from "../utils/constants";
import useApiGateway from "./useApiGateway";

export function useGetAreaUnitTypesGateway(keyword, status) {
  let objBody = {
    Keyword: keyword,
    Status: status,
  };

  const { data: areaUnitTypesList, isDataLoading } = useApiGateway(
    `${config.apiBaseUrl}${ApiUrls.getAreaUnitTypes}`,
    "post",
    objBody,
    true
  );
  return { areaUnitTypesList, isDataLoading };
}
