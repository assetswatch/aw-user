import { Placeholder } from "react-bootstrap";
import { ValidationMessages } from "./constants";

/*Validation constraints*/
const length1 = 1;
const length2 = 2;
const length3 = 3;
const length4 = 4;
const length5 = 5;
const length6 = 6;
const length7 = 7;
const length8 = 8;
const length9 = 9;
const length11 = 11;
const length10 = 10;
const length13 = 13;
const length15 = 15;
const length16 = 16;
const length17 = 17;
const length20 = 20;
const length30 = 30;
const length50 = 50;
const length100 = 100;
const length250 = 250;
const length300 = 300;
const length400 = 400;
const length500 = 500;
const length1000 = 1000;
const length2000 = 2000;
const nums = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const phonevalidvalues = [...nums, "+", "-", "."];
const pricevalidvalues = [...nums, ".", ","];
const pricenegitivevalidvalues = [...pricevalidvalues, "-"];
const numvalidvalues = [...nums];

const expirydatevalidvalues = [...nums, "/"];
const allowedFileTypes = ["image/jpeg", "image/png", "application/pdf"];
const uploadFileMaxSize = 10 * 1024 * 1024; //10mb
const uploadFileMaxSizeMB = 10; //10mb

/* Regex patterns */
const RegexPattern = {
  numonly: /[0-9]/,
  alphanum: /^[a-zA-Z0-9]+$/,
  phone: /^(?:\+[0-9])?\s?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/,
  email: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
  url: /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?(\?[^\s]*)?$/,
  date: /^(?:(0[1-9]|1[012])[\/.](0[1-9]|[12][0-9]|3[01])[\/.][0-9]{4})$/,
  price: /^\d{1,3}(,\d{3})*(\.\d{1,2})?$|^\d+(\.\d{1,3})?$/, // /^(\$|)([0-9]\d{0,2}(\,\d{3})*|([1-9]\d*))(\.\d{1,2})?$/,
  pricenegitive: /^-?[0-9]+(?:[.,][0-9]*)?$/,
  cardexpiry: /^(0[1-9]|1[0-2])\/\d{4}$/,
  alphanumhyphendotspace: /^[a-zA-Z0-9 _.-]+$/,
  numhyphen: /^[0-9-]+$/,
};

const checkPriceValue = (value) => {
  return value.match(RegexPattern.price)[0];
};

/*Regex */
export const Regex = {
  name: { max: length50, required: ValidationMessages.NameReq },
  name100: { max: length1000, required: ValidationMessages.NameReq },
  occupation: { max: length50, required: ValidationMessages.OccupationReq },
  testimonial: {
    min: length50,
    max: length500,
    required: ValidationMessages.TestimonialReq,
    invalid: ValidationMessages.TestimonialInvalid,
  },
  dbaname: {
    min: length2,
    max: length50,
    pattern: RegexPattern.alphanumhyphendotspace,
    required: ValidationMessages.DBANameReq,
    invalid: ValidationMessages.DBANameInvalid,
  },
  legalname: {
    min: length2,
    max: length50,
    pattern: RegexPattern.alphanumhyphendotspace,
    required: ValidationMessages.LegalNameReq,
    invalid: ValidationMessages.LegalNameInvalid,
  },
  businessdescription: {
    min: length2,
    max: length50,
    required: ValidationMessages.BusinessDescriptionReq,
  },
  businessnameonaccount: {
    min: length2,
    max: length100,
    required: ValidationMessages.BusinessNameOnAccountReq,
  },
  paymentsubaccountfname: {
    min: length2,
    max: length20,
    required: ValidationMessages.FNameReq,
  },
  paymentsubaccountlname: {
    min: length2,
    max: length20,
    required: ValidationMessages.LNameReq,
  },
  fname: { max: length50, required: ValidationMessages.FNameReq },
  mname: { max: length50, required: ValidationMessages.MNameReq },
  lname: {
    max: length50,
    required: ValidationMessages.LNameReq,
  },
  brandingheader: {
    max: length250,
    required: ValidationMessages.BrandingHeaderReq,
  },
  brandingfooter: {
    max: length250,
    required: ValidationMessages.BrandingFooterReq,
  },
  accountnum: {
    min: length4,
    max: length17,
    pattern: RegexPattern.numonly,
    required: ValidationMessages.AccountNumberReq,
    invalid: ValidationMessages.AccountNumberInvalid,
  },
  routingnum: {
    min: length9,
    max: length9,
    pattern: RegexPattern.numonly,
    required: ValidationMessages.RoutingNumberReq,
    invalid: ValidationMessages.RoutingNumberInvalid,
  },
  email: {
    max: length100,
    pattern: RegexPattern.email,
    required: ValidationMessages.EmailReq,
    invalid: ValidationMessages.EmailInvalid,
  },
  currentpwd: {
    min: length6,
    max: length30,
    required: ValidationMessages.CurrentPwdReq,
    invalid: ValidationMessages.CurrentPwdInvalid,
  },
  newpwd: {
    min: length6,
    max: length30,
    required: ValidationMessages.NewPwdReq,
    invalid: ValidationMessages.NewPwdInvalid,
  },
  confirmnewpwd: {
    min: length6,
    max: length30,
    required: ValidationMessages.CNewpwdReq,
    invalid: ValidationMessages.CNewpwdInvalid,
    match: ValidationMessages.CNewpwdMatch,
  },
  pwd: {
    min: length6,
    max: length30,
    required: ValidationMessages.PwdReq,
    invalid: ValidationMessages.PwdInvalid,
  },
  confirmpwd: {
    min: length6,
    max: length30,
    required: ValidationMessages.CpwdReq,
    invalid: ValidationMessages.CpwdInvalid,
    match: ValidationMessages.CpwdMatch,
  },
  phone: {
    pattern: RegexPattern.phone,
    min: length10,
    max: length20,
    required: ValidationMessages.PhoneReq,
    invalid: ValidationMessages.PhoneInvalid,
  },
  mobile: {
    pattern: RegexPattern.phone,
    min: length10,
    max: length20,
    required: ValidationMessages.MobileReq,
    invalid: ValidationMessages.MobileInvalid,
  },
  landline: {
    pattern: RegexPattern.phone,
    min: length10,
    max: length20,
    required: ValidationMessages.LandlineReq,
    invalid: ValidationMessages.LandlineInvalid,
  },
  companyname: {
    max: length100,
    required: ValidationMessages.CompanynameReq,
  },
  website: {
    max: length250,
    pattern: RegexPattern.url,
    required: ValidationMessages.WebsiteReq,
    invalid: ValidationMessages.WebsiteInvalid,
  },
  ssn: {
    min: length11,
    max: length11,
    pattern: RegexPattern.numhyphen,
    required: ValidationMessages.SSNReq,
    invalid: ValidationMessages.SSNInvalid,
  },
  last4ssn: {
    min: length4,
    max: length4,
    pattern: RegexPattern.numonly,
    required: ValidationMessages.Last4SSNReq,
    invalid: ValidationMessages.Last4SSNInvalid,
  },
  federaltaxid: {
    min: length9,
    max: length9,
    pattern: RegexPattern.numonly,
    required: ValidationMessages.FederalTaxIDReq,
    invalid: ValidationMessages.FederalTaxIDInvalid,
  },
  zip: {
    min: length5,
    max: length30,
    pattern: RegexPattern.numonly,
    required: ValidationMessages.ZipReq,
    invalid: ValidationMessages.ZipInvalid,
  },
  cardnumber: {
    min: length13,
    max: length16,
    pattern: RegexPattern.numonly,
    required: ValidationMessages.CardNumberReq,
    invalid: ValidationMessages.CardNumberInvalid,
  },
  cardexpirydate: {
    min: length7,
    max: length7,
    pattern: RegexPattern.cardexpiry,
    required: ValidationMessages.CardExpiryReq,
    invalid: ValidationMessages.CardExpiryInvalid,
  },
  cvv: {
    min: length3,
    max: length4,
    pattern: RegexPattern.numonly,
    required: ValidationMessages.CvvReq,
    invalid: ValidationMessages.CvvInvalid,
  },
  subject: { max: length100, required: ValidationMessages.SubjectReq },
  message: {
    max: length500,
    required: ValidationMessages.MessageReq,
  },
  max1000: {
    max: length1000,
  },
  aboutme: {
    max: length1000,
    required: ValidationMessages.AboutmeReq,
  },
  aboutcompany: {
    max: length1000,
    required: ValidationMessages.AboutcompanyReq,
  },
  searchkeyword: {
    max: length50,
    required: ValidationMessages.SearchKeywordReq,
  },
  location: {
    max: length50,
    required: ValidationMessages.LocationReq,
  },
  date: {
    max: length10,
    required: ValidationMessages.DateReq,
    invalid: ValidationMessages.DateInvalid,
    pattern: RegexPattern.date,
  },
  tenurestartdate: {
    max: length10,
    required: ValidationMessages.TenureStartDateReq,
    invalid: ValidationMessages.TenureStartDateInvalid,
    pattern: RegexPattern.date,
  },
  tenureenddate: {
    max: length10,
    required: ValidationMessages.TenureEndDateReq,
    invalid: ValidationMessages.TenureEndDateInvalid,
    pattern: RegexPattern.date,
  },
  propertytitle: {
    max: length50,
    required: ValidationMessages.PropertyTitleReq,
    invalid: ValidationMessages.PropertyTitleInvalid,
  },
  txtcity: {
    min: length2,
    max: length30,
    required: ValidationMessages.CityReq,
    invalid: ValidationMessages.CityInvalid,
  },
  address50: {
    max: length500,
    required: ValidationMessages.AddressReq,
    invalid: ValidationMessages.AddressInvalid,
  },
  address: {
    max: length100,
    required: ValidationMessages.Address1Req,
    invalid: ValidationMessages.Address1Invalid,
  },
  addressone: {
    max: length100,
    required: ValidationMessages.Address1Req,
    invalid: ValidationMessages.Address1Invalid,
  },
  addresstwo: {
    max: length100,
    required: ValidationMessages.Address2Req,
    invalid: ValidationMessages.Address2Invalid,
  },
  description: {
    max: length2000,
    required: ValidationMessages.DescriptionReq,
    invalid: ValidationMessages.DescriptionInvalid,
  },
  description500: {
    max: length500,
    required: ValidationMessages.DescriptionReq,
    invalid: ValidationMessages.DescriptionInvalid,
  },
  description300: {
    max: length300,
    required: ValidationMessages.DescriptionReq,
    invalid: ValidationMessages.DescriptionInvalid,
  },
  file: {
    max: length250,
    required: ValidationMessages.FileReq,
    formatinvalid: ValidationMessages.FileFormatInvalid,
    sizeinvalid: `${ValidationMessages.FileSizeInvalid} ${uploadFileMaxSizeMB}mb.`,
  },
  rent: {
    max: length15,
    required: ValidationMessages.RentReq,
    invalid: ValidationMessages.RentInvalid,
    pattern: RegexPattern.price,
  },
  price: {
    max: length15,
    required: ValidationMessages.PriceReq,
    invalid: ValidationMessages.PriceInvalid,
    pattern: RegexPattern.price,
  },
  invoiceitemprice: {
    max: length15,
    required: ValidationMessages.PriceReq,
    invalid: ValidationMessages.PriceInvalid,
    pattern: RegexPattern.pricenegitive,
  },
  amount: {
    max: length15,
    required: ValidationMessages.AmountReq,
    invalid: ValidationMessages.AmountInvalid,
    pattern: RegexPattern.price,
  },
  advance: {
    max: length15,
    required: ValidationMessages.AdvanceReq,
    invalid: ValidationMessages.AdvanceInvalid,
    pattern: RegexPattern.price,
  },
  nooffloors: {
    max: length3,
    required: ValidationMessages.NooffloorsReq,
    invalid: ValidationMessages.NooffloorsInvalid,
    pattern: RegexPattern.numonly,
  },
  area: {
    max: length15,
    required: ValidationMessages.AreaReq,
    invalid: ValidationMessages.AreaInvalid,
    pattern: RegexPattern.price,
  },
  sqfeet: {
    max: length15,
    required: ValidationMessages.SqfeetReq,
    invalid: ValidationMessages.SqfeetInvalid,
    pattern: RegexPattern.price,
  },
  feepercentage: {
    max: length5,
    required: ValidationMessages.FeePercentReq,
    invalid: ValidationMessages.FeePercentInvalid,
    pattern: RegexPattern.price,
  },
  brokerpercentage: {
    max: length5,
    required: ValidationMessages.AgentPercentReq,
    invalid: ValidationMessages.AgentPercentInvalid,
    pattern: RegexPattern.price,
  },
  ownershippercentage: {
    max: length5,
    required: ValidationMessages.OwnershipPercentReq,
    invalid: ValidationMessages.OwnershipPercentInvalid,
    pattern: RegexPattern.price,
  },
  title: {
    max: length50,
    required: ValidationMessages.TitleReq,
    invalid: ValidationMessages.TitleInvalid,
  },
  comments: {
    max: length500,
    required: ValidationMessages.CommentsReq,
  },
  invoicenum: {
    min: length1,
    max: length15,
    pattern: RegexPattern.alphanumhyphendotspace,
    required: ValidationMessages.InvoiceNumReq,
    invalid: ValidationMessages.InvoiceNumInvalid,
  },
  zqtyip: {
    min: length1,
    max: length5,
    pattern: RegexPattern.numonly,
    required: ValidationMessages.QtyReq,
    invalid: ValidationMessages.QtyInvalid,
  },
};
/*Regex */

/*control types*/
export const formCtrlTypes = {
  name: {
    lbl: "Name:",
    input: {
      type: "text",
      max: length50,
    },
  },
  name100: {
    lbl: "Name:",
    input: {
      type: "text",
      max: length100,
    },
  },
  testimonial: {
    lbl: "Testimonial:",
    input: {
      type: "text",
      min: length50,
      max: length500,
    },
  },
  occupation: {
    lbl: "Occupation:",
    input: {
      type: "text",
      max: length50,
    },
  },
  dbaname: {
    lbl: "DBA Name:",
    input: {
      type: "text",
      min: length2,
      max: length50,
      keyEvents: {
        onKeyPress: (e) => {
          if (!RegexPattern.alphanumhyphendotspace.test(e.key)) {
            e.preventDefault();
          }
        },
      },
    },
  },
  legalname: {
    lbl: "Legal Name:",
    input: {
      type: "text",
      min: length2,
      max: length50,
      keyEvents: {
        onKeyPress: (e) => {
          if (!RegexPattern.alphanumhyphendotspace.test(e.key)) {
            e.preventDefault();
          }
        },
      },
    },
  },
  businessdescription: {
    lbl: "Description:",
    input: {
      type: "text",
      min: length2,
      max: length50,
    },
  },
  businessnameonaccount: {
    lbl: "Business Name on Account:",
    input: {
      type: "text",
      min: length2,
      max: length100,
    },
  },
  paymentsubaccountfname: {
    lbl: "First Name:",
    input: {
      type: "text",
      min: length2,
      max: length20,
    },
  },
  paymentsubaccountlname: {
    lbl: "Last Name:",
    input: {
      type: "text",
      min: length2,
      max: length20,
    },
  },
  fname: {
    lbl: "First name:",
    input: {
      type: "text",
      max: length50,
    },
  },
  mname: {
    lbl: "Middle name (optional):",
    input: {
      type: "text",
      max: length50,
    },
  },
  lname: {
    lbl: "Last name:",
    input: {
      type: "text",
      max: length50,
    },
  },
  brandingheader: {
    lbl: "Header text:",
    input: {
      type: "text",
      max: length250,
    },
  },
  brandingfooter: {
    lbl: "Footer text:",
    input: {
      type: "text",
      max: length250,
    },
  },
  accountnum: {
    lbl: "Account Number:",
    input: {
      type: "text",
      min: length4,
      max: length17,
      keyEvents: {
        onKeyPress: (e) => {
          if (!RegexPattern.numonly.test(e.key)) {
            e.preventDefault();
          }
        },
      },
    },
  },
  routingnum: {
    lbl: "Routing Number:",
    input: {
      type: "text",
      min: length9,
      max: length9,
      keyEvents: {
        onKeyPress: (e) => {
          if (!RegexPattern.numonly.test(e.key)) {
            e.preventDefault();
          }
        },
      },
    },
  },
  email: {
    lbl: "Email Id:",
    input: {
      type: "text",
      max: length100,
    },
  },
  currentpwd: {
    lbl: "Current Password:",
    input: {
      type: "password",
      min: length6,
      max: length30,
    },
  },
  newpwd: {
    lbl: "New Password:",
    input: {
      type: "password",
      min: length6,
      max: length30,
    },
  },
  confirmnewpwd: {
    lbl: "Confirm New Password:",
    input: {
      type: "password",
      min: length6,
      max: length30,
    },
  },
  pwd: {
    lbl: "Password:",
    input: {
      type: "password",
      min: length6,
      max: length30,
    },
  },
  confirmpwd: {
    lbl: "Confirm Password:",
    input: {
      type: "password",
      min: length6,
      max: length30,
    },
  },
  phone: {
    lbl: "Phone number:",
    input: {
      type: "text",
      min: length10,
      max: length20,
      keyEvents: {
        onKeyPress: (e) => {
          if (!phonevalidvalues.includes(e.key)) {
            e.preventDefault();
          }
        },
      },
    },
  },
  mobile: {
    lbl: "Primary phone:",
    input: {
      type: "text",
      min: length10,
      max: length20,
      keyEvents: {
        onKeyPress: (e) => {
          if (!phonevalidvalues.includes(e.key)) {
            e.preventDefault();
          }
        },
      },
    },
  },
  landline: {
    lbl: "Secondary phone:",
    input: {
      type: "text",
      min: length10,
      max: length20,
      keyEvents: {
        onKeyPress: (e) => {
          if (!phonevalidvalues.includes(e.key)) {
            e.preventDefault();
          }
        },
      },
    },
  },
  companyname: {
    lbl: "Company name:",
    input: {
      type: "text",
      max: length100,
    },
  },
  website: {
    lbl: "Website:",
    input: {
      type: "text",
      max: length250,
    },
  },
  ssn: {
    lbl: "Social secuirty number (SSN):",
    input: {
      type: "text",
      min: length11,
      max: length11,
      keyEvents: {
        onKeyPress: (e) => {
          if (!RegexPattern.numhyphen.test(e.key)) {
            e.preventDefault();
          }
        },
        onInput: (e) => {
          let value = e.target.value.replace(/\D/g, "");
          if (value.length > 9) value = value.slice(0, 9);
          const formatted =
            value.slice(0, 3) +
            (value.length >= 4 ? "-" + value.slice(3, 5) : "") +
            (value.length >= 6 ? "-" + value.slice(5, 9) : "");
          e.target.value = formatted;
        },
      },
    },
  },
  last4ssn: {
    lbl: "Last 4 SSN:",
    input: {
      type: "text",
      min: length4,
      max: length4,
      keyEvents: {
        onKeyPress: (e) => {
          if (!RegexPattern.numonly.test(e.key)) {
            e.preventDefault();
          }
        },
      },
    },
  },
  federaltaxid: {
    lbl: "Federal Tax ID:",
    input: {
      type: "text",
      min: length9,
      max: length9,
      keyEvents: {
        onKeyPress: (e) => {
          if (!RegexPattern.numonly.test(e.key)) {
            e.preventDefault();
          }
        },
      },
    },
  },
  zip: {
    lbl: "Zip code:",
    input: {
      type: "text",
      min: length5,
      max: length10,
      keyEvents: {
        onKeyPress: (e) => {
          if (!RegexPattern.numonly.test(e.key)) {
            e.preventDefault();
          }
        },
      },
    },
  },
  cardnumber: {
    lbl: "Card number:",
    input: {
      type: "text",
      min: length13,
      max: length16,
      keyEvents: {
        onKeyPress: (e) => {
          if (!RegexPattern.numonly.test(e.key)) {
            e.preventDefault();
          }
        },
      },
    },
  },
  cardexpirydate: {
    lbl: "Expiry date (MM/YYYY):",
    input: {
      type: "text",
      min: length7,
      max: length7,
      placeHolder: "MM/YYYY",
      keyEvents: {
        onKeyPress: (e) => {
          if (!expirydatevalidvalues.includes(e.key)) {
            e.preventDefault();
          }
        },
        onInput: (e) => {
          let value = e.target.value.replace(/\D/g, "");
          if (value.length > 1) {
            value = value.slice(0, 2) + "/" + value.slice(2, 6);
          }
          e.target.value = value;
        },
      },
    },
  },
  cvv: {
    lbl: "CVV:",
    input: {
      type: "text",
      min: length3,
      max: length4,
      keyEvents: {
        onKeyPress: (e) => {
          if (!RegexPattern.numonly.test(e.key)) {
            e.preventDefault();
          }
        },
      },
    },
  },
  category: {
    lbl: "Category:",
  },
  country: {
    lbl: "Country:",
  },
  asset: {
    lbl: "Property:",
  },
  profiletype: {
    lbl: "Profile type:",
  },
  rentpaidto: {
    lbl: "Rent paid to:",
  },
  accounttype: {
    lbl: "Account Type:",
  },
  state: {
    lbl: "State:",
  },
  city: {
    lbl: "City:",
  },
  txtcity: {
    lbl: "City:",
    input: {
      type: "text",
      min: length2,
      max: length30,
    },
  },
  contactfor: {
    lbl: "Contact for:",
  },
  subject: {
    lbl: "Subject:",
    input: {
      type: "text",
      max: length100,
    },
  },
  message: {
    lbl: "Message:",
    input: {
      type: "text",
      max: length500,
    },
  },
  max1000: {
    lbl: "",
    input: {
      type: "text",
      max: length1000,
    },
  },
  aboutme: {
    lbl: "About me:",
    input: {
      type: "text",
      max: length1000,
    },
  },
  aboutcompany: {
    lbl: "About Company:",
    input: {
      type: "text",
      max: length1000,
    },
  },
  searchkeyword: {
    lbl: "Keyword:",
    input: {
      type: "text",
      max: length50,
    },
  },
  location: {
    lbl: "Location:",
    input: {
      type: "text",
      max: length50,
    },
  },
  date: {
    lbl: "Date:",
    input: {
      type: "text",
      max: length10,
    },
  },
  tenurestartdate: {
    lbl: "Tenure start date:",
    input: {
      type: "text",
      max: length10,
    },
  },
  tenureenddate: {
    lbl: "Tenure end date:",
    input: {
      type: "text",
      max: length10,
    },
  },
  propertytitle: {
    lbl: "Property Title:",
    input: {
      type: "text",
      max: length50,
    },
  },
  address50: {
    lbl: "Address:",
    input: {
      type: "text",
      max: length50,
    },
  },
  address: {
    lbl: "Address:",
    input: {
      type: "text",
      max: length400,
    },
  },
  addressone: {
    lbl: "Address 1:",
    input: {
      type: "text",
      max: length400,
    },
  },
  addresstwo: {
    lbl: "Address 2:",
    input: {
      type: "text",
      max: length400,
    },
  },
  description: {
    lbl: "Description:",
    input: {
      type: "text",
      max: length2000,
    },
  },
  description300: {
    lbl: "Description:",
    input: {
      type: "text",
      max: length300,
    },
  },
  description500: {
    lbl: "Description:",
    input: {
      type: "text",
      max: length500,
    },
  },
  assettype: {
    lbl: "Property type:",
  },
  ownershipstatus: {
    lbl: "Status:",
  },
  areaunittype: {
    lbl: "Unit type:",
  },
  assetcontracttype: {
    lbl: "Contract type:",
  },
  assetclassificationtype: {
    lbl: "Classification type:",
  },
  assetlistingtype: {
    lbl: "Listing type:",
  },
  assetaccesstype: {
    lbl: "Property access:",
  },
  bedrooms: {
    lbl: "Bedrooms :",
  },
  bathrooms: {
    lbl: "Bathrooms :",
  },
  status: {
    lbl: "Status :",
  },
  requesttype: {
    lbl: "Request type :",
  },
  Notificationtype: {
    lbl: "Notification type:",
  },
  rent: {
    lbl: "Rent amount ($):",
    input: {
      type: "text",
      max: length15,
      keyEvents: {
        onKeyPress: (e) => {
          if (!pricevalidvalues.includes(e.key)) {
            e.preventDefault();
          }
        },
      },
    },
  },
  price: {
    lbl: "Price ($):",
    input: {
      type: "text",
      max: length15,
      keyEvents: {
        onKeyPress: (e) => {
          if (!pricevalidvalues.includes(e.key)) {
            e.preventDefault();
          }
        },
      },
    },
  },
  invoiceitemprice: {
    lbl: "Price ($):",
    input: {
      type: "text",
      max: length15,
      keyEvents: {
        onKeyPress: (e) => {
          if (!pricenegitivevalidvalues.includes(e.key)) {
            e.preventDefault();
          }
        },
      },
    },
  },
  amount: {
    lbl: "Total amount ($):",
    input: {
      type: "text",
      max: length15,
      keyEvents: {
        onKeyPress: (e) => {
          if (!pricevalidvalues.includes(e.key)) {
            e.preventDefault();
          }
        },
      },
    },
  },
  advance: {
    lbl: "Advance amount ($):",
    input: {
      type: "text",
      max: length15,
      keyEvents: {
        onKeyPress: (e) => {
          if (!pricevalidvalues.includes(e.key)) {
            e.preventDefault();
          }
        },
      },
    },
  },
  nooffloors: {
    lbl: "No.of floors:",
    input: {
      type: "text",
      max: length3,
      keyEvents: {
        onKeyPress: (e) => {
          if (!RegexPattern.numonly.test(e.key)) {
            e.preventDefault();
          }
        },
      },
    },
  },
  area: {
    lbl: "Area:",
    input: {
      type: "text",
      max: length15,
      keyEvents: {
        onKeyPress: (e) => {
          if (!pricevalidvalues.includes(e.key)) {
            e.preventDefault();
          }
        },
      },
    },
  },
  sqfeet: {
    lbl: "Square feet:",
    input: {
      type: "text",
      max: length15,
      keyEvents: {
        onKeyPress: (e) => {
          if (!pricevalidvalues.includes(e.key)) {
            e.preventDefault();
          }
        },
      },
    },
  },
  feepercentage: {
    lbl: "Fee (%):",
    input: {
      type: "text",
      max: length5,
      keyEvents: {
        onKeyPress: (e) => {
          if (!pricevalidvalues.includes(e.key)) {
            e.preventDefault();
          }
        },
      },
    },
  },
  brokerpercentage: {
    lbl: "Agent (%):",
    input: {
      type: "text",
      max: length5,
      keyEvents: {
        onKeyPress: (e) => {
          if (!pricevalidvalues.includes(e.key)) {
            e.preventDefault();
          }
        },
      },
    },
  },
  ownershippercentage: {
    lbl: "Percentage:",
    input: {
      type: "text",
      max: length5,
      keyEvents: {
        onKeyPress: (e) => {
          if (!pricevalidvalues.includes(e.key)) {
            e.preventDefault();
          }
        },
      },
    },
  },
  file: {
    lbl: "Upload file:",
    input: {
      type: "file",
      max: length250,
      validateFileType: (file) => {
        return file && allowedFileTypes.includes(file.type);
      },
      validateFileSize: (file) => {
        return file && file.size > uploadFileMaxSize;
      },
    },
  },
  documenttype: {
    lbl: "Document type:",
  },
  sharedtype: {
    lbl: "Share type:",
  },
  folder: {
    lbl: "Folder:",
  },
  title: {
    lbl: "Title:",
    input: {
      type: "text",
      max: length50,
    },
  },
  comments: {
    lbl: "Comments:",
    input: {
      type: "text",
      max: length500,
    },
  },
  users: {
    lbl: "Users:",
  },
  user: {
    lbl: "User:",
  },
  item: {
    lbl: "Item:",
  },
  itemfortype: {
    lbl: "Item for:",
  },
  accountfortype: {
    lbl: "Account for:",
  },
  select: {
    lbl: "Select:",
  },
  invoicenum: {
    lbl: "Invoice #:",
    input: {
      type: "text",
      min: length1,
      max: length15,
      keyEvents: {
        onKeyPress: (e) => {
          if (!RegexPattern.alphanumhyphendotspace.test(e.key)) {
            e.preventDefault();
          }
        },
      },
    },
  },
  qty: {
    lbl: "Quantity:",
    input: {
      type: "text",
      min: length1,
      max: length5,
      keyEvents: {
        onKeyPress: (e) => {
          if (!RegexPattern.numonly.test(e.key)) {
            e.preventDefault();
          }
        },
      },
    },
  },
};
/*control types*/
