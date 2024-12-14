import config from "../config.json";
import { ApiUrls } from "../utils/constants";
import useApiGateway from "./useApiGateway";

export function useGetDocumentTypesGateway(keyword) {
  let objBody = {
    Keyword: keyword,
  };

  const { data: documentTypesList, isDataLoading } = useApiGateway(
    `${config.apiBaseUrl}${ApiUrls.getDocumentsTypes}`,
    "post",
    objBody,
    true
  );
  return { documentTypesList, isDataLoading };
}
