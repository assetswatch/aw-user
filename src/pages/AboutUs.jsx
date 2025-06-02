import React, { useEffect } from "react";
import { loadFile, unloadFile, getArrLoadFiles } from "../utils/loadFiles";
import { SetPageLoaderNavLinks } from "../utils/common";
import PageTitle from "../components/layouts/PageTitle";
import { routeNames } from "../routes/routes";

const AboutUs = () => {
  let $ = window.$;

  //list of js/css dependencies.
  let arrJsCssFiles = [
    {
      dir: "./assets/js/",
      pos: "body",
      type: "js",
      files: ["owl.js"],
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
      // Testimonials carousel
      if ($(".testimonial-carousel").length) {
        $(".testimonial-carousel")?.owlCarousel({
          loop: true,
          margin: 30,
          nav: true,
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
    } catch (e) {
      console.error(e.message);
    }
  }

  return (
    <>
      {SetPageLoaderNavLinks()}
      {/*============== Page Banner Start ==============*/}
      {/* <div className="page-banner-simple footer-default-dark bg-footer py-3 div-page-title">
        <div className="container">
          <div className="row">
            <div className="col-lg-10">
              <h5 className="banner-title text-white">Who We Are</h5>
              <span className="banner-tagline font-medium text-white">
                <h6 className="text-white">
                  “Don’t wait to buy a property, buy a property and then wait.”
                  – Will Rogers{" "}
                </h6>
                We want to change the way people buy Properties.
              </span>
            </div>
          </div>
        </div>
      </div> */}
      <PageTitle
        title="About US"
        navLinks={[{ title: "Home", url: routeNames.home.path }]}
      ></PageTitle>
      {/*============== Page Banner End ==============*/}

      {/*============== Features Start ==============*/}
      <div className="full-row pt-4 pb-0">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="text-secondary mb-5">
                <span className="tagline-2 text-primary">What is AWS?</span>
                <p>
                  Are you looking to buy a New Property or want to take rent a
                  property if facing difficulty in getting the
                  Agreement/Paperwork done? Then you are at the right place! We
                  are a one-stop destination for all your Property and other
                  management needs online.
                </p>
                <p>
                  We provide Property Listing, Property Management, Asset
                  Management, Warranty Services and all other property related
                  services. We always have an expert with the right knowledge to
                  advice you across all property sectors,so that you make the
                  right property decisions.
                </p>
                <p>
                  We look for long-term relationships with our Customers and
                  offer a personalized service to ensure our Customers
                  individual needs are met. We pride ourselves on our great
                  customer service and believe that our service, both before and
                  after the sale, is the best.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*============== Features End ==============*/}

      {/*============== Why Us Start ==============*/}
      <div className="full-row bg-light pt-4 pb-4">
        <div className="container">
          <div className="row">
            <div className="col">
              <h3 className="main-title w-50 mx-auto mb-4 text-center w-sm-100 base-line down-line pb-10">
                Why US?
              </h3>
            </div>
          </div>
          <div className="row row-cols-lg-3 row-cols-1 g-4">
            <div className="col">
              <div className="text-center p-4">
                <div className="box-100px rounded-circle p-4 mx-auto bg-primary mb-4">
                  <i className="flaticon-id-card text-white flat-medium" />
                </div>
                <h4 className="mb-3 font-400">Verified Listings</h4>
                <p>
                  We provide you a verified list of properties to choose from.
                </p>
              </div>
            </div>
            <div className="col">
              <div className="text-center p-4">
                <div className="box-100px rounded-circle p-4 mx-auto bg-primary mb-4">
                  <i className="flaticon-data text-white flat-medium" />
                </div>
                <h4 className="mb-3 font-400">Ease of Booking</h4>
                <p>
                  Book your Property and other Management services with just a
                  single click!
                </p>
              </div>
            </div>
            <div className="col">
              <div className="text-center p-4">
                <div className="box-100px rounded-circle p-4 mx-auto bg-primary mb-4">
                  <i className="flaticon-life-insurance text-white flat-medium" />
                </div>
                <h4 className="mb-3 font-400">Safe & Secure</h4>
                <p>
                  We promise to provide you secure Contract & Warranty services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*============== WhyUs End ==============*/}

      {/*============== Our services Start ==============*/}
      <div className="full-row bg-white pt-4 pb-4">
        <div className="container">
          <div className="row">
            <div className="col text-center">
              <h3 className="main-title w-50 mx-auto mb-4 text-center w-sm-100 base-line down-line pb-10">
                Our Services
              </h3>
              Assetswatch offers a great marketplace so you can grow your
              business.
            </div>
          </div>
          <div className="row row-cols-lg-2 row-cols-1 g-4">
            <div className="col">
              <div className="text-center p-4">
                <div className="box-100px rounded-circle p-4 mx-auto bg-primary mb-4">
                  <i className="flaticon-search text-white flat-medium" />
                </div>
                <h4 className="mb-3 font-400">Property Search</h4>
                <p>
                  Users can select from millions of Verified Properties & Agents
                  listed on our online portal.
                </p>
              </div>
            </div>
            <div className="col">
              <div className="text-center p-4">
                <div className="box-100px rounded-circle p-4 mx-auto bg-primary mb-4">
                  <i className="flaticon-home text-white flat-medium" />
                </div>
                <h4 className="mb-3 font-400">Property Management</h4>
                <p>
                  Users also have access to management services such as
                  Paper-less Agreement management, Warranty services, Background
                  verification of users and more.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*============== Our services End ==============*/}

      {/*============== Testimonials Start ==============*/}
      <div className="full-row bg-light pt-4 pb-6">
        <div className="container">
          <div className="row">
            <div className="col-lg-9 mx-auto position-relative">
              <span className="tagline text-primary">Testimonials</span>
              <h4 className="mb-5">
                <span className="font-weight-bold">
                  What People Says About Us
                </span>
              </h4>
              <div className="testimonial-carousel owl-carousel single-carusel testimonial-slider dot-disable position-static">
                <div className="testimonial-item font-medium">
                  <span className="flaticon-right-quote quote-icon flat-medium text-primary" />
                  <p>
                    “ Assetswatch saves time in processing rental payments and
                    I'm always sure that the rent is paid every month.I love the
                    "split the rent option" so I'm going to sign up my roommates
                    too. ”
                  </p>
                  <span className="name text-secondary h6 font-weight-medium mt-4 d-table">
                    Gilbert E. Lyons, CEO AssetsWatch
                  </span>
                </div>
                <div className="testimonial-item font-medium">
                  <span className="flaticon-right-quote quote-icon flat-medium text-primary" />
                  <p>
                    I must say that I've been looking for such program for long.
                    Only one rental application! That's just perfect, no need to
                    refill it each time you move.
                  </p>
                  <span className="name text-secondary h6 font-weight-medium mt-4 d-table">
                    Kiran, MANAGER Kansolve Technologies
                  </span>
                </div>
                <div className="testimonial-item font-medium">
                  <span className="flaticon-right-quote quote-icon flat-medium text-primary" />
                  <p>
                    Assetswatch saves time in processing rental payments and I'm
                    always sure that the rent is paid every month.I love the
                    "split the rent option" so I'm going to sign up my roommates
                    too!
                  </p>
                  <span className="name text-secondary h6 font-weight-medium mt-4 d-table">
                    Manoj, CTO Eyegate Parking Solutions
                  </span>
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

export default AboutUs;
