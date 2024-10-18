import config from "../config.json";
import { ApiUrls } from "../utils/constants";
import useApiGateway from "./useApiGateway";

export function useGetNotificationTypesGateway(keyword) {
  let objBody = {
    Keyword: keyword,
  };

  const { data: notificationTypesList, isDataLoading } = useApiGateway(
    `${config.apiBaseUrl}${ApiUrls.getDdlNotificationTypes}`,
    "post",
    objBody,
    true
  );
  return { notificationTypesList, isDataLoading };
}
