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
                    {a["text"].toLowerCase().indexOf("view") != -1 ? (
                      <i className="far fa-eye pe-2 text-general" />
                    ) : a["text"].toLowerCase().indexOf("edit") != -1 ? (
                      <i className="far fa-edit pe-2 text-general" />
                    ) : a["text"].toLowerCase().indexOf("delete") != -1 ? (
                      <i className="fas fa-trash pe-2 text-general" />
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
