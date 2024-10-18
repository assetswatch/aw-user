import config from "../config.json";
import { ApiUrls } from "../utils/constants";
import useApiGateway from "./useApiGateway";

export function useGetDdlUserAssetsGateway(keyword, accountid, profileid) {
  let objBody = {
    Keyword: keyword,
    AccountId: accountid,
    ProfileId: profileid,
  };

  const { data: userAssetsList, isDataLoading } = useApiGateway(
    `${config.apiBaseUrl}${ApiUrls.getDdlUserAssets}`,
    "post",
    objBody,
    true
  );
  return { userAssetsList, isDataLoading };
}
