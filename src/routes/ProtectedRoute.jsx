import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { routeNames } from "./routes";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated() === false) {
    return <Navigate to={routeNames.login.path} replace />;
  }

  return children;
};

export default ProtectedRoute;
