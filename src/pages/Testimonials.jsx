import React, { useState, useEffect, useCallback, useRef } from "react";
import { routeNames } from "../routes/routes";
import {
  DataLoader,
  GridList,
  NoData,
} from "../components/common/LazyComponents";
import PageTitle from "../components/layouts/PageTitle";
import { apiReqResLoader } from "../utils/common";
import config from "../config.json";
import { axiosPost } from "../helpers/axiosHelper";
import {
  ApiUrls,
  AppMessages,
  API_ACTION_STATUS,
  GridDefaultValues,
} from "../utils/constants";
import { useNavigate } from "react-router-dom";

const Testimonials = () => {
  let $ = window.$;

  const navigate = useNavigate();

  const [testimonialsList, setTestimonialsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const getTestimonials = ({
    pi = GridDefaultValues.pi,
    ps = GridDefaultValues.ps12,
    showPageLoader = false,
  }) => {
    //show loader if search actions.
    if (showPageLoader) {
      apiReqResLoader("x");
    }
    setIsDataLoading(true);
    let isapimethoderr = false;
    let objParams = {};

    objParams = {
      keyword: "",
      Status: 1,
      pi: parseInt(pi),
      ps: parseInt(ps),
    };

    return axiosPost(
      `${config.apiBaseUrl}${ApiUrls.getTestimonials}`,
      objParams
    )
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          setTotalCount(objResponse.Data.TotalCount);
          setPageCount(Math.ceil(objResponse.Data.TotalCount / ps));
          setTestimonialsList(objResponse.Data.Testimonials);
        } else {
          isapimethoderr = true;
          setTestimonialsList([]);
          setPageCount(0);
        }
      })
      .catch((err) => {
        isapimethoderr = true;
        setTestimonialsList([]);
        setPageCount(0);
        console.error(`"API :: ${ApiUrls.getTestimonials}, Error ::" ${err}`);
      })
      .finally(() => {
        if (isapimethoderr === true) {
        }
        if (showPageLoader) {
          apiReqResLoader("x", "x", API_ACTION_STATUS.COMPLETED);
        }
        setIsDataLoading(false);
      });
  };

  const columns = React.useMemo(
    () => [
      {
        Header: "Testimonials",
        accessor: "Id",
        disableSortBy: true,
        Cell: ({ row }) => (
          <div
            className="testimonial-block-1 transation h-100 hover-underline-animation rounded box-shadow"
            key={`testi-key-${row.id}`}
            d-id={row.original.Id}
          >
            <i className="flaticon-right-quote flat-small text-primary d-table"></i>
            <p className="p b-50">“{row.original.Testimonial}“ </p>
            <div className="d-flex align-items-center gap-2 mb-10 flex-jc-r name-block w-100 ">
              {row.original?.ProfileId > 0 && (
                <div className="image-avata me-2">
                  <img
                    className="rounded-circle img-border-white shadow"
                    src={row.original.PicPath}
                  />
                </div>
              )}
              <div className="about-avata lh-1">
                <div className="d-table text-primary">
                  by{" "}
                  <span className="name text-primary font-500">
                    {row.original.Name}
                  </span>
                </div>
                <span className="d-table designation mt-1 small text-light lh-1">
                  {row.original.Occupation}
                </span>
                {/* <span className="text-primary pb-2 d-table tagline-2 w-20 font-fifteen">
                  <span className="name ls-0">{row.original.Occupation}</span>
                </span> */}
              </div>
            </div>
          </div>
        ),
      },
    ],
    []
  );

  const fetchIdRef = useRef(0);

  const fetchData = useCallback(({ pageIndex, pageSize }) => {
    const fetchId = ++fetchIdRef.current;
    if (fetchId === fetchIdRef.current) {
      getTestimonials({
        pi: pageIndex,
        ps: pageSize,
        showPageLoader: pageIndex > 0 ? true : false,
      });
    }
  }, []);

  const onCreateTestimonial = () => {
    navigate(routeNames.createTestimonial.path);
  };

  return (
    <>
      {/*============== Page title Start ==============*/}
      <PageTitle
        title="Testimonials"
        navLinks={[{ title: "Home", url: routeNames.home.path }]}
      ></PageTitle>
      {/*============== Page title End ==============*/}

      {/*============== Testimonials Start ==============*/}
      <div className="full-row pt-5 pb-5 bg-light mb-20">
        <div className="container">
          {testimonialsList.length > 0 && (
            <div className="row">
              <div className="col-12 d-flex justify-content-end align-items-end pb-10">
                <button
                  className="btn btn-primary btn-mini btn-glow shadow rounded"
                  name="btncreatetestimonial"
                  id="btncreatetestimonial"
                  type="button"
                  onClick={onCreateTestimonial}
                >
                  <i className="fa fa-message position-relative me-1 t-2"></i>{" "}
                  Create Testimonial
                </button>
              </div>
            </div>
          )}
          <GridList
            columns={columns}
            data={testimonialsList}
            loading={isDataLoading}
            fetchData={fetchData}
            pageCount={pageCount}
            totalInfo={{
              text: "Testimonials",
              count: totalCount,
            }}
            noData={AppMessages.NoTestimonials}
            containerClassName="row row-cols-lg-3 row-cols-md-3 row-cols-1 g-3"
            defaultPs={12}
            isshowHeader={false}
            isColumnParentDiv={false}
            pagingNavigationArrows={true}
            dataloaderParentDiv={false}
            noDataClassName="min-h-130"
          />
          {testimonialsList.length == 0 && !isDataLoading && (
            <div className="row">
              <div className="col-12 d-flex justify-content-center align-items-end pb-10">
                <button
                  className="btn btn-primary btn-mini btn-glow shadow rounded"
                  name="btncreatetestimonial"
                  id="btncreatetestimonial"
                  type="button"
                  onClick={onCreateTestimonial}
                >
                  <i className="fa fa-message position-relative me-1 t-2"></i>{" "}
                  Create Testimonial
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/*============== Testimonials End ==============*/}
    </>
  );
};

export default Testimonials;
