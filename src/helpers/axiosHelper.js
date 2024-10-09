import {
  addLocalStorageItem,
  deleteLocalStorageItem,
  getLocalStorageItem,
} from "./localStorageHelper";
import getuuid from "./uuidHelper";
import {
  ApiUrls,
  LSApiTokenKey,
  LSTokenKey,
  LSDeviceIdKey,
  LSExpiryKey,
  UserCookie,
} from "../utils/constants";
import axios from "axios";
import moment from "moment";
import config from "../config.json";
import { getCookie } from "../utils/cookieHelper";
import { checkEmptyVal } from "../utils/common";

let $ = window.$;

export async function axiosGet(url, headerConfigs) {
  let headers = {};
  await getToken().then((response) => {
    headers = {
      "Content-Type": "application/json",
      ...response,
      ...headerConfigs,
    };
  });
  return axios.get(url, { headers: headers });
}

export async function axiosPost(url, data, headerConfigs) {
  let headers = {};
  await getToken().then((response) => {
    headers = {
      "Content-Type": "application/json",
      ...response,
      ...headerConfigs,
    };
  });
  return axios.post(url, data, { headers: headers });
}

export async function getToken() {
  let tokenDetails = JSON.parse(getLocalStorageItem(LSApiTokenKey));
  let objUserCookie = getCookie(UserCookie.CookieName);
  let uaccid =
    checkEmptyVal(objUserCookie?.[UserCookie.AccountId]) == true
      ? ""
      : objUserCookie?.[UserCookie.AccountId];
  let usessid =
    checkEmptyVal(objUserCookie?.[UserCookie.SessionId]) == true
      ? ""
      : objUserCookie?.[UserCookie.SessionId];
  let resData = {};
  if (!tokenDetails) {
    let deviceId = getuuid();
    await axios
      .post(`${config.apiBaseUrl}${ApiUrls.getToken}`, {
        DeviceId: deviceId,
      })
      .then((res) => {
        if (res.data.StatusCode === 200) {
          resData[LSTokenKey] = res.data.Data.Token;
          resData[LSDeviceIdKey] = deviceId;
          resData[LSExpiryKey] = res.data.Data.Expires;
          addLocalStorageItem(LSApiTokenKey, JSON.stringify(resData));
          resData["AccountId"] = uaccid;
          resData["SessionId"] = usessid;
          resData["TransactionId"] = getuuid();
        } else {
          console.error(res);
        }
      })
      .catch((err) => {
        console.error(err);
      });
    return Promise.resolve(resData);
  } else if (
    tokenDetails &&
    moment.utc().toISOString() >=
      new Date(tokenDetails?.[LSExpiryKey]).toISOString()
  ) {
    deleteLocalStorageItem(LSApiTokenKey);
    return await getToken();
  } else {
    return Promise.resolve({
      ...JSON.parse(getLocalStorageItem(LSApiTokenKey)),
      AccountId: uaccid,
      SessionId: usessid,
      TransactionId: getuuid(),
    });
  }
}
