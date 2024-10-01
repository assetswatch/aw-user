import React from "react";
import { SetPageLoaderNavLinks } from "../../utils/common";

const Dashboard = () => {
  let $ = window.$;

  return <>{SetPageLoaderNavLinks()}</>;
};

export default Dashboard;
