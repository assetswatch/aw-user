import React from "react";
import { useGetUserProfilesGateway } from "../../hooks/useGetUserProfilesGateway";
import { DataLoader, NoData } from "../../components/common/LazyComponents";
import { apiReqResLoader, checkObjNullorEmpty } from "../../utils/common";
import { AppMessages } from "../../utils/constants";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { routeNames } from "../../routes/routes";

const ComingUp = () => {
  let $ = window.$;

  return (
    <>
      <div className="full-row  bg-light">
        <div className="container">
          <div className="row mx-auto col-lg-8 shadow">
            <div className="bg-white xs-p-20 p-30 pb-30 border rounded">
              <h4 className="mb-0 down-line">Coming Soon</h4>
              <div className="row row-cols-lg-3 pt-0 pb-0 row-cols-1 g-4 flex-center">
                <div
                  className="py-100 d-flex flex-center font-large font-500"
                  style={{ color: "var(--theme-primary-color)" }}
                >
                  Coming soon...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ComingUp;
