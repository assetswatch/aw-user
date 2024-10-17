export const AppDetails = {
  address: "113 State Hwy 121 Coppell, TX 75019",
  phone: "(214) 702-9959",
  email: "info@assetswatch.com",
  devicetypeid: 3, //web
};

/*Local storage keys*/
export const LSApiTokenKey = "apitoken";
export const LSDeviceIdKey = "deviceid";
export const LSTokenKey = "token";
export const LSExpiryKey = "expires";
/*Local storage keys*/

/*Session storage keys*/
export const SessionStorageKeys = {
  EditAssetId: "eassetid",
  AssetDetailsId: "assetid",
  ObjAssetfilters: "oasf",
};
/*Session storage keys*/

/*User cookie keys */
export const UserCookie = {
  CookieName: "_u",
  AccountId: "accid",
  Email: "em",
  PlanId: "plid",
  Plan: "pl",
  Profile: "p",
  ProfileId: "pid",
  Name: "name",
  ProfilePic: "pic",
  ProfileTypeId: "ptid",
  ProfileType: "pt",
  ProfileCategoryId: "pcid",
  SessionId: "sessid",
};
/*User cookie keys */

/*Api Request Actions*/
export const API_ACTION_STATUS = Object.freeze({
  START: "start",
  COMPLETED: "completed",
});
/*Api Request Actions*/

/*Grid default values*/
export const GridDefaultValues = {
  pi: 0,
  ps: 10,
};
/*Grid default values*/

/*Common App messages*/
export const AppMessages = {
  DdlDefaultSelect: " Select ",
  DdlNoData: "No data found.",
  DdLLoading: "Loading...",
  NoCountries: "No countires found.",
  NoStates: "No states found.",
  NoCities: "No cities found.",
  NoData: "No data found...",
  NoProfiles: "No profiles found...",
  NoProperties: "No properties found...",
  NoPropertyDetails: "Property details not found...",
  SomeProblem: "Some problem occured, Please try again.",
  AsyncSelectNoData: [{ Id: "", Text: "No data found." }],
  AsyncSelectDefaultSelect: [{ Id: "", Text: " Select " }],
  DeleteConfirmationTitle: "Are you sure?",
  DeleteAssetConfirmationMessage: "You want to delete {propertyname} property.",
  AddPropertySuccess: "Property successfully...",
  UpdatePropertySuccess: "Property details updated successfully...",
  DeleteAssetSuccess: "Property deleted successfully...",
  DeleteImageSuccess: "Image deleted successfully...",
  DeleteAssetOwnerSuccess: "Owner removed successfully...",
  SupportTicketSuccessMessage:
    "Success! Your message has been sent. We will get back to you shortly.",
};
/*Common App messages*/

export const ValidationMessages = {
  NameReq: "Name can not be empty.",
  FNameReq: "Firstname can not be empty.",
  LNameReq: "Lastname can not be empty.",
  EmailReq: "Emailid can not be empty.",
  EmailInvalid: "Emailid is not valid.",
  PwdReq: "Password can not be empty.",
  PwdInvalid: "Password should be minimum 6 to 30 characters.",
  CpwdReq: "Confirm password can not be empty.",
  CpwdInvalid: "Confirm password should be minimum 6 to 30 characters.",
  CpwdMatch: "Confirm password and passwords are not same.",
  MobileReq: "Mobile number can not be empty.",
  MobileInvalid: "Mobile number is not valid.",
  LandlineReq: "Landline number can not be empty.",
  LandlineInvalid: "Landline number is not valid.",
  PhoneReq: "Phone number can not be empty.",
  PhoneInvalid: "Phone number is not valid.",
  CompanynameReq: "Company name can not be empty.",
  WebsiteReq: "Website can not be empty.",
  WebsiteInvalid: "Website is not valid.",
  ZipReq: "Zip code can not be empty.",
  ZipInvalid: "Zip code is not valid.",
  ProfiletypeReq: "Profile type can not be empty.",
  CategoryReq: "Category can not be empty.",
  CountryReq: "Country can not be empty.",
  StateReq: "State can not be empty.",
  CityReq: "City can not be empty.",
  TermsReq: "Please check the terms.",
  SubjectReq: "Subject can not be empty.",
  MessageReq: "Message can not be empty.",
  SearchKeywordReq: "Keyword can not be empty.",
  LocationReq: "Location can not be empty.",
  FileReq: "File can not be empty.",
  FileFormatInvalid: "File format is invalid.",
  FileSizeInvalid: "File size exceeds the limit of",
  DateReq: "Date can not be empty.",
  DateInvalid: "Date is not valid.",
  PropertyTitleReq: "Property title can not be empty.",
  PropertyTitleInvalid: "Property title is not valid.",
  Address1Req: "Address 1 can not be empty.",
  Address1Invalid: "Address 1 is not valid.",
  Address2Req: "Address 2 can not be empty.",
  Address2Invalid: "Address 2 is not valid.",
  DescriptionReq: "Description can not be empty.",
  DescriptionInvalid: "Description is not valid.",
  StartEndDateGreater: "Start date should be grater than End date.",
  ContractTypeReq: "Contract type can not be empty.",
  AssetTypeReq: "Property type can not be empty.",
  AccessTypeReq: "Access type can not be empty.",
  BedroomsReq: "Bedrooms can not be empty.",
  BathroomsReq: "Bathrooms can not be empty.",
  RentReq: "Rent amount can not be empty.",
  RentInvalid: "Rent amount is not valid.",
  AdvanceReq: "Advance amount can not be empty.",
  AdvanceInvalid: "Advance amount is not valid.",
  AmountReq: "Amount can not be empty.",
  AmountInvalid: "Amount is not valid.",
  SqfeetReq: "Squarefeet can not be empty.",
  SqfeetInvalid: "Squarefeet is not valid.",
  AgentPercentReq: "Agent percentage can not be empty.",
  AgentPercentInvalid: "Agent percentage is not valid.",
};

/*Api Urls*/
export let ApiUrls = {
  getToken: `token/v1/GetToken`,
  getDdlCountries: `common/v1/GetDdlCountries`,
  getDdlStates: `common/v1/GetDdlStates`,
  getDdlCities: `common/v1/GetDdlCities`,
  getDdlSupportTypes: `common/v1/GetDdlSupportTypes`,
  createSupportTicket: `common/v1/CreateSupportTicket`,
  getAppConfig: `common/v1/GetAppConfig`,
  getProfileTypes: `users/v1/GetProfileTypes`,
  getProfileCategories: `users/v1/GetProfileCategories`,
  registerUser: `users/v1/RegisterUser`,
  login: `users/v1/Login`,
  logout: `users/v1/Logout`,
  getUserProfiles: `users/v1/GetUserProfiles`,
  upgradePlan: `users/v1/UpgradePlan`,
  getTopAgents: `users/v1/GetTopAgents`,
  getAssetTypes: `assets/v1/GetAssetTypes`,
  getAssetContractTypes: `assets/v1/GetAssetContractTypes`,
  getAssetAcccessTypes: `assets/v1/GetAssetAccessTypes`,
  getAssetsAppConfig: `assets/v1/GetAssetsAppConfig`,
  addAsset: `assets/v1/AddAsset`,
  addAssetImages: `assets/v1/AddAssetImages`,
  getUserAssets: `assets/v1/GetUserAssets`,
  getAssets: `assets/v1/GetAssets`,
  getAssetDetails: `assets/v1/GetAssetDetails`,
  getUserAssetDetails: `assets/v1/GetUserAssetDetails`,
  deleteAsset: `assets/v1/DeleteAsset`,
  deleteAssetImage: `assets/v1/DeleteAssetImage`,
  deleteAssetOwner: `assets/v1/DeleteAssetOwner`,
  getTopAssets: `assets/v1/GetTopAssets`,
  getPricingPlans: `plans/v1/GetPricingPlans`,
};
/*Api Urls*/
