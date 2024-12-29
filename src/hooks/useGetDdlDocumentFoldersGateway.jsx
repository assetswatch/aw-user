import config from "../config.json";
import { ApiUrls } from "../utils/constants";
import useApiGateway from "./useApiGateway";

export function useGetDdlDocumentFoldersGateway(params) {
  const { data: documentFoldersList, isDataLoading } = useApiGateway(
    `${config.apiBaseUrl}${ApiUrls.getDdlDocumentFolders}`,
    "post",
    params,
    true
  );
  return { documentFoldersList, isDataLoading };
}
