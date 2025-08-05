

export const CHECK_EMAIL_API = "/api/Auth/check-email";
export const RESET_PASSWORD_API = "/api/Auth/reset-password";
export const VERIFY_OTP_API = "/api/Auth/verify-otp";
export const LOGIN_USER_API = "/api/Auth/login";
export const DOOR_INSPECTION_API = "/api/Report/DownloadPropertyInspectionPDF";
export const GET_CLINET_ID_API = "/api/MasterData/GetClientUserRoleMapping";
export const PROPERTY_DASHBOARD_API =
  "/api/GetInspectionData/summary-by-clientId?";
export const GET_PROPERTY_INFO_WITH_MASTER =
  "/api/Inspection/GetInspectionMasterData/";
export const GENERATEQRCODE_API = "api/QrCode?text=";
export const SAVE_SURVEY_FORM_DATA = "/api/Inspection/inspection/save";
export const UPLOAD_IMAGE_API = "/api/Inspection/upload";
export const DELETE_IMAGE_API = "/api/Inspection/delete-blob-url?blobUrl=";
export const GET_INSPECTION_PROPERTY_INFO_BYID =
  "/api/Inspection/GetInspectionPropertyInfoById/";
export const CREATE_INSPECTION_PROPERTY_APPROVAL_HISTORY =
  "/api/Inspection/CreateInspectionPropertyApprovalHistory";
export const GET_PROPERTY_USER_MAPPING =
  "/api/Inspection/GetPropertyUserMapping/";
export const GET_NEXT_REF_NUMBER = "/api/Inspection/GetNextRefNumber/";
export const UPDATE_PROPERTY_USER_MAPPING_STATUS =
  "/api/Inspection/UpdateStatusOfPropertyUserMapping/";
export const GET_PROPERTY_COMPLIANCE_SUMMARY =
  "/api/GetInspectionData/GetPropertyComplianceSummary";
export const GET_DOOR_INSPECTION_DATA = 
  "/api/GetInspectionData/GetFullInspectionByDoorRef?doorRef=";
  export const GET_FLOORPLAN_IMAGE = 
  "/api/GetInspectionData/GetFLoorPlanByFloorNo?";