import { useEffect, useState } from "react";

const FooterCopyRight = (footerProps) => {
  const [loadingComponents, setLoadingComponents] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingComponents(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* ============== Copyright Section Start ============== */}
      {loadingComponents && (
        <div
          className={` ${
            footerProps.isBorder == true
              ? `bg-footer copyright-border`
              : "bg-light bo-t1-lihover"
          }  text-default py-2`}
        >
          <div
            className={`pt-2 ${
              footerProps.isBorder == true
                ? "container"
                : "container-fluid box-shadow-top"
            }`}
          >
            <div className="row">
              <div className="col text-center">
                <span
                  className={`${
                    footerProps.isBorder == true
                      ? "text-white"
                      : "text-light-dark-color font-500 font-small"
                  }`}
                >
                  © {new Date().getFullYear()} Assets Watch. All rights
                  reserved.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ============== Copyright Section End ============== */}
    </>
  );
};

export default FooterCopyRight;
