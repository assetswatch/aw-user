import React from "react";
import { SetPageLoaderNavLinks } from "../utils/common";
import PageTitle from "../components/layouts/PageTitle";
import { routeNames } from "../routes/routes";

const PrivacyPolicy = () => {
  return (
    <>
      {/*============== Page title Start ==============*/}
      <PageTitle
        title="Privacy Policy"
        navLinks={[{ title: "Home", url: routeNames.home.path }]}
      ></PageTitle>
      {/*============== Page title End ==============*/}

      <div className="full-row pt-4 pb-5">
        <div className="container">
          <div className="p-0">
            <h6 className="text-primary">
              <strong>Last Modified:</strong>
            </h6>

            <p>
              This privacy policy sets out how{" "}
              <strong className="text-primary">Assets Watch</strong> uses and
              protects any information that you give{" "}
              <strong className="text-primary">Assets Watch</strong> when you
              use this website.
            </p>

            <p>
              <strong className="text-primary">Assets Watch</strong> is
              committed to ensuring that your privacy is protected. Should we
              ask you to provide certain information by which you can be
              identified when using this website, then you can be assured that
              it will only be used in accordance with this privacy statement.
            </p>

            <p>
              <strong className="text-primary">Assets Watch</strong> may change
              this policy from time to time by updating this page. You should
              check this page from time to time to ensure that you are happy
              with any changes.This policy is effective from December 2nd, 2018.
            </p>

            <h6 className="text-primary">Information We Require</h6>

            <p>We require and collect the following information:</p>

            <ul className="pb-20">
              <li>Email address in order to set up an account</li>
              <li>IP address in order to verify location</li>
            </ul>

            <h6 className="text-primary">Information We Store</h6>

            <p>We store the following information:</p>

            <ul className="pb-20">
              <li>
                Demographic information such as postcode, preferences, and
                interests
              </li>
              <li>
                Other information relevant to customer surveys and/or offers
              </li>
              <li>IP address, device type, and web browser</li>
              <li>Time and date of login and use</li>
            </ul>

            <h6 className="text-primary">
              What We Do with the Information We Gather
            </h6>

            <p>
              We require this information to understand your needs and provide
              you with a better service, and in particular for the following
              reasons:
            </p>

            <ul className="pb-20">
              <li>
                Payment and transaction-based fraud prevention, which is to help
                protect you, your tenants, owners, service professionals you
                engage with and other{" "}
                <strong className="text-primary">Assets Watch</strong> users.
              </li>
              <li>
                Listing fraud prevention, which helps protect your listing from
                others copying or stealing the listing in order to prey on
                unsuspecting applicants.
              </li>
              <li>Internal record keeping.</li>
              <li>
                We may use the information to improve our products and services.
              </li>
              <li>
                We may periodically send promotional emails about new products,
                special offers, or other information which we think you may find
                interesting using the email address which you have provided.
              </li>
              <li>
                From time to time, we may also use your information to contact
                you for market research purposes. We may contact you by email,
                phone, fax, or mail.
              </li>
              <li>
                We may use the information to customise the website according to
                your interests.
              </li>
            </ul>

            <h6 className="text-primary">Security</h6>
            <p>
              We are committed to ensuring that your information is secure. In
              order to prevent unauthorized access or disclosure, we have put in
              place suitable physical, electronic, and managerial procedures to
              safeguard and secure the information we collect online.
            </p>

            <h6 className="text-primary">How We Use Cookies</h6>
            <p>
              A cookie is a small file which asks permission to be placed on
              your computer's hard drive. Once you agree, the file is added and
              the cookie helps analyse web traffic or lets you know when you
              visit a particular site. Cookies allow web applications to respond
              to you as an individual. The web application can tailor its
              operations to your needs, likes, and dislikes by gathering and
              remembering information about your preferences.
            </p>

            <p>
              We use traffic log cookies to identify which pages are being used.
              This helps us analyse data about web page traffic and improve our
              website in order to tailor it to customer needs. We only use this
              information for statistical analysis purposes and then the data is
              removed from the system.
            </p>

            <p>
              Overall, cookies help us provide you with a better website
              experience, by enabling us to monitor which pages you find useful
              and which you do not. A cookie in no way gives us access to your
              computer or any information about you, other than the data you
              choose to share with us.
            </p>

            <p>
              You can choose to accept or decline cookies. Most web browsers
              automatically accept cookies, but you can usually modify your
              browser setting to decline cookies if you prefer. This may prevent
              you from taking full advantage of the website.
            </p>

            <h6 className="text-primary">Links to Other Websites</h6>
            <p>
              Our website may contain links to enable you to visit other
              websites of interest easily. However, once you have used these
              links to leave our site, you should note that we do not have any
              control over that other website. Therefore, we cannot be
              responsible for the protection and privacy of any information
              which you provide whilst visiting such sites and such sites are
              not governed by this privacy statement. You should exercise
              caution and look at the privacy statement applicable to the
              website in question.
            </p>

            <h6 className="text-primary">Your Datum - Your Rights</h6>
            <p>
              You may choose to restrict the collection or use of your personal
              information in the following ways:
            </p>

            <ul className="pb-20">
              <li>
                Whenever you are asked to fill in a form on the website, look
                for the box that you can click to indicate that you do not want
                the information to be used by anybody for direct marketing
                purposes.
              </li>
              <li>
                If your information will be shared with a 3rd party, you will
                see a notice to inform you in advance so you can opt-in if you
                desire. Such opt-in information shared with a 3rd party is for
                the purpose of buying products, listing properties, and other
                integrated partner services that help keep your account running
                smoothly.
              </li>
            </ul>

            <p>
              We will not sell, distribute, or lease your personal information
              to third parties unless we have your permission or are required by
              law to do so. We may use your personal information to send you
              promotional information about third parties which we think you may
              find interesting if you tell us that you wish this to happen.
            </p>

            <h6 className="text-primary">Data Correction and Deletion</h6>
            <p>
              You have the right to access data, request changes, deletions, and
              corrections.
            </p>

            <p>
              You may request details of personal information which we hold
              about you under the Data Protection Act 1998. A small fee will be
              payable. If you would like a copy of the information held on you,
              please contact us. We will provide all your information within 30
              days.
            </p>

            <p>
              If you believe that any information we are holding on you is
              incorrect or incomplete, please write to or email us as soon as
              possible. We will promptly correct any information found to be
              incorrect.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
