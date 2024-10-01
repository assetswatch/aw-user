// AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { getCookie, setCookie, removeCookie } from "../utils/cookieHelper";
import { UserCookie } from "../utils/constants";
import {
  checkEmptyVal,
  checkObjNullorEmpty,
  GetCookieValues,
} from "../utils/common";

// Create the AuthContext
const AuthContext = createContext();

// Provide the AuthContext to the application
export const AuthProvider = ({ children }) => {
  const [loggedinUser, setloggedInUser] = useState(null);

  // Check for auth token in cookies when the component mounts
  useEffect(() => {
    setloggedInUser(getCookie(UserCookie.CookieName));
  }, []);

  const isAuthenticated = () => {
    let loggedinUser = getCookie(UserCookie.CookieName);
    if (
      checkEmptyVal(loggedinUser) ||
      checkObjNullorEmpty(loggedinUser) ||
      loggedinUser?.accid == 0
    ) {
      return false;
    } else {
      return true;
    }
  };

  // Login function to authenticate the user and set the auth token
  const loginUser = (loginData, isRemember, sessionid) => {
    console.log(loginData);
    let defaultProfile = loginData.Profiles?.filter(
      (p) => p.ProfileId == loginData.DefaultProfileId
    )?.[0];
    let cookieVal = {
      [UserCookie.AccountId]: loginData.AccountId,
      [UserCookie.SessionId]: sessionid,
      [UserCookie.Email]: loginData.Email,
      [UserCookie.PlanId]: loginData.PlanId,
      [UserCookie.Plan]: loginData.Plan,
      [UserCookie.Profile]: {
        [UserCookie.ProfileId]: defaultProfile.ProfileId,
        [UserCookie.Name]: defaultProfile.Name,
        [UserCookie.ProfilePic]: defaultProfile.PicPath,
        [UserCookie.ProfileTypeId]: defaultProfile.ProfileTypeId,
        [UserCookie.ProfileType]: defaultProfile.ProfileType,
        [UserCookie.ProfileCategoryId]: defaultProfile.ProfileCategoryId,
      },
    };

    setCookie(
      UserCookie.CookieName,
      JSON.stringify(cookieVal),
      isRemember == true && { expires: 30 }
    );
    setloggedInUser(getCookie(UserCookie.CookieName));
  };

  const updateUserProfile = (profileData) => {
    let cookieVal = {
      [UserCookie.AccountId]: loggedinUser?.[UserCookie.AccountId],
      [UserCookie.Email]: loggedinUser?.[UserCookie.Email],
      [UserCookie.PlanId]: loggedinUser?.[UserCookie.PlanId],
      [UserCookie.Plan]: loggedinUser?.[UserCookie.Plan],
      [UserCookie.Profile]: {
        [UserCookie.ProfileId]: profileData.profileid,
        [UserCookie.Name]: profileData.profilename,
        [UserCookie.ProfilePic]: profileData.profilepic,
        [UserCookie.ProfileTypeId]: profileData.profiletypeid,
        [UserCookie.ProfileType]: profileData.profiletype,
        [UserCookie.ProfileCategoryId]: profileData.profilecatid,
      },
    };

    //logoutUser();
    setCookie(UserCookie.CookieName, JSON.stringify(cookieVal), {
      expires: 30,
    });
    setloggedInUser(getCookie(UserCookie.CookieName));
  };

  const updateUserPlan = (planData) => {
    let cookieVal = {
      ...loggedinUser,
      [UserCookie.PlanId]: planData.PlanId,
      [UserCookie.Plan]: planData.Plan,
    };

    //logoutUser();
    setCookie(UserCookie.CookieName, JSON.stringify(cookieVal), {
      expires: 30,
    });
    setloggedInUser(getCookie(UserCookie.CookieName));
  };

  // Logout function to remove the auth token
  const logoutUser = () => {
    removeCookie(UserCookie.CookieName, { path: "/" });
    setloggedInUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        loginUser,
        logoutUser,
        loggedinUser,
        isAuthenticated,
        updateUserProfile,
        updateUserPlan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);
