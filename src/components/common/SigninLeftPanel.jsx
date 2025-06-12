import { useLayoutEffect } from "react";
import { getArrLoadFiles, loadFile, unloadFile } from "../../utils/loadFiles";

export default function SigninLeftPanel() {
  let $ = window.$;
  let arrJsCssFiles = [
    {
      dir: "../../assets/js/",
      pos: "body",
      type: "js",
      files: ["owl.js"],
    },
  ];

  useLayoutEffect(() => {
    let arrLoadFiles = getArrLoadFiles(arrJsCssFiles);
    let promiseLoadFiles = arrLoadFiles.map(loadFile);
    Promise.allSettled(promiseLoadFiles).then(function (responses) {
      $(".left-panel-cnt")?.owlCarousel({
        loop: false,
        nav: false,
        dots: true,
        smartSpeed: 500,
        autoplay: false,
        margin: 24,
        items: 1,
      });
    });

    return () => {
      unloadFile(arrJsCssFiles);
    };
  }, []);

  return (
    <div className="col-md-6 d-none d-md-flex left-panel justify-content-center pb-2">
      <div className="w-100">
        <div className="mb-0">
          <h5>Welcome Back!</h5>
          <p className="text-muted mb-0">
            Log in to manage your properties, track leads, and connect with
            owners, agents, and tenants — all in one place.
          </p>
        </div>
        <div className="owl-carousel left-panel-cnt dots-mt-10">
          <div className="item mb-0">
            <div className="feature-item">
              <i className="fa fa-home font-extra-large me-3"></i>
              <div>
                <h6 className="mb-1 font-600 font-18">
                  Properties, Maintenance & Applications
                </h6>
                <p className="mb-0 mb-0 lh-22 font-general">
                  List properties, manage lease and loan applications, schedule
                  maintenance, track repairs, and coordinate with vendors — all
                  from a centralized, intuitive dashboard.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <i className="fa fa-credit-card font-extra-large me-3"></i>
              <div>
                <h6 className="mb-1 font-600 font-18">
                  Electronic Payments & Invoicing
                </h6>
                <p className="mb-0 mb-0 lh-22 font-general">
                  Accept rent online, send invoices, and automate reminders with
                  secure payments and instant receipts.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <i className="fa fa-file-signature font-extra-large me-3"></i>
              <div>
                <h6 className="mb-1 font-600 font-18">
                  Electronic Agreements, Signatures & Document Management
                </h6>
                <p className="mb-0 mb-0 lh-22 font-general">
                  Create, sign, and securely store rental agreements with
                  legally binding electronic signatures. Manage all
                  property-related documents in a secure digital vault.
                </p>
              </div>
            </div>

            <div className="feature-item mb-1">
              <i className="fa fa-user-shield font-extra-large me-3"></i>
              <div>
                <h6 className="mb-1 font-600 font-18">
                  Background Verification
                </h6>
                <p className="mb-0 mb-0 lh-22 font-general">
                  Screen tenants quickly with automated background checks.
                  Includes identity validation, credit history, and red flags.
                </p>
              </div>
            </div>
          </div>
          <div className="item  mb-0">
            <div className="feature-item">
              <i className="fa fa-people-group font-extra-large me-3"></i>
              <div>
                <h6 className="mb-1 font-600 font-18">
                  Connections & Messaging
                </h6>
                <p className="mb-0 mb-0 lh-22 font-general">
                  Connect owners, agents, and tenants instantly with shared
                  tasks, document access, and role-based controls. Communicate
                  seamlessly via built-in messaging — all in one platform.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <i className="fa fa-palette font-extra-large me-3"></i>
              <div>
                <h6 className="mb-1 font-600 font-18">Branding Management</h6>
                <p className="mb-0 mb-0 lh-22 font-general">
                  Tailor the platform with your logo, colors, and company
                  identity for a fully branded experience across portals,
                  emails, and documents.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <i className="fa fa-mobile-screen font-extra-large me-3"></i>
              <div>
                <h6 className="mb-1 font-600 font-18">
                  Mobile Access Anytime, Anywhere
                </h6>
                <p className="mb-0 mb-0 lh-22 font-general">
                  Manage everything on the go with full-feature access via iOS
                  and Android apps — stay connected, anytime, anywhere.
                </p>
              </div>
            </div>

            <div className="feature-item mb-0">
              <i className="fa fa-chart-simple font-extra-large me-3"></i>
              <div>
                <h6 className="mb-1 font-600 font-18">Analytics & Reports</h6>
                <p className="mb-0 mb-0 lh-22 font-general">
                  Gain insights with real-time analytics on rent collection,
                  occupancy, maintenance performance, and lead tracking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
