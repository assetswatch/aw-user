import config from "../config.json";

export function useUserBrandingTypesGateway() {
  let BrandingTypes = [];

  Object.entries(config.UserBrandingTypes).map(([key, value]) =>
    BrandingTypes.push({
      Type: key,
      Id: value,
    })
  );

  return { BrandingTypes };
}
