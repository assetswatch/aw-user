import config from "../config.json";
import { ApiUrls } from "../utils/constants";
import useApiGateway from "./useApiGateway";

export function useGetTopAgentsGateWay(featuretype, count) {
  let objBody = {
    FeatureType: featuretype,
    Count: count,
  };

  const { data: topAgentsList, isDataLoading } = useApiGateway(
    `${config.apiBaseUrl}${ApiUrls.getTopAgents}`,
    "post",
    objBody,
    true
  );
  return { topAgentsList, isDataLoading };
}
