import config from "../config.json";

export function useGetAssetOwnershipStatusTypesGateway() {
  let assetOwnershipStatusTypes = [];

  Object.entries(config.assetOwnershipStatusTypes).map(([key, value]) =>
    assetOwnershipStatusTypes.push({
      Type: key,
      Id: value,
    })
  );

  return { assetOwnershipStatusTypes };
}
