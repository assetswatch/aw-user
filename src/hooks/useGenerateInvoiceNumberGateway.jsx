import config from "../config.json";
import { axiosPost } from "../helpers/axiosHelper";
import { ApiUrls } from "../utils/constants";

export function useGenerateInvoiceNumberGateway(accountid, profileid) {
  let generatedInvoiceNumber = "";
  let objBody = {
    AccountId: accountid,
    ProfileId: profileid,
  };

  axiosPost(`${config.apiBaseUrl}${ApiUrls.generateInvoiceNumber}`, objBody)
    .then((response) => {
      let objResponse = response.data;
      if (objResponse.StatusCode === 200) {
        generatedInvoiceNumber = objResponse.Data.InvoiceNumber;
      }
    })
    .catch((err) => {
      console.error(
        `API :: ${config.apiBaseUrl}${ApiUrls.generateInvoiceNumber}, Error :: ${err}`
      );
    })
    .finally(() => {});

  return { generatedInvoiceNumber };
}
