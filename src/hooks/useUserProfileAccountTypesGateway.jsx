import config from "../config.json";

export function useUserProfileAccountTypesGateway(isShowAll = false) {
  let profileAccountTypes = [];

  if (isShowAll == true) {
    profileAccountTypes.push({ Type: "All", Id: -1 });
  }

  Object.entries(config.userProfileAccountTypes).map(([key, value]) =>
    profileAccountTypes.push({
      Type: key,
      Id: value,
    })
  );

  return { profileAccountTypes };
}
