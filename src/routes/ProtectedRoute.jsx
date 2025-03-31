import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { routeNames } from "./routes";
import { UrlWithoutParam } from "../utils/common";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated() === false) {
    return <Navigate to={UrlWithoutParam(routeNames.register)} replace />;
  }

  return children;
};

export default ProtectedRoute;
