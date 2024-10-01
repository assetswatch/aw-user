import config from "../config.json";
import { ApiUrls, UserCookie } from "../utils/constants";
import useApiGateway from "./useApiGateway";
import { GetCookieValues } from "../utils/common";

export function useGetUserProfilesGateway() {
  let objBody = {
    AccountId: parseInt(GetCookieValues(UserCookie.AccountId)),
  };

  const { data: userProfilesList, isDataLoading } = useApiGateway(
    `${config.apiBaseUrl}${ApiUrls.getUserProfiles}`,
    "post",
    objBody,
    true
  );
  return { userProfilesList, isDataLoading };
}
