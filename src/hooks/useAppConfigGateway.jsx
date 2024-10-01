import config from "../config.json";
import { ApiUrls } from "../utils/constants";
import useApiGateway from "./useApiGateway";

export default function useAppConfigGateway() {
  const { data: appConfigDetails, isDataLoading } = useApiGateway(
    `${config.apiBaseUrl}${ApiUrls.getAppConfig}`,
    "GET"
  );
  return { appConfigDetails, isDataLoading };
}
