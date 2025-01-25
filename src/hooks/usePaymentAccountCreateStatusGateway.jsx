import config from "../config.json";

export function usePaymentAccountCreateStatusGateway(isShowAll = true) {
  let paymentAccountCreateStatusList = [];

  if (isShowAll == true) {
    paymentAccountCreateStatusList.push({ Type: "All", Id: -1 });
  }

  Object.entries(config.paymentAccountCreateStatus).map(([key, value]) =>
    paymentAccountCreateStatusList.push({
      Type: key,
      Id: value,
    })
  );

  return { paymentAccountCreateStatusList };
}
