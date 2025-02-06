import config from "../../config.json";
import { checkEmptyVal } from "../../utils/common";

const GridActionMenu = ({ row, actions }) => {
  return (
    <>
      {actions?.length > 0 && (
        <div className="dropdown gr-action">
          <button
            className="btn btn-link gr-action-btn"
            aria-expanded={false} //{isOpen}
          >
            <i className="fas fa-ellipsis-vertical"></i>
          </button>
          <ul
            className="dropdown-menu gr-action-menu dropdown-menu-left  box-shadow"
            // style={{ display: `${isOpen ? "block" : "none"}` }}
          >
            {actions.map((a, i) => {
              return (
                <li key={`gr-action-menu-li${i}`}>
                  <a
                    className="dropdown-item"
                    onClick={(e) => {
                      a["onclick"](e, row);
                    }}
                  >
                    {a["text"].toLowerCase().indexOf("users") != -1 ? (
                      <i className="fa fa-users pe-2 text-general" />
                    ) : a["text"].toLowerCase().indexOf("view") != -1 ? (
                      <i className="far fa-eye pe-2 text-general" />
                    ) : a["text"].toLowerCase().indexOf("edit") != -1 ? (
                      <i className="far fa-edit pe-2 text-general" />
                    ) : a["text"].toLowerCase().indexOf("delete") != -1 ? (
                      <i
                        className={`fas fa-trash pe-2 text-general ${a["icssclass"]}`}
                      />
                    ) : a["text"].toLowerCase().indexOf("terminate") != -1 ? (
                      a["icon"].toLowerCase() == "userterminate" ? (
                        <i className="fa fa-user-times pe-2 text-general" />
                      ) : (
                        <i className="fas fa-file-excel pe-2 text-general" />
                      )
                    ) : a["text"].toLowerCase().indexOf("accept") != -1 ? (
                      <i className="fa fa-check-circle pe-2 text-general" />
                    ) : a["text"].toLowerCase().indexOf("reject") != -1 ? (
                      <i className="fa fa-times-circle pe-2 text-general" />
                    ) : a["text"].toLowerCase().indexOf("message") != -1 ? (
                      <i className="fa fa-comment pe-2 text-general" />
                    ) : a["text"].toLowerCase().indexOf("share") != -1 ? (
                      <i className="fa fa-share-from-square pe-2 text-general" />
                    ) : a["text"].toLowerCase().indexOf("manage property") !=
                      -1 ? (
                      <i className="fa fa-house pe-2 text-general" />
                    ) : a["text"].toLowerCase().indexOf("manage item") != -1 ? (
                      <i
                        className={`fa fa-list pe-2 text-general ${a["icssclass"]}`}
                      />
                    ) : a["text"].toLowerCase() == "list property" ||
                      a["text"].toLowerCase() == "listing information" ? (
                      <i
                        className={`fas fa-list-ul pe-2 text-general ${a["icssclass"]}`}
                      />
                    ) : a["text"].toLowerCase().indexOf("download") != -1 ? (
                      <i
                        className={`fas fa-download pe-2 text-general ${a["icssclass"]}`}
                      />
                    ) : a["text"].toLowerCase().indexOf("send") != -1 ? (
                      <i
                        className={`fa fa-paper-plane pe-2 text-general ${a["icssclass"]}`}
                      />
                    ) : (
                      ""
                    )}
                    {a["text"]}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
};

export const GridDocActionMenu = ({ row, actions }) => {
  // if (row.original.IsFolder == 1) {
  //   actions = actions.filter((item) => item.text.toLowerCase() !== "view");
  // }
  if (row.original.IsFolder == 0 || checkEmptyVal(row.original["IsFolder"])) {
    actions = actions.filter((item) => item.text.toLowerCase() !== "edit");
  }
  if (
    row.original.SharedType?.toString().toLowerCase() == config.sharedTypes.Sent
  ) {
    actions = actions.filter((item) => item.text.toLowerCase() !== "reject");
  }
  if (row.original.SharedTypeId == config.sharedTypes.Received) {
    actions = actions.filter(
      (item) =>
        item.text.toLowerCase() !== "delete" &&
        item.text.toLowerCase() !== "remove" &&
        item.text.toLowerCase() !== "view users"
    );
  }
  return (
    <>
      {actions?.length > 0 && (
        <div className="dropdown gr-action">
          <button
            className="btn btn-link gr-action-btn"
            aria-expanded={false} //{isOpen}
          >
            <i className="fas fa-ellipsis-vertical"></i>
          </button>
          <ul
            className="dropdown-menu gr-action-menu dropdown-menu-left  box-shadow"
            // style={{ display: `${isOpen ? "block" : "none"}` }}
          >
            {actions.map((a, i) => {
              return (
                <li key={`gr-action-menu-li${i}`}>
                  <a
                    className="dropdown-item"
                    onClick={(e) => {
                      a["onclick"](e, row);
                    }}
                  >
                    {a["text"].toLowerCase().indexOf("users") != -1 ? (
                      <i
                        className={`fa fa-users pe-2 text-general ${a["icssclass"]}`}
                      />
                    ) : a["text"].toLowerCase().indexOf("view") != -1 ? (
                      <i
                        className={`far fa-eye pe-2 text-general ${a["icssclass"]}`}
                      />
                    ) : a["text"].toLowerCase().indexOf("edit") != -1 ? (
                      <i
                        className={`far fa-edit pe-2 text-general ${a["icssclass"]}`}
                      />
                    ) : a["text"].toLowerCase().indexOf("delete") != -1 ||
                      a["text"].toLowerCase().indexOf("remove") != -1 ? (
                      <i
                        className={`fas fa-trash pe-2 text-general ${a["icssclass"]}`}
                      />
                    ) : a["text"].toLowerCase().indexOf("share") != -1 ? (
                      <i
                        className={`fa fa-share-from-square pe-2 text-general ${a["icssclass"]}`}
                      />
                    ) : a["text"].toLowerCase().indexOf("manage property") !=
                      -1 ? (
                      <i className="fa fa-house pe-2 text-general" />
                    ) : a["text"].toLowerCase().indexOf("reject") != -1 ? (
                      <i
                        className={`fa fa-times-circle pe-2 text-general ${a["icssclass"]}`}
                      />
                    ) : a["text"].toLowerCase().indexOf("download") != -1 ? (
                      <i
                        className={`fas fa-download pe-2 text-general ${a["icssclass"]}`}
                      />
                    ) : a["text"].toLowerCase().indexOf("send") != -1 ? (
                      <i
                        className={`fa fa-paper-plane pe-2 text-general ${a["icssclass"]}`}
                      />
                    ) : (
                      ""
                    )}
                    {a["text"]}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
};

export const GridUserConnectionActionMenu = ({ row, actions }) => {
  if (row.original.Status == config.userConnectionStatusTypes.Joined) {
    actions = actions.filter(
      (item) =>
        item.text.toLowerCase() !== "accept" &&
        item.text.toLowerCase() !== "reject"
    );
  } else if (
    row.original.Status == config.userConnectionStatusTypes.Terminated ||
    row.original.Status == config.userConnectionStatusTypes.Rejected ||
    row.original.RequestTypeId == config.userConnectionRequestTypes.Sent
  ) {
    actions = actions.filter((item) => 1 != 1);
  } else if (
    row.original.Status == config.userConnectionStatusTypes.Pending &&
    row.original.RequestTypeId == config.userConnectionRequestTypes.Received
  ) {
    actions = actions.filter(
      (item) =>
        item.text.toLowerCase() !== "send message" &&
        item.text.toLowerCase() !== "terminate"
    );
  }
  return (
    <>
      {actions?.length > 0 && (
        <div className="dropdown gr-action">
          <button
            className="btn btn-link gr-action-btn"
            aria-expanded={false} //{isOpen}
          >
            <i className="fas fa-ellipsis-vertical"></i>
          </button>
          <ul className="dropdown-menu gr-action-menu dropdown-menu-left  box-shadow">
            {actions.map((a, i) => {
              return (
                <li key={`gr-action-menu-li${i}`}>
                  <a
                    className="dropdown-item"
                    onClick={(e) => {
                      a["onclick"](e, row);
                    }}
                  >
                    {a["text"].toLowerCase().indexOf("users") != -1 ? (
                      <i
                        className={`fa fa-users pe-2 text-general ${a["icssclass"]}`}
                      />
                    ) : a["text"].toLowerCase().indexOf("terminate") != -1 ? (
                      a["icon"].toLowerCase() == "userterminate" ? (
                        <i className="fa fa-user-times pe-2 text-general" />
                      ) : (
                        <i className="fas fa-file-excel pe-2 text-general" />
                      )
                    ) : a["text"].toLowerCase().indexOf("delete") != -1 ||
                      a["text"].toLowerCase().indexOf("remove") != -1 ? (
                      <i
                        className={`fas fa-trash pe-2 text-general ${a["icssclass"]}`}
                      />
                    ) : a["text"].toLowerCase().indexOf("accept") != -1 ? (
                      <i className="fa fa-check-circle pe-2 text-general" />
                    ) : a["text"].toLowerCase().indexOf("reject") != -1 ? (
                      <i className="fa fa-times-circle pe-2 text-general" />
                    ) : a["text"].toLowerCase().indexOf("reject") != -1 ? (
                      <i
                        className={`fa fa-times-circle pe-2 text-general ${a["icssclass"]}`}
                      />
                    ) : a["text"].toLowerCase().indexOf("message") != -1 ? (
                      <i className="fa fa-comment pe-2 text-general" />
                    ) : a["text"].toLowerCase().indexOf("manage property") !=
                      -1 ? (
                      <i className="fa fa-house pe-2 text-general" />
                    ) : a["text"].toLowerCase().indexOf("download") != -1 ? (
                      <i
                        className={`fas fa-download pe-2 text-general ${a["icssclass"]}`}
                      />
                    ) : a["text"].toLowerCase().indexOf("send") != -1 ? (
                      <i
                        className={`fa fa-paper-plane pe-2 text-general ${a["icssclass"]}`}
                      />
                    ) : (
                      ""
                    )}
                    {a["text"]}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
};

export const GridPropertyActionMenu = ({ row, actions }) => {
  if (row.original.IsListed == 0) {
    actions = actions.filter(
      (item) => item.text.toLowerCase() !== "listing information"
    );
  } else if (row.original.IsListed == 1) {
    actions = actions.filter(
      (item) => item.text.toLowerCase() !== "list property"
    );
  }
  return (
    <>
      {actions?.length > 0 && (
        <div className="dropdown gr-action">
          <button
            className="btn btn-link gr-action-btn"
            aria-expanded={false} //{isOpen}
          >
            <i className="fas fa-ellipsis-vertical"></i>
          </button>
          <ul className="dropdown-menu gr-action-menu dropdown-menu-left  box-shadow">
            {actions.map((a, i) => {
              return (
                <li key={`gr-action-menu-li${i}`}>
                  <a
                    className="dropdown-item"
                    onClick={(e) => {
                      a["onclick"](e, row);
                    }}
                  >
                    {a["text"].toLowerCase().indexOf("view") != -1 ? (
                      <i
                        className={`far fa-eye pe-2 text-general ${a["icssclass"]}`}
                      />
                    ) : a["text"].toLowerCase().indexOf("delete") != -1 ||
                      a["text"].toLowerCase().indexOf("remove") != -1 ? (
                      <i
                        className={`fas fa-trash pe-2 text-general ${a["icssclass"]}`}
                      />
                    ) : a["text"].toLowerCase().indexOf("share") != -1 ? (
                      <i
                        className={`fa fa-share-from-square pe-2 text-general ${a["icssclass"]}`}
                      />
                    ) : a["text"].toLowerCase().indexOf("manage property") !=
                      -1 ? (
                      <i className="fa fa-house pe-2 text-general" />
                    ) : a["text"].toLowerCase() == "list property" ||
                      a["text"].toLowerCase() == "listing information" ? (
                      <i
                        className={`fas fa-list-ul pe-2 text-general ${a["icssclass"]}`}
                      />
                    ) : a["text"].toLowerCase() == "unlist property" ? (
                      <i
                        className={`fas fa-ban pe-2 text-general ${a["icssclass"]}`}
                      />
                    ) : a["text"].toLowerCase() == "assign property" ? (
                      <i
                        className={`fas fa-house-circle-check pe-2 text-general ${a["icssclass"]}`}
                      />
                    ) : a["text"].toLowerCase().indexOf("switch") != -1 ? (
                      <i
                        className={`fa fa-exchange pe-2 text-general ${a["icssclass"]}`}
                      />
                    ) : a["text"].toLowerCase().indexOf("download") != -1 ? (
                      <i
                        className={`fas fa-download pe-2 text-general ${a["icssclass"]}`}
                      />
                    ) : (
                      ""
                    )}
                    {a["text"]}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
};

export default GridActionMenu;
