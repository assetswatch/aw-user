import config from "../config.json";
import { ApiUrls } from "../utils/constants";
import useApiGateway from "./useApiGateway";

export function useProfileTypesGateway() {
  const { data: profileTypesList } = useApiGateway(
    `${config.apiBaseUrl}${ApiUrls.getProfileTypes}`,
    "get",
    {},
    false
  );
  return { profileTypesList };
}
