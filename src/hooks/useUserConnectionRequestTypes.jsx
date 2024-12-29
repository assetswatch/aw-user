import config from "../config.json";

export function useUserConnectionRequestTypes(isShowAll = true) {
  let userConnectionRequestTypes = [];

  if (isShowAll == true) {
    userConnectionRequestTypes.push({ Type: "All", Id: -1 });
  }

  Object.entries(config.userConnectionRequestTypes).map(([key, value]) =>
    userConnectionRequestTypes.push({
      Type: key,
      Id: value,
    })
  );

  return { userConnectionRequestTypes };
}
