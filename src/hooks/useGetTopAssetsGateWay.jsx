import config from "../config.json";
import { ApiUrls } from "../utils/constants";
import useApiGateway from "./useApiGateway";

export function useGetTopAssetsGateWay(featuretype, count) {
  let objBody = {
    FeatureType: featuretype,
    Count: count,
  };

  const { data: topAssetsList, isDataLoading } = useApiGateway(
    `${config.apiBaseUrl}${ApiUrls.getTopAssets}`,
    "post",
    objBody,
    true
  );
  return { topAssetsList, isDataLoading };
}
