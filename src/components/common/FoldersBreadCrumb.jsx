import React from "react";
import { UserCookie } from "../../utils/constants";
import { GetUserCookieValues } from "../../utils/common";
import { useAuth } from "../../contexts/AuthContext";

const FoldersBreadCrumb = React.memo(
  ({
    folders,
    title,
    currentFolderId,
    onAddFolder,
    onAddFile,
    onFolderHierarchyFolderClick,
  }) => {
    let $ = window.$;

    const { loggedinUser } = useAuth();

    let accountid = parseInt(
      GetUserCookieValues(UserCookie.AccountId, loggedinUser)
    );
    let profileid = parseInt(
      GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
    );

    return (
      <>
        <div className="breadcrumb w-400px">
          <>
            {folders && folders?.length > 0 ? (
              <>
                {folders?.length >= 2 ? (
                  <div className="breadcrumb-item bc-fh dropdown">
                    <a
                      className="flex flex-center w-30px h-30px br-100"
                      data-bs-toggle="collapse"
                      data-bs-target="#ddhierarchyfoldermenu"
                      aria-controls="ddhierarchyfoldermenu"
                      aria-expanded="false"
                    >
                      <i className="fa fa-ellipsis"></i>
                    </a>

                    <ul
                      className={`ddmenu ltp5 arrow collapse in bg-white py-0 px-0 mt-2 left-0 lh-1 shadow rounded text-primary`}
                      id="ddhierarchyfoldermenu"
                    >
                      <li>
                        <a
                          className="dropdown-item"
                          onClick={(e) => onFolderHierarchyFolderClick(e, 0)}
                        >
                          <i className="mdi mdi-folder font-22 position-relative me-1 t-4"></i>{" "}
                          {title}
                        </a>
                      </li>
                      {folders?.slice(0, -2).map((f, i) => {
                        return (
                          <li key={`foh-sf-${i}`}>
                            <a
                              className="dropdown-item"
                              onClick={(e) =>
                                onFolderHierarchyFolderClick(e, f.FolderId)
                              }
                            >
                              <i className="mdi mdi-folder font-22 position-relative me-1 t-4"></i>{" "}
                              {f.Name}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <div className="breadcrumb-item bc-fh">
                    <a
                      className="dropdown-item pl-0"
                      onClick={(e) => onFolderHierarchyFolderClick(e, 0)}
                    >
                      <h6 className="mb-3 down-line pb-10">{title}</h6>
                    </a>
                  </div>
                )}

                {folders?.slice(-2).map((f, i) => {
                  if (f.FolderId == currentFolderId) {
                    return (
                      <div
                        className="breadcrumb-item bc-fh dropdown"
                        key={`foh-${i}`}
                      >
                        <a
                          data-bs-toggle="collapse"
                          data-bs-target="#ddhierarchyactionmenu"
                          aria-controls="ddhierarchyactionmenu"
                          aria-expanded="false"
                          className="active"
                        >
                          <label>{f.Name}</label>
                          <i className="fa fa-chevron-circle-down font-small pt-2px"></i>
                        </a>
                        <ul
                          className={`ddmenu lt arrow collapse in bg-white py-0 px-0 mt-2 l-1p5rem lh-1 shadow rounded text-primary`}
                          id="ddhierarchyactionmenu"
                        >
                          <li>
                            <a
                              className="dropdown-item"
                              onClick={(e) => onAddFolder(e)}
                            >
                              <i className="mdi mdi-folder-plus font-22 position-relative me-1 t-4"></i>{" "}
                              New Folder
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" onClick={onAddFile}>
                              <i className="fa fa-file-arrow-up font-18 position-relative me-2 t-1 pl-5"></i>{" "}
                              File Upload
                            </a>
                          </li>
                        </ul>
                      </div>
                    );
                  } else {
                    return (
                      <div
                        className="breadcrumb-item bc-fh dropdown"
                        key={`foh-${i}`}
                      >
                        <a
                          onClick={(e) =>
                            onFolderHierarchyFolderClick(e, f.FolderId)
                          }
                        >
                          <label>{f.Name}</label>
                        </a>
                      </div>
                    );
                  }
                })}
              </>
            ) : (
              <div className="breadcrumb-item bc-fh">
                <h6 className="mb-3 down-line pb-10">{title}</h6>
              </div>
            )}
          </>
        </div>
      </>
    );
  }
);

export default FoldersBreadCrumb;
