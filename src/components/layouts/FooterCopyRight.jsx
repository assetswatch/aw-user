const FooterCopyRight = (footerProps) => {
  return (
    <>
      {/* ============== Copyright Section Start ============== */}
      <div
        className={`${
          footerProps.isBorder == true ? `copyright-border` : ""
        } bg-footer text-default py-2`}
      >
        <div className="container pt-2">
          <div className="row">
            <div className="col text-center">
              <span className="text-white">
                © {new Date().getFullYear()} Assets Watch. All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* ============== Copyright Section End ============== */}
    </>
  );
};

export default FooterCopyRight;
