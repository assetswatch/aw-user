import config from "../config.json";
import { ApiUrls } from "../utils/constants";
import useApiGateway from "./useApiGateway";

export function useGetInvoiceItemAccountForTypesGateway(keyword, status) {
  let objBody = {
    Keyword: keyword,
    Status: status,
  };

  const { data: invoiceItemAccountForTypesList, isDataLoading } = useApiGateway(
    `${config.apiBaseUrl}${ApiUrls.getInvoiceItemAccountForTypes}`,
    "post",
    objBody,
    true
  );
  return { invoiceItemAccountForTypesList, isDataLoading };
}
