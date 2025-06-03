export default function GoBackPanel({
  clickAction,
  isformBack = false,
  backText = "Back",
}) {
  return (
    <>
      {isformBack ? (
        <>
          <div
            className={`flex-shrink-0 h-30px text-primary justify-content-end align-items-start d-lg-none cur-pointer`}
            onClick={clickAction}
          >
            <i className="icons icon-arrow-left-circle font-600 position-relative me-1 t-2"></i>
          </div>
          <div
            className={`flex-shrink-0 justify-content-end align-items-start py-2 d-none d-lg-flex`}
          >
            <button
              type="button"
              className="btn btn-glow px-0 rounded-circle text-primary lh-1 d-flex flex-center"
              onClick={clickAction}
            >
              <i className="icons font-18 icon-arrow-left-circle text-primary me-1"></i>
              <span className="font-general">{backText}</span>
            </button>
          </div>
        </>
      ) : (
        <>
          <div
            className={`flex-shrink-0 h-30px text-primary py-1 justify-content-end ${
              isformBack ? "align-items-center" : "align-items-end"
            } d-lg-none cur-pointer`}
            onClick={clickAction}
          >
            <i className="icons icon-arrow-left-circle font-600 position-relative me-1 t-2"></i>
          </div>
          <div
            className={`flex-shrink-0 justify-content-end ${
              isformBack ? "align-items-center" : "align-items-end"
            } py-1 d-none d-lg-flex`}
          >
            <button
              className="btn btn-primary btn-xs btn-glow shadow rounded"
              onClick={clickAction}
            >
              <i className="icons icon-arrow-left-circle position-relative me-1 t-2"></i>{" "}
              {backText}
            </button>
          </div>
        </>
      )}
    </>
  );
}
