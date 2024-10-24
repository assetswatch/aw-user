import config from "../config.json";

export function usePaymentStatusTypesGateway(isShowAll = true) {
  let paymentStatusTypes = [];

  if (isShowAll == true) {
    paymentStatusTypes.push({ Type: "All", Id: -1 });
  }

  Object.entries(config.paymentStatusTypes).map(([key, value]) =>
    paymentStatusTypes.push({
      Type: key,
      Id: value,
    })
  );

  return { paymentStatusTypes };
}
