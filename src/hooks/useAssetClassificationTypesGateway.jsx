import config from "../config.json";

export function useAssetClassificationTypesGateway(isShowAll = true) {
  let assetClassificationTypes = [];

  if (isShowAll == true) {
    assetClassificationTypes.push({ Type: "All", Id: 0 });
  }

  Object.entries(config.assetClassificationTypes).map(([key, value]) =>
    assetClassificationTypes.push({
      Type: key,
      Id: value,
    })
  );

  return { assetClassificationTypes };
}
