import { useEffect, useRef, useState } from "react";

export default function GridFiltersPanel({
  divFilterControls,
  elements = [],
  elementsContent = null,
}) {
  const [filterState, setFilterState] = useState(false);
  const wrapperRef = useRef(null);
  const [height, setHeight] = useState("0px");

  useEffect(() => {
    document
      .getElementById("div-filters-controls-panel")
      ?.classList.add("pb-3");

    updateHeight();

    const handleResize = () => {
      updateHeight();
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [filterState]);

  const updateHeight = () => {
    if (wrapperRef.current && filterState) {
      setHeight(
        `${
          document.getElementById("div-filters-controls-panel").offsetHeight
        }px`
      );
    } else {
      setHeight("0px");
    }
  };

  return (
    <>
      <div className="woo-filter-bar full-row px-3 py-0 my-0 grid-search bo-0">
        <div className="container-fluid v-center px-0 mb-0 pb-0">
          <div className="mix-tab">
            <ul className="nav-tab-border-active ms-auto d-table">
              <li
                className={`mixitup-control mixitup-control-active shadow mx-1 mx-sm-1 mx-md-2 mb-20 w-120px font-small font-500`}
                onClick={() => setFilterState(!filterState)}
              >
                <i className="fa fa-filter pe-1"></i>{" "}
                {!filterState ? "Show" : "Hide"} Filters
              </li>
              {(elements || []).map((action, index) => (
                <li
                  className={`mixitup-control mixitup-control-active shadow mx-1 mx-sm-1 mx-md-2 mb-20 px-15 font-small font-400 bg-primary text-white btn-glow`}
                  key={`gr-top-actions-${index}`}
                  onClick={action.onClick}
                >
                  {action.icon && <i className={`${action.icon} pe-2`}></i>}
                  {action.label}
                </li>
              ))}
              {elementsContent && elementsContent}
            </ul>
          </div>
        </div>

        <div
          style={{
            height,
            //overflow: "hidden",
            transition: "height 0.4s ease, padding 0.4s ease",
          }}
          ref={wrapperRef}
        >
          {filterState && divFilterControls}
        </div>
      </div>
    </>
  );
}
