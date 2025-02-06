import config from "../config.json";
import { ApiUrls } from "../utils/constants";
import useApiGateway from "./useApiGateway";

export function useGetDdlInvoiceItemsGateway(keyword, accountid, profileid) {
  let objBody = {
    Keyword: keyword,
    AccountId: accountid,
    ProfileId: profileid,
  };

  const { data: invoiceItemsList, isDataLoading } = useApiGateway(
    `${config.apiBaseUrl}${ApiUrls.getDdlInvoiceItems}`,
    "post",
    objBody,
    true
  );
  return { invoiceItemsList, isDataLoading };
}
