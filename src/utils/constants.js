import config from "../config.json";

/*App Constants*/
export const AppConstants = {
  DebounceDelay: 500,
  DdlSearchMinLength: 2,
};
/*App Constants*/

/*Notification Types*/
export const NotificationTypes = {
  Notification: 1,
  Message: 2,
  Payment: 3,
};
/*Notification Types*/

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
  AgentDetailsId: "agid",
  ObjAssetfilters: "oasf",
  OwnerTenantConnectionTab: "otcontab",
  TenantCheckoutPaymentId: "tcpmid",
  EditProfileId: "epid",
  SendAgreementId: "sagid",
  ViewAgreementId: "vagid",
  ObjSendAgreement: "osag",
  ViewEditDocumentId: "vedid",
  ViewEditDocfolderId: "vedfid",
  ViewSharedDocfolderId: "vsdfid",
  ViewSharedDocRootfolderId: "vsdrfid",
  ViewSharedDocRootfolder: "vsdrf",
  ViewSharedDocUsersSharedId: "vsdusid",
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
  ps5: 5,
  ps3: 3,
};
/*Grid default values*/

/*connection tab ids*/
export const UserConnectionTabIds = {
  requested: "#tab-requested",
  joined: "#tab-joined",
  connection: "#tab-connection",
};
/*connection tab ids*/

/*documents tab ids*/
export const DocumentsTabIds = {
  mydocuments: "#tab-mydocuments",
  shareddocuments: "#tab-shared",
};
/*connection tab ids*/

/*file upload progess states*/
export const UploadProgressState = {
  NotStarted: 0,
  Started: 1,
  Uploading: 2,
  Completed: 3,
};
/*file upload progess states*/

/*Common App messages*/
export const AppMessages = {
  DdlDefaultSelect: " Select ",
  DdlTypetoSearch: "Type to search ",
  DdlNoData: "No data found.",
  DdLLoading: "Loading...",
  NoCountries: "No countires found.",
  NoStates: "No states found.",
  NoCities: "No cities found.",
  NoData: "No data found...",
  NoUsers: "No users found...",
  NoHistory: "No history found...",
  NoProfiles: "No profiles found...",
  NoProfileTypes: "No profile types found...",
  NoProperties: "No properties found...",
  NoConnectedProperties: "No connected properties found...",
  NoPayments: "No payments found...",
  NoPropertyDetails: "Property details not found...",
  NoConnection: `No connections found...`,
  NoTenants: `No ${Object.keys(config.userProfileTypes)
    .find(
      (key) => config.userProfileTypes[key] === config.userProfileTypes.Tenant
    )
    .toLowerCase()}s found...`,
  NoTenantRequests: `No ${Object.keys(config.userProfileTypes)
    .find(
      (key) => config.userProfileTypes[key] === config.userProfileTypes.Tenant
    )
    .toLowerCase()} requests found...`,
  NoAgents: `No ${Object.keys(config.userProfileTypes)
    .find(
      (key) => config.userProfileTypes[key] === config.userProfileTypes.Agent
    )
    .toLowerCase()}s found...`,
  NoAgentRequests: `No ${Object.keys(config.userProfileTypes)
    .find(
      (key) => config.userProfileTypes[key] === config.userProfileTypes.Agent
    )
    .toLowerCase()} requests found...`,
  NoOwners: `No ${Object.keys(config.userProfileTypes)
    .find(
      (key) => config.userProfileTypes[key] === config.userProfileTypes.Owner
    )
    .toLowerCase()}s found...`,
  NoOwnerRequests: `No ${Object.keys(config.userProfileTypes)
    .find(
      (key) => config.userProfileTypes[key] === config.userProfileTypes.Owner
    )
    .toLowerCase()} requests found...`,
  SomeProblem: "Some problem occured, Please try again.",
  AsyncSelectNoData: [{ Id: "", Text: "No data found." }],
  AsyncSelectDefaultSelect: [{ Id: "", Text: " Select " }],
  DeleteConfirmationTitle: "Are you sure?",
  DeleteAssetConfirmationMessage: "You want to delete {propertyname} property.",
  SendInvitaionModalTitle: "Send Invitation",
  SendMessageModalTitle: "Send Message",
  AddPropertySuccess: "Property successfully...",
  UpdatePropertySuccess: "Property details updated successfully...",
  DeleteAssetSuccess: "Property deleted successfully...",
  DeleteImageSuccess: "Image deleted successfully...",
  DeleteAssetOwnerSuccess: "Owner removed successfully...",
  NoNewNotifications: "No new notifications...",
  DeleteNotificationConfirmationMessage:
    "You want to delete '{notificationmessage}' notification.",
  DeleteNotificationSuccess: "Notification deleted successfully...",
  NoNotifications: "No notifications found...",
  SendNotificationModalTitle: "Send Notification",
  SendPaymentNotificationModalTitle: "Send Payment Notification",
  SupportTicketSuccess:
    "Your message has been sent. We will get back to you shortly.",
  ProfileDetailsNotFound: "Profile details not found...",
  UpdateProfileSuccess: "Profile details updated successfully...",
  NoAgreementTemplates: "No templates found...",
  NoDocuments: `No documents found...`,
  DeleteDocumentMessage: "You want to delete the {name}.",
  EditFolderModalTitle: "Edit folder",
  ShareFolderModalTitle: "Share Folder",
  DdlNoFolders: "No folders found.",
  AddDocumentSuccess: "Document added successfully...",
  AddFolderModalTitle: "Create folder",
  UploadDocumentSuccess: "Documents uploaded successfully...",
  DocumentRemoveAccessMessage: "You want to remove access for {name}.",
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
  CardNumberReq: "Card number can not be empty.",
  CardNumberInvalid: "Card number is not valid.",
  CardExpiryReq: "Card expiry date can not be empty.",
  CardExpiryInvalid: "Card expiry date is not valid.",
  CvvReq: "CVV can not be empty.",
  CvvInvalid: "CVV is not valid.",
  ProfiletypeReq: "Profile type can not be empty.",
  CategoryReq: "Category can not be empty.",
  CountryReq: "Country can not be empty.",
  CountryInvalid: "Country is not valid.",
  ContactforReq: "Contact for can not be empty.",
  StateReq: "State can not be empty.",
  StateInvalid: "State is not valid.",
  CityReq: "City can not be empty.",
  CityInvalid: "City is not valid.",
  TermsReq: "Please check the terms.",
  SubjectReq: "Subject can not be empty.",
  MessageReq: "Message can not be empty.",
  AboutmeReq: "Aboutme can not be empty.",
  SearchKeywordReq: "Keyword can not be empty.",
  LocationReq: "Location can not be empty.",
  FileReq: "File can not be empty.",
  FileFormatInvalid: "File format is invalid.",
  FileSizeInvalid: "File size exceeds the limit of",
  DateReq: "Date can not be empty.",
  DateInvalid: "Date is not valid.",
  TenureStartDateReq: "Tenure start date can not be empty.",
  TenureStartDateInvalid: "Tenure start date is not valid.",
  TenureEndDateReq: "Tenure end date can not be empty.",
  TenureEndDateDateInvalid: "enure end date is not valid.",
  RentPaidToReq: "Rent paid to can not be empty.",
  PropertyReq: "Property can not be empty.",
  TenantReq: "Tenant can not be empty.",
  AgentReq: "Agent can not be empty.",
  OwnerReq: "Owner can not be empty.",
  UserReq: "User can not be empty.",
  PropertyTitleReq: "Property title can not be empty.",
  PropertyTitleInvalid: "Property title is not valid.",
  AddressReq: "Address can not be empty.",
  AddressInvalid: "Address is not valid.",
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
  TitleReq: "Title can not be empty.",
  TitleInvalid: "Title is not valid.",
  CommentsReq: "Comments can not be empty.",
  DocumentTypeReq: "Document type can not be empty.",
  UploadFileReq: "Please select files to upload.",
};

/*Api Urls*/
export let ApiUrls = {
  getToken: `token/v1/GetToken`,
  getDdlCountries: `common/v1/GetDdlCountries`,
  getDdlStates: `common/v1/GetDdlStates`,
  getDdlCities: `common/v1/GetDdlCities`,
  getDdlSupportTypes: `common/v1/GetDdlSupportTypes`,
  getAppConfig: `common/v1/GetAppConfig`,
  createSupportTicket: `common/v1/CreateSupportTicket`,
  getProfileTypes: `users/v1/GetProfileTypes`,
  getProfileCategories: `users/v1/GetProfileCategories`,
  registerUser: `users/v1/RegisterUser`,
  updateUser: `users/v1/UpdateUser`,
  login: `users/v1/Login`,
  logout: `users/v1/Logout`,
  getUserProfiles: `users/v1/GetUserProfiles`,
  upgradePlan: `users/v1/UpgradePlan`,
  getTopAgents: `users/v1/GetTopAgents`,
  getDdlUsersProfiles: `users/v1/GetDdlUsersProfiles`,
  getDdlUsers: `users/v1/GetDdlUsers`,
  getUserConnections: `users/v1/getUserConnections`,
  getDdlJoinedUserConnections: `users/v1/GetDdlJoinedUserConnections`,
  getJoinedUserConnections: `users/v1/GetJoinedUserConnections`,
  getRequestedUserConnections: `users/v1/getRequestedUserConnections`,
  getUserConnectionsHistory: `users/v1/getUserConnectionsHistory`,
  getUserConnectedAssets: `users/v1/GetUserConnectedAssets`,
  updateUserConnectionStatus: `users/v1/UpdateUserConnectionStatus`,
  createUserConnection: `users/v1/CreateUserConnection`,
  getUserDetails: `users/v1/GetUserDetails`,
  getAgents: `users/v1/GetAgents`,
  getAssetTypes: `assets/v1/GetAssetTypes`,
  getAssetListingTypes: `assets/v1/GetAssetListingTypes`,
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
  getDdlUserAssets: `assets/v1/GetDdlUserAssets`,
  getPricingPlans: `plans/v1/GetPricingPlans`,
  getTopNotifications: `notifications/v1/GetTopNotifications`,
  updateNotificationRead: `notifications/v1/UpdateNotificationRead`,
  getDdlNotificationTypes: `notifications/v1/GetDdlNotificationTypes`,
  getNotifications: `notifications/v1/GetNotifications`,
  deleteNotification: `notifications/v1/DeleteNotification`,
  createNotification: `notifications/v1/CreateNotification`,
  createAssetPayment: `payments/v1/CreateAssetPayment`,
  getAssetPayments: `payments/v1/GetAssetPayments`,
  getAssetPaymentDetails: `payments/v1/GetAssetPaymentDetails`,
  processAssetPayment: `payments/v1/ProcessAssetPayment`,
  getAgreements: `agreements/v1/GetAgreements`,
  getAgreementDetails: `agreements/v1/GetAgreementDetails`,
  getAgreementFile: `agreements/v1/GetAgreementFile`,
  getDocumentsList: `documents/v1/GetDocumentsList`,
  getDocumentsTypes: `documents/v1/GetDocumentTypes`,
  deleteDocument: `documents/v1/DeleteDocument`,
  getDdlDocumentFolders: `documents/v1/GetDdlDocumentFolders`,
  addDocumentFolder: `documents/v1/AddDocumentFolder`,
  getSharedDocuments: `documents/v1/GetSharedDocuments`,
  shareDocument: `documents/v1/ShareDocument`,
  getDocumentDetails: `documents/v1/GetDocumentDetails`,
  getDocumentFile: `documents/v1/GetDocumentFile`,
  editDocument: `documents/v1/EditDocument`,
  addDocument: `documents/v1/AddDocument`,
  getFolderDocuments: `documents/v1/GetFolderDocuments`,
  getDocumentFoldersHierarchy: `documents/v1/GetDocumentFoldersHierarchy`,
  getDocumentSharedUsers: `documents/v1/GetDocumentSharedUsers`,
  removeSharedDocumentAccess: `documents/v1/RemoveSharedDocumentAccess`,
  unshareDocument: `documents/v1/UnshareDocument`,
};
/*Api Urls*/
