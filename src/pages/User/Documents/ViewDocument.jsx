import React, { useState, useEffect } from "react";
import {
  checkObjNullorEmpty,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
} from "../../../utils/common";
import {
  ApiUrls,
  UserCookie,
  SessionStorageKeys,
} from "../../../utils/constants";
import { useAuth } from "../../../contexts/AuthContext";
import { axiosPost, fetchPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
import { getsessionStorageItem } from "../../../helpers/sessionStorageHelper";
import { routeNames } from "../../../routes/routes";
import { useNavigate } from "react-router-dom";
import PdfViewer from "../../../components/common/PdfViewer";
import DataLoader from "../../../components/common/DataLoader";
import GoBackPanel from "../../../components/common/GoBackPanel";

const ViewDocument = () => {
  let $ = window.$;
  const navigate = useNavigate();

  const { loggedinUser } = useAuth();

  let documentid = parseInt(
    getsessionStorageItem(SessionStorageKeys.ViewEditDocumentId, 0)
  );

  let accountid = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );
  let profileid = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  const [isDataLoading, setIsDataLoading] = useState(true);
  const [documentDetails, setDocumentDetails] = useState({});

  //PdfViewer
  const [fileUrl, setFileUrl] = useState(null);

  useEffect(() => {
    getDocumentDetails();
  }, []);

  const getDocumentDetails = async () => {
    if (documentid > 0) {
      let objParams = {
        DocumentId: documentid,
      };
      axiosPost(`${config.apiBaseUrl}${ApiUrls.getDocumentDetails}`, objParams)
        .then(async (response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            setDocumentDetails(objResponse.Data);
            const fresponse = await fetchPost(
              `${config.apiBaseUrl}${ApiUrls.getDocumentFile}`,
              {
                StorageDocumentId: objResponse.Data.StorageDocumentId,
              }
            );
            if (fresponse.ok) {
              const blob = await fresponse.blob();
              const url = URL.createObjectURL(blob);
              setFileUrl(url);
            }
          } else {
          }
        })
        .catch((err) => {
          console.error(
            `"API :: ${ApiUrls.getDocumentDetails}, Error ::" ${err}`
          );
        })
        .finally(() => {
          setIsDataLoading(false);
        });
    } else {
      navigateToDocuments();
    }
  };

  //PdfViewer

  const navigateToDocuments = () => {
    window.history.go(-1);
  };

  const onCancel = (e) => {
    e.preventDefault();
    navigateToDocuments();
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row  bg-light content-ph">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="d-flex w-100">
                <div className="flex-grow-1">
                  <div className="breadcrumb my-1">
                    <div className="breadcrumb-item bc-fh">
                      <h6
                        className="mb-3 down-line pb-10 cur-pointer"
                        onClick={navigateToDocuments}
                      >
                        Documents
                      </h6>
                    </div>
                    <div className="breadcrumb-item bc-fh ctooltip-container">
                      <span className="font-general font-500 cur-default">
                        View Document
                      </span>
                    </div>
                  </div>
                </div>
                <GoBackPanel clickAction={navigateToDocuments} />
              </div>
              <div className="full-row px-3 py-4 bg-white box-shadow rounded">
                <div className="row container-fluid pb-30">
                  <ol className="breadcrumb mb-0 bg-transparent p-0 col-md-8 col-lg-8 col-xl-8 mb-15">
                    <li className="breadcrumb-item" aria-current="page">
                      {!checkObjNullorEmpty(documentDetails) && (
                        <h6 className="mb-0 down-line pb-10 higlight-font">
                          {documentDetails?.Name}.{documentDetails?.Extension}
                        </h6>
                      )}
                    </li>
                  </ol>
                  <div className="col-md-4 col-lg-4 col-xl-4 mb-15 text-lg-end px-0">
                    <span className="font-500 font-general">
                      Modified On : {documentDetails?.ModifiedDateDisplay}
                    </span>
                  </div>

                  <div className="container-fluid">
                    <div className="row">
                      <div className="col px-0">
                        {fileUrl ? (
                          <div className="min-h-300">
                            {documentDetails.Extension === "pdf" ? (
                              <PdfViewer
                                file={fileUrl}
                                cssclass="mt-10"
                              ></PdfViewer>
                            ) : (
                              <div className="flex flex-center min-h-300 max-h-600">
                                <img
                                  src={fileUrl}
                                  className="bg-light border rounded max-h-600"
                                ></img>
                              </div>
                            )}
                          </div>
                        ) : (
                          <DataLoader />
                        )}
                        <hr className="w-100 text-primary my-20"></hr>
                        <div className="row form-action d-flex flex-end">
                          <div
                            className="col-md-6 form-error"
                            id="form-error"
                          ></div>
                          <div className="col-md-6">
                            <button
                              className="btn btn-primary"
                              id="btncancel"
                              onClick={onCancel}
                            >
                              Back
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewDocument;
