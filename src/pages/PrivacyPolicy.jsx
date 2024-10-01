import React, { useEffect } from "react";
import { loadFile, unloadFile, getArrLoadFiles } from "../utils/loadFiles";
import { SetPageLoaderNavLinks } from "../utils/common";
const PrivacyPolicy = () => {
  let $ = window.$;

  //list of js/css dependencies.
  let arrJsCssFiles = [
    {
      dir: "./assets/js/",
      pos: "body",
      type: "js",
      files: ["layerslider.js", "owl.js"],
    },
  ];

  useEffect(() => {
    //load js/css depedency files.
    let arrLoadFiles = getArrLoadFiles(arrJsCssFiles);
    let promiseLoadFiles = arrLoadFiles.map(loadFile);
    Promise.allSettled(promiseLoadFiles).then(function (responses) {
      loadSettings();
    });

    return () => {
      unloadFile(arrJsCssFiles); //unload files.
    };
  }, []);

  //load all jquery dependencies.
  function loadSettings() {
    try {
      //Banner Slider
      $("#slider")?.layerSlider({
        sliderVersion: "6.0.0",
        type: "fullwidth",
        responsiveUnder: 0,
        maxRatio: 1,
        slideBGSize: "auto",
        hideUnder: 0,
        hideOver: 100000,
        skin: "outline",
        fitScreenWidth: true,
        //navButtons: false,
        navStartStop: false,
        navPrevNext: false,
        globalBGColor: "#53585f",
        fullSizeMode: "fitheight",
        thumbnailNavigation: "disabled",
        pauseOnHover: "enabled",
        height: 600,
        skinsPath: "assets/skins/",
      });

      // Testimonials carousel
      if ($(".testimonial-carousel").length) {
        $(".testimonial-carousel")?.owlCarousel({
          loop: true,
          margin: 30,
          nav: false,
          dots: true,
          smartSpeed: 500,
          autoplay: true,
          responsive: {
            0: {
              items: 1,
            },
            480: {
              items: 1,
            },
            600: {
              items: 1,
            },
            800: {
              items: 1,
            },
            1200: {
              items: 1,
            },
          },
        });
      }

      if ($(".properties-carousel").length) {
        setCarousel($(".properties-carousel"));
      }

      if ($(".agents-carousel").length) {
        setCarousel($(".agents-carousel"));
      }

      function setCarousel(elem) {
        elem.owlCarousel({
          loop: false,
          margin: 24,
          nav: true,
          dots: true,
          smartSpeed: 500,
          autoplay: false,
          responsive: {
            0: {
              items: 1,
            },
            576: {
              items: 2,
            },
            992: {
              items: 2,
            },
            1200: {
              items: 3,
            },
            1400: {
              items: 4,
            },
          },
        });
      }
    } catch (e) {
      console.log(e.message);
    }
  }

  return (
    <>
      {SetPageLoaderNavLinks()}
      {/*============== Slider Area Start ==============*/}
      <div className="full-row p-0 overflow-hidden">
        <div
          id="slider"
          className="overflow-hidden"
          style={{
            width: 1200,
            height: 660,
            margin: "0 auto",
            marginBottom: 0,
          }}
        >
          {/* Slide 1*/}
          <div
            className="ls-slide"
            data-ls="bgsize:cover; bgposition:50% 50%; duration:4000; transition2d: 2,7,9; kenburnsscale:1.00;"
          >
            <img
              width={1920}
              height={960}
              src="./assets/images/banner-elc-payment.jpg"
              className="ls-bg"
              alt=""
            />
          </div>
          {/* Slide 2 */}
          <div
            className="ls-slide"
            data-ls="bgsize:cover; bgposition:50% 50%; duration:4000; transition2d: 2,7,9; kenburnsscale:1.00;"
          >
            <img
              width={1920}
              height={960}
              src="./assets/images/banner-elc-agreement.jpg"
              className="ls-bg"
              alt=""
            />
          </div>
          {/* Slide 3 */}
          <div
            className="ls-slide"
            data-ls="bgsize:cover; bgposition:50% 50%; duration:4000; transition2d: 2,7,9; kenburnsscale:1.00;"
          >
            <img
              width={1920}
              height={960}
              src="./assets/images/banner-bgv.jpg"
              className="ls-bg"
              alt=""
            />
          </div>
        </div>
      </div>
      {/*============== Slider Area End ==============*/}

      {/*============== Property Search Form Start ==============*/}
      <div className="full-row p-0" style={{ marginTop: "0px", zIndex: 99 }}>
        <div className="container-fluid">
          <div className="row">
            <div className="col px-0">
              <form
                className="bg-light shadow-sm quick-search py-4 px-5 form-icon-right position-relative"
                action="#"
                method="post"
              >
                <div className="row row-cols-lg-6 row-cols-md-3 row-cols-1 g-3">
                  <div className="col">
                    <input
                      type="text"
                      className="form-control"
                      name="keyword"
                      placeholder="Enter Keyword..."
                    />
                  </div>
                  <div className="col">
                    <select className="form-control">
                      <option>Property Types</option>
                      <option>House</option>
                      <option>Office</option>
                      <option>Appartment</option>
                      <option>Condos</option>
                      <option>Villa</option>
                      <option>Small Family</option>
                      <option>Single Room</option>
                    </select>
                  </div>
                  <div className="col">
                    <div className="position-relative">
                      <input
                        type="text"
                        className="form-control"
                        name="location"
                        placeholder="Location"
                      />
                      <i className="flaticon-placeholder flat-mini icon-font y-center text-dark" />
                    </div>
                  </div>
                  <div className="col">
                    <div className="position-relative">
                      <button
                        className="form-control price-toggle toggle-btn"
                        data-target="#data-range-price"
                      >
                        Price{" "}
                        <i className="fas fa-angle-down font-mini icon-font y-center text-dark" />
                      </button>
                      <div
                        id="data-range-price"
                        className="price_range price-range-toggle"
                      >
                        <div className="area-filter price-filter">
                          <span className="price-slider">
                            <input
                              className="filter_price"
                              type="text"
                              name="price"
                              defaultValue="0;10000000"
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="position-relative">
                      <button
                        className="form-control text-start toggle-btn"
                        data-target="#aditional-check"
                      >
                        Advanced{" "}
                        <i className="fas fa-ellipsis-v font-mini icon-font y-center text-dark" />
                      </button>
                    </div>
                  </div>
                  <div className="col">
                    <button className="btn btn-primary w-100">Search</button>
                  </div>
                  {/* Advance Features */}
                  <div id="aditional-check" className="aditional-features p-5">
                    <h5 className="mb-3">Aditional Options</h5>
                    <ul className="row row-cols-lg-4 row-cols-md-2 row-cols-1 custom-check-box mb-4">
                      <li className="col">
                        <input
                          type="checkbox"
                          className="custom-control-input hide"
                          id="customCheck1"
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="customCheck1"
                        >
                          Air Conditioning
                        </label>
                      </li>
                      <li className="col">
                        <input
                          type="checkbox"
                          className="custom-control-input hide"
                          id="customCheck2"
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="customCheck2"
                        >
                          Garage Facility
                        </label>
                      </li>
                      <li className="col">
                        <input
                          type="checkbox"
                          className="custom-control-input hide"
                          id="customCheck3"
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="customCheck3"
                        >
                          Swiming Pool
                        </label>
                      </li>
                      <li className="col">
                        <input
                          type="checkbox"
                          className="custom-control-input hide"
                          id="customCheck4"
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="customCheck4"
                        >
                          Fire Security
                        </label>
                      </li>
                      <li className="col">
                        <input
                          type="checkbox"
                          className="custom-control-input hide"
                          id="customCheck5"
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="customCheck5"
                        >
                          Fire Place Facility
                        </label>
                      </li>
                      <li className="col">
                        <input
                          type="checkbox"
                          className="custom-control-input hide"
                          id="customCheck6"
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="customCheck6"
                        >
                          Play Ground
                        </label>
                      </li>
                      <li className="col">
                        <input
                          type="checkbox"
                          className="custom-control-input hide"
                          id="customCheck7"
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="customCheck7"
                        >
                          Ferniture Include
                        </label>
                      </li>
                      <li className="col">
                        <input
                          type="checkbox"
                          className="custom-control-input hide"
                          id="customCheck8"
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="customCheck8"
                        >
                          Marbel Floor
                        </label>
                      </li>
                      <li className="col">
                        <input
                          type="checkbox"
                          className="custom-control-input hide"
                          id="customCheck9"
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="customCheck9"
                        >
                          Store Room
                        </label>
                      </li>
                      <li className="col">
                        <input
                          type="checkbox"
                          className="custom-control-input hide"
                          id="customCheck10"
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="customCheck10"
                        >
                          Hight Class Door
                        </label>
                      </li>
                      <li className="col">
                        <input
                          type="checkbox"
                          className="custom-control-input hide"
                          id="customCheck11"
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="customCheck11"
                        >
                          Floor Heating System
                        </label>
                      </li>
                      <li className="col">
                        <input
                          type="checkbox"
                          className="custom-control-input hide"
                          id="customCheck12"
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="customCheck12"
                        >
                          Garden Include
                        </label>
                      </li>
                    </ul>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/*============== Property Search Form End ==============*/}

      {/*============== Recent Property Start ==============*/}
      <div className="full-row bg-white pt-5 pb-5">
        <div className="container">
          <div className="row mb-5 align-items-center">
            <div className="col-md-8">
              <div className="me-auto">
                <h2 className="d-table mb-4 down-line">Recent Properties</h2>
                <span className="d-table sub-title text-secondary">
                  Mauris primis turpis Laoreet magna felis mi amet quam enim
                  curae. Sodales semper tempor dictum.
                </span>
              </div>
            </div>
            <div className="col-md-4">
              <a href="#" className="ms-auto btn-link d-table p y-2 sm-mx-0">
                View All Properties &gt;
              </a>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <div className="properties-carousel nav-disable owl-carousel">
                <div className="item">
                  <div className="property-grid-1 property-block bg-light transation-this">
                    <div className="overflow-hidden position-relative transation thumbnail-img bg-secondary hover-img-zoom">
                      <div className="cata position-absolute">
                        <span className="sale bg-secondary text-white">
                          For Sale
                        </span>
                      </div>
                      <a href="property-single-v1.html">
                        <img src="assets/images/property_grid/property-grid-1.png" />
                      </a>
                      <a href="#" className="listing-ctg text-white">
                        <i className="fa-solid fa-building" />
                        <span>Apartment</span>
                      </a>
                      <ul className="position-absolute quick-meta">
                        <li>
                          <a href="#" title="Add Favourite">
                            <i className="flaticon-like-1 flat-mini" />
                          </a>
                        </li>
                        <li className="md-mx-none">
                          <a
                            className="quick-view"
                            href="#quick-view"
                            title="Quick View"
                          >
                            <i className="flaticon-zoom-increasing-symbol flat-mini" />
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className="property_text p-3 pb-0">
                      <span className="listing-price">
                        $1850<small> ( Monthly )</small>
                      </span>
                      <h5 className="listing-title">
                        <a href="property-single-v1.html">
                          Family House Residense
                        </a>
                      </h5>
                      <span className="listing-location">
                        <i className="fas fa-map-marker-alt" /> 4213 South
                        Burlington, VT 05403
                      </span>
                    </div>
                    <div className="d-flex align-items-center post-meta mt-2 py-3 px-3 border-top">
                      <div className="agent">
                        <a
                          href="#"
                          className="d-flex text-general align-items-center"
                        >
                          <img
                            className="rounded-circle me-2"
                            src="assets/images/team/1.jpg"
                          />
                          <span>Ali Tufan</span>
                        </a>
                      </div>
                      <div className="post-date ms-auto">
                        <span>2 Month Ago</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="item">
                  <div className="property-grid-1 property-block bg-light transation-this">
                    <div className="overflow-hidden position-relative transation thumbnail-img bg-secondary hover-img-zoom">
                      <div className="cata position-absolute">
                        <span className="sale bg-secondary text-white">
                          For Sale
                        </span>
                      </div>
                      <a href="property-single-v1.html">
                        <img src="assets/images/property_grid/property-grid-1.png" />
                      </a>
                      <a href="#" className="listing-ctg text-white">
                        <i className="fa-solid fa-building" />
                        <span>Apartment</span>
                      </a>
                      <ul className="position-absolute quick-meta">
                        <li>
                          <a href="#" title="Add Favourite">
                            <i className="flaticon-like-1 flat-mini" />
                          </a>
                        </li>
                        <li className="md-mx-none">
                          <a
                            className="quick-view"
                            href="#quick-view"
                            title="Quick View"
                          >
                            <i className="flaticon-zoom-increasing-symbol flat-mini" />
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className="property_text p-3 pb-0">
                      <span className="listing-price">
                        $1850<small> ( Monthly )</small>
                      </span>
                      <h5 className="listing-title">
                        <a href="property-single-v1.html">
                          Family House Residense
                        </a>
                      </h5>
                      <span className="listing-location">
                        <i className="fas fa-map-marker-alt" /> 4213 South
                        Burlington, VT 05403
                      </span>
                    </div>
                    <div className="d-flex align-items-center post-meta mt-2 py-3 px-3 border-top">
                      <div className="agent">
                        <a
                          href="#"
                          className="d-flex text-general align-items-center"
                        >
                          <img
                            className="rounded-circle me-2"
                            src="assets/images/team/1.jpg"
                          />
                          <span>Ali Tufan</span>
                        </a>
                      </div>
                      <div className="post-date ms-auto">
                        <span>2 Month Ago</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="item">
                  <div className="property-grid-1 property-block bg-light transation-this">
                    <div className="overflow-hidden position-relative transation thumbnail-img bg-secondary hover-img-zoom">
                      <div className="cata position-absolute">
                        <span className="sale bg-secondary text-white">
                          For Sale
                        </span>
                      </div>
                      <a href="property-single-v1.html">
                        <img src="assets/images/property_grid/property-grid-1.png" />
                      </a>
                      <a href="#" className="listing-ctg text-white">
                        <i className="fa-solid fa-building" />
                        <span>Apartment</span>
                      </a>
                      <ul className="position-absolute quick-meta">
                        <li>
                          <a href="#" title="Add Favourite">
                            <i className="flaticon-like-1 flat-mini" />
                          </a>
                        </li>
                        <li className="md-mx-none">
                          <a
                            className="quick-view"
                            href="#quick-view"
                            title="Quick View"
                          >
                            <i className="flaticon-zoom-increasing-symbol flat-mini" />
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className="property_text p-3 pb-0">
                      <span className="listing-price">
                        $1850<small> ( Monthly )</small>
                      </span>
                      <h5 className="listing-title">
                        <a href="property-single-v1.html">
                          Family House Residense
                        </a>
                      </h5>
                      <span className="listing-location">
                        <i className="fas fa-map-marker-alt" /> 4213 South
                        Burlington, VT 05403
                      </span>
                    </div>
                    <div className="d-flex align-items-center post-meta mt-2 py-3 px-3 border-top">
                      <div className="agent">
                        <a
                          href="#"
                          className="d-flex text-general align-items-center"
                        >
                          <img
                            className="rounded-circle me-2"
                            src="assets/images/team/1.jpg"
                          />
                          <span>Ali Tufan</span>
                        </a>
                      </div>
                      <div className="post-date ms-auto">
                        <span>2 Month Ago</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="item">
                  <div className="property-grid-1 property-block bg-light transation-this">
                    <div className="overflow-hidden position-relative transation thumbnail-img bg-secondary hover-img-zoom">
                      <div className="cata position-absolute">
                        <span className="sale bg-secondary text-white">
                          For Sale
                        </span>
                      </div>
                      <a href="property-single-v1.html">
                        <img src="assets/images/property_grid/property-grid-1.png" />
                      </a>
                      <a href="#" className="listing-ctg text-white">
                        <i className="fa-solid fa-building" />
                        <span>Apartment</span>
                      </a>
                      <ul className="position-absolute quick-meta">
                        <li>
                          <a href="#" title="Add Favourite">
                            <i className="flaticon-like-1 flat-mini" />
                          </a>
                        </li>
                        <li className="md-mx-none">
                          <a
                            className="quick-view"
                            href="#quick-view"
                            title="Quick View"
                          >
                            <i className="flaticon-zoom-increasing-symbol flat-mini" />
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className="property_text p-3 pb-0">
                      <span className="listing-price">
                        $1850<small> ( Monthly )</small>
                      </span>
                      <h5 className="listing-title">
                        <a href="property-single-v1.html">
                          Family House Residense
                        </a>
                      </h5>
                      <span className="listing-location">
                        <i className="fas fa-map-marker-alt" /> 4213 South
                        Burlington, VT 05403
                      </span>
                    </div>
                    <div className="d-flex align-items-center post-meta mt-2 py-3 px-3 border-top">
                      <div className="agent">
                        <a
                          href="#"
                          className="d-flex text-general align-items-center"
                        >
                          <img
                            className="rounded-circle me-2"
                            src="assets/images/team/1.jpg"
                          />
                          <span>Ali Tufan</span>
                        </a>
                      </div>
                      <div className="post-date ms-auto">
                        <span>2 Month Ago</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="item">
                  <div className="property-grid-1 property-block bg-light transation-this">
                    <div className="overflow-hidden position-relative transation thumbnail-img bg-secondary hover-img-zoom">
                      <div className="cata position-absolute">
                        <span className="sale bg-secondary text-white">
                          For Sale
                        </span>
                      </div>
                      <a href="property-single-v1.html">
                        <img src="assets/images/property_grid/property-grid-1.png" />
                      </a>
                      <a href="#" className="listing-ctg text-white">
                        <i className="fa-solid fa-building" />
                        <span>Apartment</span>
                      </a>
                      <ul className="position-absolute quick-meta">
                        <li>
                          <a href="#" title="Add Favourite">
                            <i className="flaticon-like-1 flat-mini" />
                          </a>
                        </li>
                        <li className="md-mx-none">
                          <a
                            className="quick-view"
                            href="#quick-view"
                            title="Quick View"
                          >
                            <i className="flaticon-zoom-increasing-symbol flat-mini" />
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className="property_text p-3 pb-0">
                      <span className="listing-price">
                        $1850<small> ( Monthly )</small>
                      </span>
                      <h5 className="listing-title">
                        <a href="property-single-v1.html">
                          Family House Residense
                        </a>
                      </h5>
                      <span className="listing-location">
                        <i className="fas fa-map-marker-alt" /> 4213 South
                        Burlington, VT 05403
                      </span>
                    </div>
                    <div className="d-flex align-items-center post-meta mt-2 py-3 px-3 border-top">
                      <div className="agent">
                        <a
                          href="#"
                          className="d-flex text-general align-items-center"
                        >
                          <img
                            className="rounded-circle me-2"
                            src="assets/images/team/1.jpg"
                          />
                          <span>Ali Tufan</span>
                        </a>
                      </div>
                      <div className="post-date ms-auto">
                        <span>2 Month Ago</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="item">
                  <div className="property-grid-1 property-block bg-light transation-this">
                    <div className="overflow-hidden position-relative transation thumbnail-img bg-secondary hover-img-zoom">
                      <div className="cata position-absolute">
                        <span className="sale bg-secondary text-white">
                          For Sale
                        </span>
                      </div>
                      <a href="property-single-v1.html">
                        <img src="assets/images/property_grid/property-grid-1.png" />
                      </a>
                      <a href="#" className="listing-ctg text-white">
                        <i className="fa-solid fa-building" />
                        <span>Apartment</span>
                      </a>
                      <ul className="position-absolute quick-meta">
                        <li>
                          <a href="#" title="Add Favourite">
                            <i className="flaticon-like-1 flat-mini" />
                          </a>
                        </li>
                        <li className="md-mx-none">
                          <a
                            className="quick-view"
                            href="#quick-view"
                            title="Quick View"
                          >
                            <i className="flaticon-zoom-increasing-symbol flat-mini" />
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className="property_text p-3 pb-0">
                      <span className="listing-price">
                        $1850<small> ( Monthly )</small>
                      </span>
                      <h5 className="listing-title">
                        <a href="property-single-v1.html">
                          Family House Residense
                        </a>
                      </h5>
                      <span className="listing-location">
                        <i className="fas fa-map-marker-alt" /> 4213 South
                        Burlington, VT 05403
                      </span>
                    </div>
                    <div className="d-flex align-items-center post-meta mt-2 py-3 px-3 border-top">
                      <div className="agent">
                        <a
                          href="#"
                          className="d-flex text-general align-items-center"
                        >
                          <img
                            className="rounded-circle me-2"
                            src="assets/images/team/1.jpg"
                          />
                          <span>Ali Tufan</span>
                        </a>
                      </div>
                      <div className="post-date ms-auto">
                        <span>2 Month Ago</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="item">
                  <div className="property-grid-1 property-block bg-light transation-this">
                    <div className="overflow-hidden position-relative transation thumbnail-img bg-secondary hover-img-zoom">
                      <div className="cata position-absolute">
                        <span className="sale bg-secondary text-white">
                          For Sale
                        </span>
                      </div>
                      <a href="property-single-v1.html">
                        <img src="assets/images/property_grid/property-grid-1.png" />
                      </a>
                      <a href="#" className="listing-ctg text-white">
                        <i className="fa-solid fa-building" />
                        <span>Apartment</span>
                      </a>
                      <ul className="position-absolute quick-meta">
                        <li>
                          <a href="#" title="Add Favourite">
                            <i className="flaticon-like-1 flat-mini" />
                          </a>
                        </li>
                        <li className="md-mx-none">
                          <a
                            className="quick-view"
                            href="#quick-view"
                            title="Quick View"
                          >
                            <i className="flaticon-zoom-increasing-symbol flat-mini" />
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className="property_text p-3 pb-0">
                      <span className="listing-price">
                        $1850<small> ( Monthly )</small>
                      </span>
                      <h5 className="listing-title">
                        <a href="property-single-v1.html">
                          Family House Residense
                        </a>
                      </h5>
                      <span className="listing-location">
                        <i className="fas fa-map-marker-alt" /> 4213 South
                        Burlington, VT 05403
                      </span>
                    </div>
                    <div className="d-flex align-items-center post-meta mt-2 py-3 px-3 border-top">
                      <div className="agent">
                        <a
                          href="#"
                          className="d-flex text-general align-items-center"
                        >
                          <img
                            className="rounded-circle me-2"
                            src="assets/images/team/1.jpg"
                          />
                          <span>Ali Tufan</span>
                        </a>
                      </div>
                      <div className="post-date ms-auto">
                        <span>2 Month Ago</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="item">
                  <div className="property-grid-1 property-block bg-light transation-this">
                    <div className="overflow-hidden position-relative transation thumbnail-img bg-secondary hover-img-zoom">
                      <div className="cata position-absolute">
                        <span className="sale bg-secondary text-white">
                          For Sale
                        </span>
                      </div>
                      <a href="property-single-v1.html">
                        <img src="assets/images/property_grid/property-grid-1.png" />
                      </a>
                      <a href="#" className="listing-ctg text-white">
                        <i className="fa-solid fa-building" />
                        <span>Apartment</span>
                      </a>
                      <ul className="position-absolute quick-meta">
                        <li>
                          <a href="#" title="Add Favourite">
                            <i className="flaticon-like-1 flat-mini" />
                          </a>
                        </li>
                        <li className="md-mx-none">
                          <a
                            className="quick-view"
                            href="#quick-view"
                            title="Quick View"
                          >
                            <i className="flaticon-zoom-increasing-symbol flat-mini" />
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className="property_text p-3 pb-0">
                      <span className="listing-price">
                        $1850<small> ( Monthly )</small>
                      </span>
                      <h5 className="listing-title">
                        <a href="property-single-v1.html">
                          Family House Residense
                        </a>
                      </h5>
                      <span className="listing-location">
                        <i className="fas fa-map-marker-alt" /> 4213 South
                        Burlington, VT 05403
                      </span>
                    </div>
                    <div className="d-flex align-items-center post-meta mt-2 py-3 px-3 border-top">
                      <div className="agent">
                        <a
                          href="#"
                          className="d-flex text-general align-items-center"
                        >
                          <img
                            className="rounded-circle me-2"
                            src="assets/images/team/1.jpg"
                          />
                          <span>Ali Tufan</span>
                        </a>
                      </div>
                      <div className="post-date ms-auto">
                        <span>2 Month Ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*============== Recent Property End ==============*/}

      {/*============== Our Aminities Section Start ==============*/}
      <div className="full-row bg-light pt-5 pb-6">
        <div className="container">
          <div className="row">
            <div className="col">
              <h1 className="main-title w-50 mx-auto mb-4 text-center w-sm-100 base-line">
                What are you looking for?
              </h1>
            </div>
          </div>
          <div className="row row-cols-xl-4 row-cols-sm-2 row-cols-1 gy-5">
            <div className="col">
              <div className="service-style-1 text-center p-30 bg-white hover-bg-primary transation box-shadow h-100 rounded">
                <div className="icon-wrap">
                  <span className="icon flaticon-home flat-medium text-primary" />
                </div>
                <h6 className="title mb-1 font-400">
                  <a href="#" className="d-block text-secondary font-600 mt-3">
                    Living Houses
                  </a>
                </h6>
                <h6 className="title mb-3 font-400">
                  <a href="#" className="d-block text-secondary font-600 mt-0">
                    500+
                  </a>
                </h6>
                <a href="#" className="btn-icon box-shadow">
                  <i className="icon fas fa-long-arrow-alt-right" />
                </a>
              </div>
            </div>
            <div className="col">
              <div className="service-style-1 text-center p-30 bg-white hover-bg-primary transation box-shadow h-100 rounded">
                <div className="icon-wrap">
                  <span className="icon flaticon-online-booking flat-medium text-primary" />
                </div>
                <h6 className="title mb-1 font-400">
                  <a href="#" className="d-block text-secondary font-600 mt-3">
                    Apartments
                  </a>
                </h6>
                <h6 className="title mb-3 font-400">
                  <a href="#" className="d-block text-secondary font-600 mt-0">
                    200+
                  </a>
                </h6>
                <a href="#" className="btn-icon box-shadow">
                  <i className="icon fas fa-long-arrow-alt-right" />
                </a>
              </div>
            </div>
            <div className="col">
              <div className="service-style-1 text-center p-30 bg-white hover-bg-primary transation box-shadow h-100 rounded">
                <div className="icon-wrap">
                  <span className="icon flaticon-shop flat-medium text-primary" />
                </div>
                <h6 className="title mb-1 font-400">
                  <a href="#" className="d-block text-secondary font-600 mt-3">
                    Commercial
                  </a>
                </h6>
                <h6 className="title mb-3 font-400">
                  <a href="#" className="d-block text-secondary font-600 mt-0">
                    400+
                  </a>
                </h6>
                <a href="#" className="btn-icon box-shadow">
                  <i className="icon fas fa-long-arrow-alt-right" />
                </a>
              </div>
            </div>
            <div className="col">
              <div className="service-style-1 text-center p-30 bg-white hover-bg-primary transation box-shadow h-100 rounded">
                <div className="icon-wrap">
                  <span className="icon flaticon-shop flat-medium text-primary" />
                </div>
                <h6 className="title mb-1 font-400">
                  <a href="#" className="d-block text-secondary font-600 mt-3">
                    Office Space
                  </a>
                </h6>
                <h6 className="title mb-3 font-400">
                  <a href="#" className="d-block text-secondary font-600 mt-0">
                    300+
                  </a>
                </h6>
                <a href="#" className="btn-icon box-shadow">
                  <i className="icon fas fa-long-arrow-alt-right" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*============== Our Aminities Section End ==============*/}

      {/*============== Agents Start ==============*/}
      <div className="full-row bg-white pt-5 pb-5">
        <div className="container">
          <div className="row mb-5 align-items-center">
            <div className="col-md-8">
              <div className="me-auto">
                <h2 className="d-table mb-4 down-line">
                  Our Listed Property Agents
                </h2>
                <span className="d-table sub-title text-secondary">
                  Mauris primis turpis Laoreet magna felis mi amet quam enim
                  curae. Sodales semper tempor dictum.
                </span>
              </div>
            </div>
            <div className="col-md-4">
              <a href="#" className="ms-auto btn-link d-table p y-2 sm-mx-0">
                View All Agents &gt;
              </a>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <div className="agents-carousel nav-disable owl-carousel">
                <div className="item">
                  <div className="property-grid-1 property-block bg-light transation-this">
                    <div className="overflow-hidden position-relative transation thumbnail-img bg-secondary">
                      <a href="property-single-v1.html">
                        <img src="assets/images/property_grid/property-grid-1.png" />
                      </a>
                    </div>
                    <div className="d-flex align-items-top post-meta mt-2 py-2 px-2">
                      <div className="agent">
                        <h5 className="listing-title">
                          <a
                            href="property-single-v1.html"
                            className="text-primary"
                          >
                            Ronald Johnson
                          </a>
                        </h5>
                        <span className="listing-location">
                          At 1st April, 2012
                        </span>
                      </div>
                      <div className="post-date ms-auto">
                        <span className="text-primary rating-icon">
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-regular fa-star"></i>
                          <i className="fa-regular fa-star"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="item">
                  <div className="property-grid-1 property-block bg-light transation-this">
                    <div className="overflow-hidden position-relative transation thumbnail-img bg-secondary">
                      <a href="property-single-v1.html">
                        <img src="assets/images/property_grid/property-grid-1.png" />
                      </a>
                    </div>
                    <div className="d-flex align-items-top post-meta mt-2 py-2 px-2">
                      <div className="agent">
                        <h5 className="listing-title">
                          <a
                            href="property-single-v1.html"
                            className="text-primary"
                          >
                            Ronald Johnson
                          </a>
                        </h5>
                        <span className="listing-location">
                          At 1st April, 2012
                        </span>
                      </div>
                      <div className="post-date ms-auto">
                        <span className="text-primary rating-icon">
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-regular fa-star"></i>
                          <i className="fa-regular fa-star"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="item">
                  <div className="property-grid-1 property-block bg-light transation-this">
                    <div className="overflow-hidden position-relative transation thumbnail-img bg-secondary">
                      <a href="property-single-v1.html">
                        <img src="assets/images/property_grid/property-grid-1.png" />
                      </a>
                    </div>
                    <div className="d-flex align-items-top post-meta mt-2 py-2 px-2">
                      <div className="agent">
                        <h5 className="listing-title">
                          <a
                            href="property-single-v1.html"
                            className="text-primary"
                          >
                            Ronald Johnson
                          </a>
                        </h5>
                        <span className="listing-location">
                          At 1st April, 2012
                        </span>
                      </div>
                      <div className="post-date ms-auto">
                        <span className="text-primary rating-icon">
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-regular fa-star"></i>
                          <i className="fa-regular fa-star"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="item">
                  <div className="property-grid-1 property-block bg-light transation-this">
                    <div className="overflow-hidden position-relative transation thumbnail-img bg-secondary">
                      <a href="property-single-v1.html">
                        <img src="assets/images/property_grid/property-grid-1.png" />
                      </a>
                    </div>
                    <div className="d-flex align-items-top post-meta mt-2 py-2 px-2">
                      <div className="agent">
                        <h5 className="listing-title">
                          <a
                            href="property-single-v1.html"
                            className="text-primary"
                          >
                            Ronald Johnson
                          </a>
                        </h5>
                        <span className="listing-location">
                          At 1st April, 2012
                        </span>
                      </div>
                      <div className="post-date ms-auto">
                        <span className="text-primary rating-icon">
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-regular fa-star"></i>
                          <i className="fa-regular fa-star"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="item">
                  <div className="property-grid-1 property-block bg-light transation-this">
                    <div className="overflow-hidden position-relative transation thumbnail-img bg-secondary">
                      <a href="property-single-v1.html">
                        <img src="assets/images/property_grid/property-grid-1.png" />
                      </a>
                    </div>
                    <div className="d-flex align-items-top post-meta mt-2 py-2 px-2">
                      <div className="agent">
                        <h5 className="listing-title">
                          <a
                            href="property-single-v1.html"
                            className="text-primary"
                          >
                            Ronald Johnson
                          </a>
                        </h5>
                        <span className="listing-location">
                          At 1st April, 2012
                        </span>
                      </div>
                      <div className="post-date ms-auto">
                        <span className="text-primary rating-icon">
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-regular fa-star"></i>
                          <i className="fa-regular fa-star"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="item">
                  <div className="property-grid-1 property-block bg-light transation-this">
                    <div className="overflow-hidden position-relative transation thumbnail-img bg-secondary">
                      <a href="property-single-v1.html">
                        <img src="assets/images/property_grid/property-grid-1.png" />
                      </a>
                    </div>
                    <div className="d-flex align-items-top post-meta mt-2 py-2 px-2">
                      <div className="agent">
                        <h5 className="listing-title">
                          <a
                            href="property-single-v1.html"
                            className="text-primary"
                          >
                            Ronald Johnson
                          </a>
                        </h5>
                        <span className="listing-location">
                          At 1st April, 2012
                        </span>
                      </div>
                      <div className="post-date ms-auto">
                        <span className="text-primary rating-icon">
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-regular fa-star"></i>
                          <i className="fa-regular fa-star"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="item">
                  <div className="property-grid-1 property-block bg-light transation-this">
                    <div className="overflow-hidden position-relative transation thumbnail-img bg-secondary">
                      <a href="property-single-v1.html">
                        <img src="assets/images/property_grid/property-grid-1.png" />
                      </a>
                    </div>
                    <div className="d-flex align-items-top post-meta mt-2 py-2 px-2">
                      <div className="agent">
                        <h5 className="listing-title">
                          <a
                            href="property-single-v1.html"
                            className="text-primary"
                          >
                            Ronald Johnson
                          </a>
                        </h5>
                        <span className="listing-location">
                          At 1st April, 2012
                        </span>
                      </div>
                      <div className="post-date ms-auto">
                        <span className="text-primary rating-icon">
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-regular fa-star"></i>
                          <i className="fa-regular fa-star"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*============== Agents End ==============*/}

      {/*============== Counter Banner Start ==============*/}
      <div className="full-row bg-secondary py-0">
        <div className="container pt-3">
          <div className="fact-counter position-relative z-index-9">
            <div className="row row-cols-lg-4 row-cols-sm-2 row-cols-1">
              <div className="col">
                <div
                  className="my-30 text-center count wow fadeIn animate"
                  data-wow-duration="300ms"
                  style={{
                    visibility: "visible",
                    animationDuration: "300ms",
                    animationName: "fadeIn",
                  }}
                >
                  <i
                    className="text-white fa fa-building flat-medium"
                    aria-hidden="true"
                  ></i>
                  <h5 className="text-white font-400 pt-2">Properties</h5>
                  <span
                    className="count-num text-primary h2"
                    data-speed={3000}
                    data-stop={310}
                  >
                    310
                  </span>
                </div>
              </div>
              <div className="col">
                <div
                  className="my-30 text-center count wow fadeIn animate"
                  data-wow-duration="300ms"
                  style={{
                    visibility: "visible",
                    animationDuration: "300ms",
                    animationName: "fadeIn",
                  }}
                >
                  <i
                    className="text-white fa fa-users flat-medium"
                    aria-hidden="true"
                  ></i>
                  <h5 className="text-white font-400 pt-2">Owners</h5>
                  <span
                    className="count-num text-primary h2"
                    data-speed={3000}
                    data-stop={200}
                  >
                    200
                  </span>
                </div>
              </div>
              <div className="col">
                <div
                  className="my-30 text-center count wow fadeIn animate"
                  data-wow-duration="300ms"
                  style={{
                    visibility: "visible",
                    animationDuration: "300ms",
                    animationName: "fadeIn",
                  }}
                >
                  <i
                    className="text-white fa fa-users flat-medium"
                    aria-hidden="true"
                  ></i>
                  <h5 className="text-white font-400 pt-2">Agents</h5>
                  <span
                    className="count-num text-primary h2"
                    data-speed={3000}
                    data-stop={51}
                  >
                    51
                  </span>
                </div>
              </div>
              <div className="col">
                <div
                  className="my-30 text-center count wow fadeIn animate"
                  data-wow-duration="300ms"
                  style={{
                    visibility: "visible",
                    animationDuration: "300ms",
                    animationName: "fadeIn",
                  }}
                >
                  <i
                    className="text-white fa fa-users flat-medium"
                    aria-hidden="true"
                  ></i>
                  <h5 className="text-white font-400 pt-2">Tenants</h5>
                  <span
                    className="count-num text-primary h2"
                    data-speed={3000}
                    data-stop={25}
                  >
                    25
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*============== Counter Banner End ==============*/}

      {/*============== Testimonials Start ==============*/}
      <div className="full-row bg-light pt-5 pb-5">
        <div className="container-fluid">
          <div className="row">
            <div className="col mb-3">
              <span className="text-primary tagline pb-2 d-table m-auto">
                Testimonials
              </span>
              <h2 className="down-line w-50 mx-auto mb-4 text-center w-sm-100">
                What Client Says About Us
              </h2>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-lg-7">
              <div className="testimonial-simple text-center px-5">
                <div className="testimonial-carousel owl-carousel">
                  <div className="item">
                    <i className="flaticon-right-quote flat-large text-primary d-table mx-auto" />
                    <blockquote className="text-secondary fs-5 fst-italic">
                      “ Assetswatch saves time in processing rental payments and
                      I'm always sure that the rent is paid every month.I love
                      the "split the rent option" so I'm going to sign up my
                      roommates too. ”
                    </blockquote>
                    <h4 className="mt-4 font-400">Mark Wiggins</h4>
                    <span className="text-primary font-fifteen">
                      CEO ( AssetsWatch )
                    </span>
                  </div>
                  <div className="item">
                    <i className="flaticon-right-quote flat-large text-primary d-table mx-auto" />
                    <blockquote className="text-secondary fs-5 fst-italic">
                      “ I must say that I've been looking for such program for
                      long. Only one rental application! That's just perfect, no
                      need to refill it each time you move. ”
                    </blockquote>
                    <h4 className="mt-4 font-400">Kiran</h4>
                    <span className="text-primary font-fifteen">
                      MANAGER ( Kansolve Technologies )
                    </span>
                  </div>
                  <div className="item">
                    <i className="flaticon-right-quote flat-large text-primary d-table mx-auto" />
                    <blockquote className="text-secondary fs-5 fst-italic">
                      “ Assetswatch saves time in processing rental payments and
                      I'm always sure that the rent is paid every month.I love
                      the "split the rent option" so I'm going to sign up my
                      roommates too! ”
                    </blockquote>
                    <h4 className="mt-4 font-400">Manoj</h4>
                    <span className="text-primary font-fifteen">
                      CTO ( Eyegate Parking Solutions )
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*============== Testimonials End ==============*/}
    </>
  );
};

export default PrivacyPolicy;
