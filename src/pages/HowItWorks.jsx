import React, { useState } from "react";
import { routeNames } from "../routes/routes";
import { SetPageLoaderNavLinks } from "../utils/common";
import PageTitle from "../components/layouts/PageTitle";

const HowItWorks = () => {
  const [activePanel, setActivePanel] = useState(null);

  const togglePanel = (index) => {
    setActivePanel(activePanel === index ? null : index);
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      {/*============== Page title Start ==============*/}
      <PageTitle
        title="How It Works"
        navLinks={[{ title: "Home", url: routeNames.home.path }]}
      ></PageTitle>
      {/*============== Page title End ==============*/}
      {/*============== Start ==============*/}
      <div className="full-row bg-gray">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 mb-5">
              <h3 className="mb-4 text-center w-50 w-sm-100 mx-auto down-line">
                Our Motivation
              </h3>
              <span className="text-secondary w-75 d-table text-center w-sm-100 mx-auto pb-4">
                We are making a transparent platform or bridge between Owner,
                Agent, and Tenant. Easy and hassle-free property management
                dashboard for all customers.
              </span>
            </div>
          </div>
          <div className="col-lg-12 mb-5 text-center ">
            <img
              src="assets/images/HowItWorks/overview.142cccaf.png"
              alt="Overview"
            />
          </div>
          <div className="row">
            <div className="col-lg-12 mb-5">
              <h3 className="mb-4 text-center w-50 w-sm-100 mx-auto down-line">
                Quick Overview of AssetsWatch
              </h3>
              <span className="text-secondary w-75 d-table text-center w-sm-100 mx-auto pb-4">
                Have a quick overview of the application to understand more.
              </span>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12 mb-5">
              {/* Collapse Section */}
              <div className="simple-collaps px-4 py-3 bg-white border rounded mb-3">
                <span
                  className="accordion text-primary d-block cursor-pointer"
                  onClick={() => togglePanel(1)}
                >
                  How to register?
                </span>
                <div
                  className="panel"
                  style={{
                    maxHeight: activePanel === 1 ? "1700px" : "0px", // Set a reasonable max height for open state
                    overflow: "hidden", // Hide content when collapsed
                    transition: "max-height 0.3s ease", // Smooth transition
                  }}
                >
                  <div className="p-3">
                    <span className="mb-d-table sub-title full-row footer-default-dark bg-footer text-white font-400 p-3">
                      How to register as an Owner?
                    </span>
                    <div>
                      <img
                        src="assets\images\HowItWorks\registration-owner.9fb861ea.png"
                        alt="Overview"
                      />
                    </div>
                    <span className="mb-d-table sub-title full-row footer-default-dark bg-footer text-white font-400 p-3">
                      How to register as an Agent?
                    </span>
                    <div>
                      <img
                        src="assets\images\HowItWorks\registration-agent.1ddb112d.png"
                        alt="Overview"
                      />
                    </div>
                    <span className="mb-d-table sub-title full-row footer-default-dark bg-footer text-white font-400 p-3">
                      How to register as an Tenant?
                    </span>
                    <div>
                      <img
                        src="assets\images\HowItWorks\registration-tenant.04a6d24f.png"
                        alt="Overview"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="simple-collaps px-4 py-3 bg-white border rounded mb-3">
                <span
                  className="accordion text-primary d-block cursor-pointer"
                  onClick={() => togglePanel(2)}
                >
                  Owner Features
                </span>
                <div
                  className="panel"
                  style={{
                    maxHeight: activePanel === 2 ? "5000px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.1s ease",
                  }}
                >
                  <div className="p-3">
                    <span className="mb-d-table sub-title full-row footer-default-dark bg-footer text-white font-400 p-3">
                      How to add a Property?
                    </span>
                    <div>
                      <img
                        src="assets\images\HowItWorks\Add-property.61bad08e.png"
                        alt="Overview"
                      />
                    </div>
                    <span className="mb-d-table sub-title full-row footer-default-dark bg-footer text-white font-400 p-3">
                      How to find Agents?
                    </span>
                    <div>
                      <img
                        src="assets\images\HowItWorks\owner-invite-find-agent.c9fc7a96.png"
                        alt="Overview"
                      />
                    </div>
                    <span className="mb-d-table sub-title full-row footer-default-dark bg-footer text-white font-400 p-3">
                      How to find Tenants?
                    </span>
                    <div>
                      <img
                        src="assets\images\HowItWorks\owner-invite-find-tenant.e2b437c8.png"
                        alt="Overview"
                      />
                    </div>
                    <span className="mb-d-table sub-title full-row footer-default-dark bg-footer text-white font-400 p-3">
                      Smart Agreement
                    </span>
                    <div>
                      <img
                        src="assets\images\HowItWorks\smart-agreement.18dd592c.png"
                        alt="Overview"
                      />
                    </div>
                    <span className="mb-d-table sub-title full-row footer-default-dark bg-footer text-white font-400 p-3">
                      Initiate a property contract
                    </span>
                    <div>
                      <img
                        src="assets\images\HowItWorks\owner-initiate-property-contract.5e04abb4.png"
                        alt="Overview"
                      />
                    </div>
                    <span className="mb-d-table sub-title full-row footer-default-dark bg-footer text-white font-400 p-3">
                      Create Merchent Account for payment receive.
                    </span>
                    <div>
                      <img
                        src="assets\images\HowItWorks\merchant-owner.0f2a7c79.png"
                        alt="Overview"
                      />
                    </div>
                    <span className="mb-d-table sub-title full-row footer-default-dark bg-footer text-white font-400 p-3">
                      Check Background screening for Agent & Tenant
                    </span>
                    <div>
                      <img
                        src="assets\images\HowItWorks\owner-agent-bgv.b147f196.png"
                        alt="Overview"
                      />
                      <img
                        src="assets\images\HowItWorks\owner-tenant-bgv.b9198347.png"
                        alt="Overview"
                      />
                    </div>
                    <span className="mb-d-table sub-title full-row footer-default-dark bg-footer text-white font-400 p-3">
                      Send Message to Agent/Tenant
                    </span>
                    <div>
                      <img
                        src="assets\images\HowItWorks\send-sms-owner-agent.e8eb9619.png"
                        alt="Overview"
                      />
                      <img
                        src="assets\images\HowItWorks\send-sms-owner-tenant.4567ab50.png"
                        alt="Overview"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="simple-collaps px-4 py-3 bg-white border rounded mb-3">
                <span
                  className="accordion text-primary d-block cursor-pointer"
                  onClick={() => togglePanel(3)}
                >
                  Agent Features
                </span>
                <div
                  className="panel"
                  style={{
                    maxHeight: activePanel === 3 ? "5000px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.3s ease",
                  }}
                >
                  <div className="p-3">
                    <span className="mb-d-table sub-title full-row footer-default-dark bg-footer text-white font-400 p-3">
                      How to find Owners?
                    </span>
                    <div>
                      <img
                        src="assets\images\HowItWorks\agent-invite-find-owners.d66992e6.png"
                        alt="Overview"
                      />
                    </div>
                    <span className="mb-d-table sub-title full-row footer-default-dark bg-footer text-white font-400 p-3">
                      How to find Tenants?
                    </span>
                    <div>
                      <img
                        src="assets\images\HowItWorks\agent-invite-find-tenant.7dac4059.png"
                        alt="Overview"
                      />
                    </div>
                    <span className="mb-d-table sub-title full-row footer-default-dark bg-footer text-white font-400 p-3">
                      Smart Agreement
                    </span>
                    <div>
                      <img
                        src="assets\images\HowItWorks\smart-agreement.18dd592c.png"
                        alt="Overview"
                      />
                    </div>
                    <span className="mb-d-table sub-title full-row footer-default-dark bg-footer text-white font-400 p-3">
                      Agreement Flow
                    </span>
                    <div>
                      <img
                        src="assets\images\HowItWorks\agreement_flow.75978139.png"
                        alt="Overview"
                      />
                    </div>
                    <span className="mb-d-table sub-title full-row footer-default-dark bg-footer text-white font-400 p-3">
                      Initiate a property contract
                    </span>
                    <div>
                      <img
                        src="assets\images\HowItWorks\agent-initiate-property-contract.a7773cf6.png"
                        alt="Overview"
                      />
                    </div>
                    <span className="mb-d-table sub-title full-row footer-default-dark bg-footer text-white font-400 p-3">
                      Create Merchent Account for payment receive.
                    </span>
                    <div>
                      <img
                        src="assets\images\HowItWorks\merchant-agent.02ca2b1d.png"
                        alt="Overview"
                      />
                    </div>
                    <span className="mb-d-table sub-title full-row footer-default-dark bg-footer text-white font-400 p-3">
                      Check Background screening for Tenant
                    </span>
                    <div>
                      <img
                        src="assets\images\HowItWorks\agent-tenant-bgv.0f440482.png"
                        alt="Overview"
                      />
                    </div>
                    <span className="mb-d-table sub-title full-row footer-default-dark bg-footer text-white font-400 p-3">
                      Send Message to Owner/Tenant
                    </span>
                    <div>
                      <img
                        src="assets\images\HowItWorks\send-sms-agent-owner.a3c0fbd1.png"
                        alt="Overview"
                      />
                      <img
                        src="assets\images\HowItWorks\send-sms-agent-tenant.d50ecf96.png"
                        alt="Overview"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="simple-collaps px-4 py-3 bg-white border rounded mb-3">
                <span
                  className="accordion text-primary d-block cursor-pointer"
                  onClick={() => togglePanel(4)}
                >
                  Tenant Features
                </span>
                <div
                  className="panel"
                  style={{
                    maxHeight: activePanel === 4 ? "4000px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.3s ease",
                  }}
                >
                  <div className="p-3">
                    <span className="mb-d-table sub-title full-row footer-default-dark bg-footer text-white font-400 p-3">
                      How to find Agents?
                    </span>
                    <div>
                      <img
                        src="assets\images\HowItWorks\tenant-invite-find-agents.afc8b4a6.png"
                        alt="Overview"
                      />
                    </div>
                    <span className="mb-d-table sub-title full-row footer-default-dark bg-footer text-white font-400 p-3">
                      How to find Owners?
                    </span>
                    <div>
                      <img
                        src="assets\images\HowItWorks\tenant-invite-find-owners.a3d4b3c4.png"
                        alt="Overview"
                      />
                    </div>
                    <span className="mb-d-table sub-title full-row footer-default-dark bg-footer text-white font-400 p-3">
                      Send Message to Owner/Agent
                    </span>
                    <div>
                      <img
                        src="assets\images\HowItWorks\send-sms-tenant-agent.d19a8a0d.png"
                        alt="Overview"
                      />
                      <img
                        src="assets\images\HowItWorks\send-sms-tenant-owner.85aa0128.png"
                        alt="Overview"
                      />
                    </div>
                    <span className="mb-d-table sub-title full-row footer-default-dark bg-footer text-white font-400 p-3">
                      Smart Signature
                    </span>
                    <div>
                      <img
                        src="assets\images\HowItWorks\smart-sign-tenant.2bada295.png"
                        alt="Overview"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*============== End ==============*/}
    </>
  );
};

export default HowItWorks;
