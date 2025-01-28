import config from "../config.json";
import { ApiUrls } from "../utils/constants";
import useApiGateway from "./useApiGateway";

export function useGetInvoiceItemForTypesGateway(keyword, status) {
  let objBody = {
    Keyword: keyword,
    Status: status,
  };

  const { data: invoiceItemForTypesList, isDataLoading } = useApiGateway(
    `${config.apiBaseUrl}${ApiUrls.getInvoiceItemForTypes}`,
    "post",
    objBody,
    true
  );
  return { invoiceItemForTypesList, isDataLoading };
}
