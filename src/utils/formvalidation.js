import { ValidationMessages } from "./constants";

/*Validation constraints*/
const length3 = 3;
const length4 = 4;
const length5 = 5;
const length6 = 6;
const length7 = 7;
const length10 = 10;
const length13 = 13;
const length15 = 15;
const length16 = 16;
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
const expirydatevalidvalues = [...nums, "/"];
const allowedFileTypes = ["image/jpeg", "image/png", "application/pdf"];
const uploadFileMaxSize = 10 * 1024 * 1024; //10mb
const uploadFileMaxSizeMB = 10; //10mb

/* Regex patterns */
const RegexPattern = {
  numonly: /[0-9]/,
  phone: /^(?:\+[0-9])?\s?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/,
  email: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
  url: /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?(\?[^\s]*)?$/,
  date: /^(?:(0[1-9]|1[012])[\/.](0[1-9]|[12][0-9]|3[01])[\/.][0-9]{4})$/,
  price: /^(\$|)([0-9]\d{0,2}(\,\d{3})*|([1-9]\d*))(\.\d{1,2})?$/,
  cardexpiry: /^(0[1-9]|1[0-2])\/\d{4}$/,
};

const checkPriceValue = (value) => {
  return value.match(RegexPattern.price)[0];
};

/*Regex */
export const Regex = {
  name: { max: length50, required: ValidationMessages.NameReq },
  fname: { max: length50, required: ValidationMessages.FNameReq },
  lname: {
    max: length50,
    required: ValidationMessages.LNameReq,
  },
  email: {
    max: length100,
    pattern: RegexPattern.email,
    required: ValidationMessages.EmailReq,
    invalid: ValidationMessages.EmailInvalid,
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
  aboutme: {
    max: length1000,
    required: ValidationMessages.AboutmeReq,
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
  sqfeet: {
    max: length15,
    required: ValidationMessages.SqfeetReq,
    invalid: ValidationMessages.SqfeetInvalid,
    pattern: RegexPattern.price,
  },
  brokerpercentage: {
    max: length5,
    required: ValidationMessages.AgentPercentReq,
    invalid: ValidationMessages.AgentPercentInvalid,
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
  fname: {
    lbl: "First name:",
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
  email: {
    lbl: "Email Id:",
    input: {
      type: "text",
      max: length100,
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
    lbl: "Mobile number:",
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
    lbl: "Landline number:",
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
      keyEvents: {
        onKeyPress: (e) => {
          if (!expirydatevalidvalues.includes(e.key)) {
            e.preventDefault();
          }
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
  state: {
    lbl: "State:",
  },
  city: {
    lbl: "City:",
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
  aboutme: {
    lbl: "About me:",
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
};
/*control types*/
