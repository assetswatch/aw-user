import React from "react";

export const DataLoader = React.lazy(() => import("./DataLoader"));
export const PageLoader = React.lazy(() => import("./PageLoader"));
export const NoData = React.lazy(() => import("./NoData"));
export const Grid = React.lazy(() => import("./GridTable"));
export const GridList = React.lazy(() => import("./GridList"));
export const ModalView = React.lazy(() => import("./ModalView"));
export const LazyImage = React.lazy(() => import("./LazyImage"));
export const FilesUploadProgressView = React.lazy(() =>
  import("./FilesUploadProgressView")
);
export const FoldersBreadCrumb = React.lazy(() =>
  import("./FoldersBreadCrumb")
);
