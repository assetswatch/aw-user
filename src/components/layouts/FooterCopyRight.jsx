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
              ? `bg-footer copyr ight-border`
              : "bg-light"
          }  text-default p y-2`}
        >
          <div
            className={`py-2 ${
              footerProps.isBorder == true
                ? "container"
                : "container-fluid box-shadow-top bo-t1-gray"
            }`}
            style={{ height: "40px" }}
          >
            <div className="row">
              <div className={`col ${footerProps?.css}`}>
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
