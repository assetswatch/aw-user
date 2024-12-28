import React from "react";
import { Link } from "react-router-dom";
import { routeNames } from "../routes/routes";
import PageTitle from "../components/layouts/PageTitle";

const AddProfiles = () => {
  const profiles = [
    { name: "Owner", icon: "fa-user-circle" },
    { name: "Agent", icon: "fa-user-circle" },
    { name: "Tenant", icon: "fa-user-circle" },
  ];

  return (
    <>
      {/*============== Page title Start ==============*/}
      <PageTitle
        title="Add Profile"
        navLinks={[{ title: "Home", url: routeNames.home.path }]}
      ></PageTitle>
      {/*============== Page title End ==============*/}

      <div className="full-row  bg-light">
        <div className="container">
          <div className="row mx-auto col-lg-8 shadow">
            <div className="bg-white xs-p-20 p-30 pb-30 border rounded">
              <h4 className="mb-4 down-line">Add Profile</h4>
              <div className="row row-cols-lg-3 pt-10 pb-0 row-cols-1 g-4 flex-center">
                {profiles.map((profile, idx) => (
                  <div className="col" key={idx}>
                    <div className="text-center px-4 py-10">
                      <div>
                        <Link>
                          <i
                            className={`fa ${profile.icon} fa-5x max-100 rounded-circle shadow`}
                          ></i>
                        </Link>
                      </div>
                      <div className="mt-3">
                        <span className="transation font-500">
                          <Link>{profile.name}</Link>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddProfiles;
