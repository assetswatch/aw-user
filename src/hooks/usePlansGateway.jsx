import config from "../config.json";
import { ApiUrls } from "../utils/constants";
import useApiGateway from "./useApiGateway";

export default function usePlansGateway() {
  const { data: plansList, isDataLoading } = useApiGateway(
    `${config.apiBaseUrl}${ApiUrls.getPricingPlans}`
  );
  return { plansList, isDataLoading };
}
