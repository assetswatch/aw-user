import config from "../config.json";

export function useDocSharedTypesGateway(isShowAll = true) {
  let docSharedTypes = [];

  if (isShowAll == true) {
    docSharedTypes.push({ Type: "All", Id: 0 });
  }

  Object.entries(config.sharedTypes).map(([key, value]) =>
    docSharedTypes.push({
      Type: key,
      Id: value,
    })
  );

  return { docSharedTypes };
}
