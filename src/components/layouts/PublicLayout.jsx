import React, { Suspense } from "react";

import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import UserHeader from "./UserHeader";
import { useAuth } from "../../contexts/AuthContext";
import routes from "../../routes/routes";
import { checkEmptyVal } from "../../utils/common";
import FooterCopyRight from "./FooterCopyRight";
import { ToastView } from "../common/ToastView";

const PublicLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const path = useLocation();

  let routesList = routes.filter((r) => r.isprotected);
  let isprotectedRoute = routesList.filter(
    (rl) => rl.path.toLowerCase() == path.pathname.toLowerCase()
  )?.[0];

  return (
    <>
      {checkEmptyVal(isprotectedRoute) ? (
        <Header></Header>
      ) : (
        <UserHeader></UserHeader>
      )}
      <div className="bg-light content-wrapper">{children}</div>
      {checkEmptyVal(isprotectedRoute) ? (
        <Footer />
      ) : (
        <FooterCopyRight isBorder={false} />
      )}

      <ToastView />
    </>
  );
};

export default PublicLayout;
