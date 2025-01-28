import { AppMessages, ValidationMessages } from "./constants";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { UserCookie } from "../utils/constants";
import { routeNames } from "../routes/routes";
import moment from "moment";
import config from "../config.json";
import CryptoJS from "crypto-js";
import { axiosPost } from "../helpers/axiosHelper";

/** set page loader on mounting and unmounitng and nav links active.inactive */
export function SetPageLoaderNavLinks() {
  let $ = window.$;
  let location = useLocation();

  useEffect(() => {
    handlePreLoader();
    setNavLinksActive();
    return () => {
      if ($(".preloader").length) {
        $(".preloader").show().delay(500).fadeOut(100);
      }
    };
  }, []);

  function handlePreLoader() {
    if ($(".preloader").length) {
      $(".preloader").delay(500).fadeOut(100);
    }
  }

  function setNavLinksActive() {
    $(".navbar-nav .nav-item").removeClass("active");
    let current = location.pathname.toLowerCase();
    if (current.indexOf("user/") != -1) {
      let activelink = "";
      let activesublink = "";
      switch (current) {
        case routeNames.ownerproperties.path.toLowerCase():
        case routeNames.ownerlistedproperties.path.toLowerCase():
        case routeNames.ownerpartnershipproperties.path.toLowerCase():
        case routeNames.ownerviewproperty.path.toLowerCase():
        case routeNames.agentproperties.path.toLowerCase():
        case routeNames.ownerassignproperty.path.toLowerCase():
          activelink = "myproperties";
          activesublink = "myproperties";
          break;
        case routeNames.agentviewproperty.path.toLowerCase():
        case routeNames.tenantviewproperty.path.toLowerCase():
          activelink = "myproperties";
          break;
        case routeNames.addresidentialproperty.path.toLowerCase():
          activelink = "myproperties";
          activesublink = "addresidentialproperty";
          break;
        case routeNames.addcommercialproperty.path.toLowerCase():
          activelink = "myproperties";
          activesublink = "addcommercialproperty";
          break;
        case routeNames.manageresidentialproperty.path.toLowerCase():
        case routeNames.managecommercialproperty.path.toLowerCase():
          activelink = "myproperties";
          activesublink = "addresidentialproperty";
          break;
        case routeNames.agentassignedproperties.path.toLowerCase():
          activelink = "myproperties";
          activesublink = "assignedproperties";
          break;
        case routeNames.tenantconnectedproperties.path.toLowerCase():
          activelink = "myproperties";
          activesublink = "connectedproperties";
          break;
        case routeNames.settings.path.toLowerCase():
          activelink = "settings";
          break;
        case routeNames.connectionsowners.path.toLowerCase():
        case routeNames.connectionsagents.path.toLowerCase():
        case routeNames.connectionstenants.path.toLowerCase():
          activelink = "myconnections";
          break;
        case routeNames.paymentsaccounts.path.toLowerCase():
        case routeNames.paymentscreateaccount.path.toLowerCase():
        case routeNames.paymentsinvoices.path.toLowerCase():
        case routeNames.invoiceitems.path.toLowerCase():
        case routeNames.createinvoiceitem.path.toLowerCase():
        case routeNames.viewinvoiceitem.path.toLowerCase():
          activelink = "payments";
          break;
        case routeNames.tenantpayments.path.toLowerCase():
        case routeNames.tenantcheckout.path.toLowerCase():
          activelink = "tenant-payments";
          break;
        case routeNames.tenantprofile.path.toLowerCase():
        case routeNames.agentprofile.path.toLowerCase():
        case routeNames.ownerprofile.path.toLowerCase():
        case routeNames.tenantprofileedit.path.toLowerCase():
        case routeNames.agentprofileedit.path.toLowerCase():
        case routeNames.ownerprofileedit.path.toLowerCase():
          activelink = "user-profile";
          break;
        case routeNames.owneragreementtemplates.path.toLowerCase():
        case routeNames.ownersendagreement.path.toLowerCase():
        case routeNames.ownerpreviewagreement.path.toLowerCase():
          activelink = "agreements";
          activesublink = "owner-agreement-templates";
          break;
        case routeNames.mydocuments.path.toLowerCase():
        case routeNames.viewdocument.path.toLowerCase():
        case routeNames.sharedocument.path.toLowerCase():
        case routeNames.shareddocuments.path.toLowerCase():
        case routeNames.sharedfolders.path.toLowerCase():
        case routeNames.sharedusers.path.toLowerCase():
          activelink = "agreements";
          activesublink = "documents";
          break;
      }

      $('[id^="nav-"],[id^="nav-lnk-"],[id^="page-lnk-"]')
        .parent("li")
        .removeClass("active");

      $(
        `#nav-${activelink},
        #nav-lnk-${activesublink},
        #page-lnk-${activesublink}`
      )
        .parent("li")
        .addClass("active");
    } else {
      let path = current.substring(current.lastIndexOf("/") + 1);
      switch (path.toLowerCase()) {
        case "/":
        case "home":
        case "":
        default:
          path = "home";
          break;
        case "aboutus":
          path = "aboutus";
          break;
        case "contactus":
          path = "contactus";
          break;
        case "login":
        case "forgotpassword":
          path = "login";
          break;
        case "register":
          path = "register";
          break;
        case "properties":
        case "propertydetails":
          path = "properties";
          break;
        case "plans":
          path = "plans";
          break;
        case "blog":
          path = "blog";
          break;
        case "howitworks":
          path = "howitworks";
          break;
      }

      $("#nav-" + path)
        .parent("li")
        .addClass("active");
    }
  }
}

/** set page loader on mounting and unmounitng and nav links active.inactive */
export function SetUserMenu() {
  let $ = window.$;

  useEffect(() => {
    handlePreLoader();
    closeCollapse();
    closebsDropDown();
    return () => {
      if ($(".preloader").length) {
        $(".preloader").show().delay(500).fadeOut(100);
      }

      closeCollapse();
      closebsDropDown();
    };
  }, []);

  function handlePreLoader() {
    if ($(".preloader").length) {
      $(".preloader").delay(500).fadeOut(100);
    }
  }

  $(document)
    .off("click")
    .on("click", function (event) {
      document.querySelectorAll(".collapse").forEach(function (collapse) {
        var bsCollapse = new window.bootstrap.Collapse(collapse, {
          toggle: false,
        });
        bsCollapse.hide();
      });

      if (!$(event.target).closest(".gr-action-btn").length) {
        closeAllBSDropDowns();
      } else {
        let closestBtn = $(event.target).closest(".gr-action-btn");
        if ($(closestBtn).attr("aria-expanded") == "true") {
          $(closestBtn).attr("aria-expanded", "false");
          $(closestBtn).next(".gr-action-menu").slideUp();
        } else {
          closeAllBSDropDowns();
          $(closestBtn).attr("aria-expanded", "true");
          $(closestBtn).next(".gr-action-menu").slideDown();
        }
      }
    });

  function closeAllBSDropDowns() {
    $(".gr-action-btn").attr("aria-expanded", "false");
    $(".gr-action-menu").slideUp();
  }

  function closeCollapse() {
    document
      .querySelectorAll('[data-bs-toggle="collapse"]')
      .forEach(function (element) {
        element.addEventListener("click", function (event) {
          // Get the target collapse
          var target = document.querySelector(
            this.getAttribute("data-bs-target")
          );
          // Close all other collapses
          document.querySelectorAll(".collapse").forEach(function (collapse) {
            if (collapse !== target) {
              var bsCollapse = new window.bootstrap.Collapse(collapse, {
                toggle: false,
              });
              bsCollapse.hide();
            }
          });
        });
      });
  }

  function closebsDropDown() {
    let $window = $(window),
      $navigation = $("#navbarSupportedContent"),
      $widgetusernavlinks = $("#collpase-widget-usernavlinks"),
      $dropdown = $(".dropdown-toggle");

    ($navigation, $widgetusernavlinks).each(function () {
      $dropdown.on("click", function (e) {
        // if ($window.width() < 1100) {
        if ($(this).parent(".dropdown").hasClass("visible")) {
          $(this)
            .parent(".dropdown")
            .children(".dropdown-menu")
            .first()
            .stop(true, true)
            .slideUp(300);
          $(this).parent(".dropdown").removeClass("visible");
        } else {
          e.preventDefault();
          $(this)
            .parent(".dropdown")
            .siblings(".dropdown")
            .children(".dropdown-menu")
            .slideUp(300);
          $(this)
            .parent(".dropdown")
            .siblings(".dropdown")
            .removeClass("visible");
          $(this).parent(".dropdown").children(".dropdown-menu").slideDown(300);
          $(this).parent(".dropdown").addClass("visible");
        }
        e.stopPropagation();
        // }
      });
    });
  }
}

export function SetAccordion() {
  let $ = window.$;

  useEffect(() => {
    // Custom accordion useable settings for any type of accordion system
    if (document.querySelector(".bb-accordion") !== null) {
      $(".ac-toggle").on("click", function (e) {
        e.preventDefault();

        var $this = $(this);

        if ($this.hasClass("active") && $this.next().hasClass("show")) {
          $this.removeClass("active");
          $this.next().removeClass("show");
          $this.next().slideUp(350);
        } else {
          // Check accordion type: for single item open
          if ($this.parent().parent().hasClass("ac-single-show")) {
            $this
              .parent()
              .parent()
              .find(".ac-card .ac-toggle")
              .removeClass("active");
            $this
              .parent()
              .parent()
              .find(".ac-card .ac-collapse")
              .removeClass("show");
            $this.parent().parent().find(".ac-card .ac-collapse").slideUp(350);
            $this.addClass("active");
            $this.next().addClass("show");
            $this.next().slideDown(350);
          }

          // Check accordion type: for group item open
          else if ($this.parent().parent().hasClass("ac-group-show")) {
            $this.addClass("active");
            $this.next().addClass("show");
            $this.next().slideDown(350);
          }

          // Default if not use any accordion type
          else {
            $this
              .parent()
              .parent()
              .find(".ac-card .ac-toggle")
              .removeClass("active");
            $this
              .parent()
              .parent()
              .find(".ac-card .ac-collapse")
              .removeClass("show");
            $this.parent().parent().find(".ac-card .ac-collapse").slideUp(350);
            $this.addClass("active");
            $this.next().addClass("show");
            $this.next().slideDown(350);
          }
        }
      });
    }
  }, []);
}

/** check empty val empty return true / false */
export function checkEmptyVal(val) {
  if (val === null || val === undefined || val === "") return true;
  else return false;
}

/** check empty object empty return true / false */
export function checkObjNullorEmpty(obj) {
  if (
    obj === null ||
    obj === undefined ||
    obj === "" ||
    Object.keys(obj).length === 0
  )
    return true;
  else return false;
}

/** set select control default value  */
export function setSelectDefaultVal(obj, defaultVal = 0) {
  if (typeof obj === "object") {
    //check obj type
    if (checkObjNullorEmpty(obj)) {
      // check obj empty
      return defaultVal;
    } else {
      return obj.value;
    }
  } else {
    if (checkEmptyVal(obj)) {
      // check val empty
      return defaultVal;
    } else {
      return obj;
    }
  }
}

/** set page api request action */
export function apiReqResLoader(
  btnid,
  text,
  action = "start",
  showPageLoader = true
) {
  let $ = window.$;
  if (action.toLowerCase() === "start") {
    if (btnid.toLowerCase() != "x") {
      $("#" + btnid)
        .html(text + ' <i class="fa fa-spinner fa-spin"></i>')
        .attr("disabled", "disabled");
    }
    if (showPageLoader && $(".preloader").length) {
      $(".preloader").fadeIn(0);
    }
  } else {
    if (btnid.toLowerCase() != "x") {
      $("#" + btnid)
        .html(text)
        .removeAttr("disabled");
    }
    if (showPageLoader && $(".preloader").length) {
      $(".preloader").show().delay(500).fadeOut(100);
    }
  }
}

/** set select control loading */
export function setDdlLoading(ctrlid, text = AppMessages.DdLLoading) {
  let $ = window.$;
  $("#" + ctrlid)
    .empty()
    .append(`<option>${text}</option>`);
}

/** set select control loading */
export function setDdlNoData(ctrlid, val = "", text = AppMessages.DdlNoData) {
  let $ = window.$;
  $("#" + ctrlid)
    .empty()
    .append(
      `<option ${!checkEmptyVal(val) ? `value = ${val}` : ""}>${text}</option>`
    );
}

/** set select control empty */
export function setDdlEmpty(ctrlid) {
  let $ = window.$;
  $("#" + ctrlid).empty();
}

/** set show hide Ctrl */
export function showHideCtrl(ctrlid, ishide = false) {
  let $ = window.$;
  ishide ? $("#" + ctrlid).hide() : $("#" + ctrlid).show();
}

export function checkStartEndDateGreater(start, end) {
  if (moment(end).isSame(moment(start))) {
    return "";
  } else {
    return moment(end).isAfter(moment(start)) == false
      ? ValidationMessages.StartEndDateGreater
      : "";
  }
}

/** sconvvert string to bool */
export function stringToBool(e) {
  switch (e?.toLowerCase()?.trim()) {
    case "true":
    case "yes":
    case "1":
      return !0;
    case "false":
    case "no":
    case "0":
    case null:
    case void 0:
      return !1;
    default:
      return e;
  }
}

export function GetCookieValues(cookiekey) {
  const { loggedinUser } = useAuth();
  return readCookieVal(cookiekey, loggedinUser);
}

export function GetUserCookieValues(cookiekey, user = {}) {
  return readCookieVal(cookiekey, user);
}

function readCookieVal(cookiekey, user) {
  let retval = "";
  switch (cookiekey) {
    case UserCookie.AccountId:
      retval = user?.[UserCookie.AccountId];
      break;
    case UserCookie.SessionId:
      retval = user?.[UserCookie.SessionId];
      break;
    case UserCookie.ProfilePic:
      retval = user?.[UserCookie.Profile][UserCookie.ProfilePic];
      break;
    case UserCookie.Email:
      retval = user?.[UserCookie.Email];
      break;
    case UserCookie.PlanId:
      retval = user?.[UserCookie.PlanId];
      break;
    case UserCookie.Plan:
      retval = user?.[UserCookie.Plan];
      break;
    case UserCookie.Name:
      retval = user?.[UserCookie.Profile][UserCookie.Name];
      break;
    case UserCookie.ProfileType:
      retval = user?.[UserCookie.Profile][UserCookie.ProfileType];
      break;
    case UserCookie.ProfileTypeId:
      retval = user?.[UserCookie.Profile][UserCookie.ProfileTypeId];
      break;
    case UserCookie.ProfileId:
      retval = user?.[UserCookie.Profile][UserCookie.ProfileId];
      break;
    default:
      retval = "";
      break;
  }
  return retval;
}

export function setDdlOptions(
  ctrlname,
  options,
  dataKey,
  dataValue,
  isSelectOption = true
) {
  let $ = window.$;
  let ctrl = $(`[name=${ctrlname}]`);
  ctrl.empty();
  if (typeof options === "string" && options?.toLowerCase() == "loading") {
    ctrl.append(
      $("<option/>", {
        value: "0",
        text: "Loading...",
      })
    );
  } else {
    if (isSelectOption == true) {
      ctrl.append(
        $("<option/>", {
          value: "0",
          text: "Select",
        })
      );
    }
    $.each(options, (idx, item) => {
      ctrl.append(
        $("<option/>", {
          value: item[dataKey],
          text: item[dataValue],
        })
      );
    });
  }
}

export function replacePlaceHolders(template, data) {
  return template.replace(/{(.*?)}/g, (match, key) => data[key.trim()] || "");
}

export const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export function getPagesPathByLoggedinUserProfile(
  loggedinProfileTypeId,
  page = ""
) {
  let path = "#";
  if (checkEmptyVal(page) == false) {
    if (page?.toLowerCase() == "notifications") {
      path =
        loggedinProfileTypeId == config.userProfileTypes.Owner
          ? routeNames.ownernotifications.path
          : loggedinProfileTypeId == config.userProfileTypes.Agent
          ? routeNames.agentnotifications.path
          : loggedinProfileTypeId == config.userProfileTypes.Tenant
          ? routeNames.tenantnotifications.path
          : path;
    } else if (page?.toLowerCase() == "payments") {
      path =
        loggedinProfileTypeId == config.userProfileTypes.Owner
          ? routeNames.ownerpayments.path
          : loggedinProfileTypeId == config.userProfileTypes.Agent
          ? routeNames.agentpayments.path
          : loggedinProfileTypeId == config.userProfileTypes.Tenant
          ? routeNames.tenantpayments.path
          : path;
    } else if (page?.toLowerCase() == "profile") {
      path =
        loggedinProfileTypeId == config.userProfileTypes.Owner
          ? routeNames.ownerprofile.path
          : loggedinProfileTypeId == config.userProfileTypes.Agent
          ? routeNames.agentprofile.path
          : loggedinProfileTypeId == config.userProfileTypes.Tenant
          ? routeNames.tenantprofile.path
          : path;
    } else if (page?.toLowerCase() == "profileedit") {
      path =
        loggedinProfileTypeId == config.userProfileTypes.Owner
          ? routeNames.ownerprofileedit.path
          : loggedinProfileTypeId == config.userProfileTypes.Agent
          ? routeNames.agentprofileedit.path
          : loggedinProfileTypeId == config.userProfileTypes.Tenant
          ? routeNames.tenantprofileedit.path
          : path;
    }
    return path;
  }
}

export const usioGetToken = (objCard) => {
  return new Promise((resolve, reject) => {
    let objParams = {
      MerchantKey:
        objCard.ProfileId == 8
          ? "2CE3513A-085E-4DC1-8D78-84E79F85DC6D"
          : config.usioPaymentConfig.merchantAPIKey,
    };
    objParams = { ...objParams, ...objCard };

    axiosPost(`${config.usioPaymentConfig.getTokenUrl}`, objParams)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const Encrypt = (text) => {
  return CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(config.secretKey), {
    iv: CryptoJS.enc.Utf8.parse(config.secretIV),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
};

export const formatBytes = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const result = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${result} ${sizes[i]}`;
};

export const trimCommas = (str) => {
  return str.replace(/^,+|,+$/g, "");
};
