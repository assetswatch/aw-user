import React, { useState, useEffect } from "react";
import {
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
    navigate(routeNames.tenantdocuments.path);
  };

  const onCancel = (e) => {
    e.preventDefault();
    navigateToDocuments();
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row  bg-light">
        <div className="container">
          <div className="row mx-auto col-12 shadow">
            <div className="bg-white xs-p-20 p-30 pb-30 border rounded">
              <ol className="breadcrumb mb-0 bg-transparent p-0">
                <li className="breadcrumb-item" aria-current="page">
                  <h6 className="mb-4 down-line pb-10">View Document</h6>
                </li>
              </ol>

              <div className="container-fluid">
                <div className="row">
                  <div className="col px-0">
                    <div className="row font-13 font-500">
                      <div className="col-md-6 col-lg-4 col-xl-4 mb-15">
                        <span>Title : {documentDetails.Title}</span>
                      </div>
                      <div className="col-md-6 col-lg-4 col-xl-4 mb-15 text-lg-center">
                        <span>
                          Document Type : {documentDetails.DocumentType}
                        </span>
                      </div>
                      <div className="col-md-6 col-lg-4 col-xl-4 mb-15 text-lg-end">
                        <span>
                          Modified On : {documentDetails.ModifiedDateDisplay}
                        </span>
                      </div>
                      <div className="col-md-6 col-lg-12 col-xl-6 mb-15">
                        <span>Description : {documentDetails.Description}</span>
                      </div>
                    </div>
                    {fileUrl ? (
                      <div>
                        {documentDetails.Extension === "pdf" ? (
                          <PdfViewer file={fileUrl}></PdfViewer>
                        ) : (
                          <img
                            src={fileUrl}
                            className="bg-light border rounded max-h-600"
                          ></img>
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
    </>
  );
};

export default ViewDocument;
