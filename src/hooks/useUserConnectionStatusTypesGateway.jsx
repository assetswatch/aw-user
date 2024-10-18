import config from "../config.json";

export function useUserConnectionStatusTypesGateway(isShowAll = true) {
  let userConnectionStatusTypes = [];

  if (isShowAll == true) {
    userConnectionStatusTypes.push({ Type: "All", Id: -1 });
  }

  Object.entries(config.userConnectionStatusTypes).map(([key, value]) =>
    userConnectionStatusTypes.push({
      Type: key,
      Id: value,
    })
  );

  return { userConnectionStatusTypes };
}
