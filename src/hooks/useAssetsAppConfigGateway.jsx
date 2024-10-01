import config from "../config.json";
import { ApiUrls } from "../utils/constants";
import useApiGateway from "./useApiGateway";

export function useAssetsAppConfigGateway() {
  let { data: assetsAppConfigList, isDataLoading } = useApiGateway(
    `${config.apiBaseUrl}${ApiUrls.getAssetsAppConfig}`,
    "GET"
  );
  return { assetsAppConfigList, isDataLoading };
}
