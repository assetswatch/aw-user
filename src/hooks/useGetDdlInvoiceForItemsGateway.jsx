import { useEffect, useState } from "react";
import config from "../config.json";
import { ApiUrls, UserCookie } from "../utils/constants";
import { axiosPost } from "../helpers/axiosHelper";
import { useAuth } from "../contexts/AuthContext";
import { GetUserCookieValues } from "../utils/common";

export function useGetDdlInvoiceForItemsGateway(keyword, itemForTypeId = 0) {
  const { loggedinUser } = useAuth();

  let accountId = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );

  let profileId = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );
  const [invoiceForItems, setInvoiceForItems] = useState([]);

  useEffect(() => {
    if (itemForTypeId > 0) {
      let objBody = {
        AccountId: accountId,
        ProfileId: profileId,
        ItemForTypeId: parseInt(itemForTypeId),
        Keyword: keyword,
      };

      axiosPost(`${config.apiBaseUrl}${ApiUrls.getDdlInvoiceForItems}`, objBody)
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            setInvoiceForItems(objResponse.Data);
          } else {
            setInvoiceForItems([]);
          }
        })
        .catch((err) => {
          setInvoiceForItems([]);
          console.error(
            `API :: ${config.apiBaseUrl}${ApiUrls.getDdlInvoiceForItems}, Error :: ${err}`
          );
        });
    } else {
      setInvoiceForItems([]);
    }
  }, [itemForTypeId]);

  return { invoiceForItems, isDataLoading: false };
}
