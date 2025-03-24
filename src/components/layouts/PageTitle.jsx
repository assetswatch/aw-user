import { Link } from "react-router-dom";
import { SetPageLoaderNavLinks } from "../../utils/common";

const PageTitle = (titleProps) => {
  return (
    <>
      {SetPageLoaderNavLinks()}
      {/*============== Page title Start ==============*/}
      <div className="full-row footer-default-dark bg-footer box-shadow py-28 div-page-title bo-t1-primary bo-b1-primary">
        <div className="container">
          <div className="row">
            <div className="col">
              <h4 className="text-white">{titleProps.title}</h4>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0 bg-transparent p-0">
                  {titleProps.navLinks.map((item, idx) => {
                    return (
                      <li className="breadcrumb-item" key={`ptnav-${idx}`}>
                        <Link
                          className="text-white"
                          to={item.url}
                          replace={item.isReplace ? true : false}
                        >
                          {item.title}
                        </Link>
                      </li>
                    );
                  })}
                  <li
                    className="breadcrumb-item active text-primary"
                    aria-current="page"
                  >
                    {titleProps.title}
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>
      {/*============== Page title End ==============*/}
    </>
  );
};

export default PageTitle;
