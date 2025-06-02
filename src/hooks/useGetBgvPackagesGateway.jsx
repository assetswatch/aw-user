import config from "../config.json";
import { ApiUrls } from "../utils/constants";
import useApiGateway from "./useApiGateway";

export function useGetBgvPackagesGateway(keyword, status) {
  let objBody = {
    Keyword: keyword,
    Status: status,
  };

  const { data: bgvPackagesList, isDataLoading } = useApiGateway(
    `${config.apiBaseUrl}${ApiUrls.getBgvPackages}`,
    "post",
    objBody,
    true
  );
  return { bgvPackagesList, isDataLoading };
}
