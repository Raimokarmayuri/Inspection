// import * as FileSystem from "expo-file-system";
// import { useLocalSearchParams, useNavigation } from "expo-router";
// import React, { useEffect, useRef, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   Text,
//   TextInput,
// } from "react-native";
// import { useSelector } from "react-redux";
// import {
//   GET_CLINET_ID_API,
//   GET_DOOR_INSPECTION_DATA,
//   GET_PROPERTY_INFO_WITH_MASTER,
//   SAVE_SURVEY_FORM_DATA,
// } from "../../components/api/apiPath";

// import { hostName } from "@/components/config/config";
// import http from "../../components/api/server";
// import FormComponent from "../../components/common/FormComponent";
// import { RootState } from "../../components/slices/store";
// import {
//   ActionImages,
//   ActionMenuFlag,
//   ComplianceCheck,
//   FormData,
// } from "../../components/types";

// export const BASE_MEASURES: (keyof FormData)[] = [
//   "head",
//   "hinge",
//   "closing",
//   "threshold",
// ];

// export const BASE_MEASURES_COMP: (keyof ComplianceCheck)[] = [
//   "pyroGlazing",
//   "coldSmokeSeals",
//   "fireLockedSign",
//   "gapUnderDoor",
//   "visionPanel",
// ];

// // keep this type near the top of the file
// type ComplianceKey =
//   | "intumescentStrips"
//   | "coldSmokeSeals"
//   | "selfClosingDevice"
//   | "fireLockedSign"
//   | "fireShutSign"
//   | "holdOpenDevice"
//   | "visibleCertification"
//   | "doorGlazing"
//   | "pyroGlazing";

// const COMPLIANCE_CHECK_MASTER: Record<`${ComplianceKey}Id`, string> = {
//   intumescentStripsId: "927da4a9-3c0b-46a7-8fb2-00af566a41e6",
//   coldSmokeSealsId: "2d46bbc6-3a52-48ee-ad7d-80c3f3cdf352",
//   selfClosingDeviceId: "145baf7e-bcc6-4c8f-b925-070e751ba2d6",
//   fireLockedSignId: "942c7963-7d98-49db-a13e-63ee7b4fcfd1",
//   fireShutSignId: "b7157137-2bfc-423d-b236-6620c527519b",
//   holdOpenDeviceId: "a106ba4e-ef40-4510-851e-09d1315becc5",
//   visibleCertificationId: "99ab902f-794a-491b-a6e3-26c8a57f9527",
//   doorGlazingId: "1b2886cc-a1a3-4573-a5be-7df68c0db109",
//   pyroGlazingId: "c9873267-e600-4c99-bf08-088dee277909",
// };

// const defaultActionMenuFlag: ActionMenuFlag = {
//   head: false,
//   hinge: false,
//   closing: false,
//   threshold: false,
// };

// const formatDateString = (date: string | Date): string => {
//   const d = new Date(date);
//   return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
//     2,
//     "0"
//   )}-${String(d.getDate()).padStart(2, "0")}`;
// };

// const isHttpUrl = (u?: string) => !!u && /^https?:\/\//i.test(u);

// const ViewSurvey: React.FC = () => {
//   const params = useLocalSearchParams();
//   const navigation = useNavigation();

//    interface BasicInfo {
//     buildingName: string;
//     uniqueRef: string;
//     date: string;
//     location: string;
//     floor: string;
//     floorPlan: string[]; // make sure this matches what you're assigning
//     comments: string;
//   }

//   // const mode = params.mode?.toString(); // "view" | "edit" | undefined
//   const userObj = useSelector((state: RootState) => state.user?.userObj);
//   const [doorOtherFlag, setDoorOtherFlag] = useState(false);
//   const [basicInfo, setBasicInfo] = useState<BasicInfo>({
//     buildingName: "",
//     uniqueRef: "",
//     date: new Date().toISOString().split("T")[0],
//     location: "",
//     floor: "",
//     floorPlan: [], // should be string, not array or object
//     comments: "",
//   });
//     const [additionalImages, setAdditionalImages] = useState<string[]>([]);
//   const [propertyId, setPropertyId] = useState<string | null>(null);

//   const [formData, setFormData] = useState<FormData>({} as FormData);
//   // const [complianceCheck, setComplianceCheck] = useState<ComplianceCheck>(
//   //   {} as ComplianceCheck
//   // );

//   // state you already have:
//   const [complianceCheck, setComplianceCheck] = useState<ComplianceCheck>(
//     {} as any
//   );
//   const [actionImages, setActionImages] = useState<ActionImages>({} as any);
//   const [isGlazing, setIsGlazing] = useState<boolean>(true);
//   const [fireKeepLocked, setFireKeepLocked] = useState<boolean>(false);

//   // const [actionImages, setActionImages] = useState<ActionImages>(
//   //   {} as ActionImages
//   // );
//   const [basicFormData, setBasicFormData] = useState<any>({});
//   const [actionMenuFlag, setActionMenuFlag] = useState<ActionMenuFlag>(
//     defaultActionMenuFlag
//   );
//   const [floorPlanImages, setFloorPlanImages] = useState<string[]>([]);
//   const [submitting, setSubmitting] = useState(false);

//   const [doorTypesOption, setDoorTypesOption] = useState<any[]>([]);
//   const [isView, setIsView] = useState(true); // default read-only until data loads
//   const [isColdSeals, setIsColdSeals] = useState(false);
//   // const [isGlazing, setIsGlazing] = useState(false);
//   // const [fireKeepLocked, setFireKeepLocked] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const mandatoryFieldRef = useRef<Record<string, TextInput | null>>({});

//   // NEW: local validation flag so we don’t throw
//   const [validationFlag, setValidationFlag] = useState<boolean>(false);

//   const [toastData, setToastData] = useState({
//     toastShow: false,
//     toastType: "",
//     toastString: "",
//   });

//   // ---------- Validation helpers ----------
//   type FieldKey =
//     // keys that you also use to register refs from FormComponent
//     | "date"
//     | "floor"
//     | "doorNumber"
//     | "doorType"
//     | "doorOther"
//     | "fireResistance"
//     | "hingeLocation";

//   const isBlank = (v: any) =>
//     v === undefined || v === null || String(v).trim() === "";

//   const LABELS: Record<FieldKey, string> = {
//     date: "Inspection Date",
//     floor: "Floor",
//     doorNumber: "Door Reference/Number",
//     doorType: "Door Type",
//     doorOther: "Other Door Type",
//     fireResistance: "Fire Rating",
//     hingeLocation: "Hinge Position",
//   };

//   const REQUIRED_ALWAYS: FieldKey[] = [
//     "date",
//     "floor",
//     "doorNumber",
//     "doorType",
//     "fireResistance",
//     "hingeLocation",
//   ];

//   const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});

//   // const doorRefNumber =
//   //   typeof params.doorRefNumber === "string"
//   //     ? params.doorRefNumber
//   //     : Array.isArray(params.doorRefNumber)
//   //     ? params.doorRefNumber[0]
//   //     : "";

//   // ----- Handlers: plain form changes -----
//   // ViewSurvey.tsx
//   // const handleFormDataChange = (field: string, value: string) => {
//   //   setFormData((prev) => ({ ...prev, [field]: value }));
//   //   if (!isView && ["head", "hinge", "threshold"].includes(field)) {
//   //     const n = parseFloat(String(value).replace(",", "."));
//   //     setActionMenuFlag((prev) => ({
//   //       ...prev,
//   //       [field]: Number.isFinite(n) && n > 3,
//   //     }));
//   //   }
//   // };

//   // helper: look up the label for a doorType id
//   const getDoorTypeName = (
//     id?: string | number,
//     opts?: { doorTypeId: number; doorTypeName: string }[]
//   ) => {
//     if (!id || !opts?.length) return "";
//     const found = opts.find((o) => String(o.doorTypeId) === String(id));
//     return found?.doorTypeName ?? "";
//   };

//   const handleFormDataChange = (field: string, value: string) => {
//     // 1) Keep both "other" keys in sync no matter which one the UI touches
//     if (field === "doorOther" || field === "otherDoorTypeName") {
//       setFormData((prev) => ({
//         ...prev,
//         doorOther: value,
//         otherDoorTypeName: value,
//       }));
//       return;
//     }

//     // 2) When Door Type changes:
//     if (field === "doorType") {
//       // Resolve the display name for the selected id
//       const selectedName = getDoorTypeName(value, doorTypesOption)
//         ?.trim()
//         .toLowerCase();

//       const isOther =
//         selectedName?.includes("other") ||
//         String(value).trim().toLowerCase() === "other"; // in case backend literally sends "other"

//       // Toggle the extra input visibility
//       setDoorOtherFlag(isOther);

//       setFormData((prev) => ({
//         ...prev,
//         doorType: value,
//         doorTypeName:
//           getDoorTypeName(value, doorTypesOption) || prev.doorTypeName,
//         // If NOT Other, clear any stale custom text; if Other, keep whatever is already there
//         doorOther: isOther
//           ? prev.doorOther ?? prev.otherDoorTypeName ?? ""
//           : "",
//         otherDoorTypeName: isOther
//           ? prev.otherDoorTypeName ?? prev.doorOther ?? ""
//           : "",
//       }));
//       return;
//     }

//     // 3) Default: just set the field
//     setFormData((prev) => ({ ...prev, [field]: value }));

//     // 4) Your existing action-menu rule for gap fields (>3)
//     if (!isView && ["head", "hinge", "threshold"].includes(field)) {
//       const n = parseFloat(String(value).replace(",", "."));
//       setActionMenuFlag((prev) => ({
//         ...prev,
//         [field]: Number.isFinite(n) && n > 3,
//       }));
//     }
//   };

//   const handleComplianceActionFieldsChange = (
//     field: string, // e.g. "intumescentStrips"
//     type: string, // "Severity" | "Category" | "Remediation" | "Comments" | "DueDate" | "Timeline"
//     value: string
//   ) => {
//     setComplianceCheck((prev) => ({
//       ...prev,
//       [`${field}${type}`]: value,
//     }));
//   };

//   const clearCompliance = (k: ComplianceKey, next: any) => {
//     next[`${k}Timeline`] = "";
//     next[`${k}Severity`] = "";
//     next[`${k}Category`] = "";
//     next[`${k}Comments`] = "";
//     next[`${k}DueDate`] = "";
//     next[`${k}Remediation`] = "";
//     next[`${k}Images`] = []; // if you ever store Images on cc
//     setActionImages((ai) => ({ ...ai, [k]: [] }));
//   };

//   const handleComplianceToggle = (field: ComplianceKey, nextVal: boolean) => {
//     setComplianceCheck((prev) => {
//       const next: any = { ...prev, [field]: nextVal };

//       // Self closer → hide Keep Locked when YES
//       if (field === "selfClosingDevice") {
//         setFireKeepLocked(!nextVal);
//         if (nextVal) {
//           next.fireLockedSign = true;
//           clearCompliance("fireLockedSign", next);
//         }
//       }

//       // Glazing → hide Pyro when NO
//       if (field === "doorGlazing") {
//         setIsGlazing(nextVal);
//         if (!nextVal) {
//           next.pyroGlazing = true;
//           clearCompliance("pyroGlazing", next);
//         }
//       }

//       // Generic: if toggled to YES, clear its own action/images
//       if (nextVal) {
//         clearCompliance(field, next);
//       }

//       return next;
//     });
//   };

//   // ----- Handlers: MiniCapture integration -----
//   // keep field-first internally
//   // REPLACE your current handleImagesChangeMini with this:
//   // const handleImagesChangeMini = (images: string[], field: string) => {
//   //   const key = field.toLowerCase();
//   //   setActionImages(prev => ({ ...prev, [key]: images }));
//   //   setFormData(prev => ({ ...prev, [`${key}Images`]: images }));
//   // };

// async function base64DataUrlToFileUri(
//   dataUrl: string
// ): Promise<{ uri: string; name: string; type: string }> {
//   console.log("[upload] base64DataUrlToFileUri start", {
//     len: dataUrl?.length,
//     head: dataUrl?.slice(0, 30),
//   });

//   if (!dataUrl) throw new Error("Empty dataUrl");
//   const match = dataUrl.match(/^data:(.+?);base64,(.*)$/);
//   const type = match?.[1] || "image/jpeg";
//   const base64 = match?.[2] || dataUrl.replace(/^data:.+;base64,/, "");
//   const name = `Upload_${Date.now()}.${type.includes("png") ? "png" : "jpg"}`;
//   const path = FileSystem.cacheDirectory + name;
//   await FileSystem.writeAsStringAsync(path, base64, {
//     encoding: FileSystem.EncodingType.Base64,
//   });
//     console.log("[upload] base64DataUrlToFileUri wrote file", path);

//   return { uri: path, name, type };

// }

// const guessMimeFromName = (name: string) => {
//   const ext = name.split(".").pop()?.toLowerCase();
//   if (ext === "png") return "image/png";
//   if (ext === "webp") return "image/webp";
//   return "image/jpeg";
// };
// async function normaliseForUpload(
//   src: string,
//   field: string
// ): Promise<{ uri: string; name: string; type: string }> {
//   console.log("[upload] normaliseForUpload start", {
//     field,
//     srcHead: src?.slice(0, 40),
//     platform: Platform.OS,
//   });

//   if (!src) throw new Error("Invalid image source");
//   if (src.startsWith("data:image/")) {
//     return base64DataUrlToFileUri(src);
//   }
//   const name = `${field}_Image_${Date.now()}.jpg`;
//   return { uri: src, name, type: guessMimeFromName(name) };
// }

// const uploadImageAPI = async (newImages: string[], field: string): Promise<string> => {
//   console.groupCollapsed("[upload] uploadImageAPI", field);
//   try {
//     const last = (newImages || []).filter(Boolean).pop();
//     console.log("[upload] last", last);
//     if (!last) return "";

//     // Already uploaded?
//     if (/^https?:\/\//i.test(last)) {
//       console.log("[upload] already a URL");
//       return last;
//     }

//     // ---- auth/header/url ----
//     const rawToken = userObj?.token ?? "";
//     const auth = rawToken && (rawToken.startsWith("Bearer ") ? rawToken : `Bearer ${rawToken}`);
//     const apiBase = (hostName || "").replace(/\/+$/, "");
//     const url = `${apiBase}/api/Inspection/upload`;

//     // Build a local file path we can upload
//     const filenameBase = `${field}_${Date.now()}`;
//     let fileUri = last;
//     let name = `${filenameBase}.jpg`;
//     let type = "image/jpeg";

//     if (last.startsWith("data:")) {
//       // data URL -> write to cache
//       const match = last.match(/^data:(.+?);base64,(.*)$/);
//       const mime = match?.[1] || "image/jpeg";
//       const base64 = match?.[2] || "";
//       const ext = mime.includes("png") ? "png" : "jpg";
//       name = `${filenameBase}.${ext}`;
//       type = mime;
//       fileUri = FileSystem.cacheDirectory + name;
//       await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
//       console.log("[upload] wrote data URL to", fileUri);
//     } else if (!/^file:|^content:/i.test(last)) {
//       // any other scheme on native -> download first
//       const target = FileSystem.cacheDirectory + name;
//       const dl = await FileSystem.downloadAsync(last, target);
//       fileUri = dl.uri;
//       console.log("[upload] downloaded to", fileUri);
//     } else {
//       // file:// or content:// — keep as-is
//       const tail = last.split("/").pop() || name;
//       name = tail;
//       if (tail.toLowerCase().endsWith(".png")) type = "image/png";
//       console.log("[upload] using local file", fileUri, name, type);
//     }

//     if (Platform.OS === "web") {
//       // ---------- WEB: use fetch + FormData ----------
//       const form = new FormData();
//       const blob = await (await fetch(fileUri)).blob();
//       const ext = /png/i.test(blob.type) ? "png" : "jpg";
//       const webName = name.includes(".") ? name : `${filenameBase}.${ext}`;
//       form.append("File", blob, webName);
//       form.append("Client", "ABC");
//       form.append("Property", "Candor");
//       form.append("InspectionDate", new Date().toISOString());

//       console.log("[upload] web POST", url);
//       const resp = await fetch(url, {
//         method: "POST",
//         headers: auth ? { Authorization: auth } : undefined,
//         body: form,
//       });
//       if (!resp.ok) {
//         const text = await resp.text().catch(() => "");
//         console.error("[upload] web failed", resp.status, text?.slice(0, 300));
//         return "";
//       }
//       const data = await resp.json().catch(() => ({} as any));
//       console.log("[upload] web ok", data?.result?.blobUrl);
//       return data?.result?.blobUrl || "";
//     } else {
//       // ---------- NATIVE: use FileSystem.uploadAsync (no FormData) ----------
//       console.log("[upload] native uploadAsync", { url, fileUri, name, type });
//       const result = await FileSystem.uploadAsync(url, fileUri, {
//         httpMethod: "POST",
//         uploadType: FileSystem.FileSystemUploadType.MULTIPART,
//         fieldName: "File",
//         parameters: {
//           Client: "ABC",
//           Property: "Candor",
//           InspectionDate: new Date().toISOString(),
//         },
//         headers: auth ? { Authorization: auth } : undefined,
//         mimeType: type, // optional
//       });

//       // result.body is a string
//       if (result.status !== 200) {
//         console.error("[upload] native failed", result.status, result.body?.slice(0, 300));
//         return "";
//       }
//       let data: any = {};
//       try {
//         data = JSON.parse(result.body);
//       } catch {}
//       console.log("[upload] native ok", data?.result?.blobUrl);
//       return data?.result?.blobUrl || "";
//     }
//   } catch (err) {
//     console.error(`[upload] uploadImageAPI error (field: ${field})`, err);
//     return "";
//   } finally {
//     console.groupEnd();
//   }
// };

//   // helper
//   const isRemoteUrl = (u: string) => /^https?:\/\//i.test(u);

//   // MINI capture (physical/compliance)
//  const handleImagesChangeMini = async (newImages: string[], field: string) => {
//   console.groupCollapsed("[MINI] handleImagesChangeMini", field);
//   try {
//     const prev = actionImages[field] || [];
//     const clean = (newImages || []).filter(Boolean);
//     console.log("[MINI] prev/clean", prev.length, clean.length);

//     const toUpload = clean.filter((u) => !/^https?:\/\//i.test(u));
//     console.log("[MINI] toUpload", toUpload.length);

//     const uploaded = (
//       await Promise.all(toUpload.map((u) => uploadImageAPI([u], field)))
//     ).filter(Boolean) as string[];

//     console.log("[MINI] uploaded", uploaded.length);

//     const next = Array.from(new Set([...prev, ...uploaded, ...clean.filter((u)=>/^https?:\/\//i.test(u))]));
//     console.log("[MINI] next", next.length);

//     setActionImages((p) => ({ ...p, [field]: next }));
//     setFormData((p) => ({ ...p, [`${field}Images`]: next } as any));
//   } catch (e) {
//     console.error("[MINI] handleImagesChangeMini ERROR", e);
//   } finally {
//     console.groupEnd();
//   }
// };

//   // REPLACE your handleDeleteImages with this:
//   // const handleDeleteImages = (field: string, index: number) => {
//   //   const key = field.toLowerCase();
//   //   setActionImages(prev => {
//   //     const list = [...(prev[key] || [])];
//   //     if (index >= 0 && index < list.length) list.splice(index, 1);
//   //     return { ...prev, [key]: list };
//   //   });
//   //   setFormData(prev => {
//   //     const arr = [ ...((prev as any)[`${key}Images`] || []) ];
//   //     if (index >= 0 && index < arr.length) arr.splice(index, 1);
//   //     return { ...prev, [`${key}Images`]: arr };
//   //   });
//   // };
//   const handleDeleteImages = (index: number, field: string) => {
//   console.groupCollapsed("[BIG] handleDeleteImages", field);
//   try {
//     console.log("[BIG] delete index", index);
//     switch (field) {
//       case "Floor": {
//         const before = basicInfo.floorPlan || [];
//         const updated = before.filter((_, i) => i !== index);
//         console.log("[BIG] Floor before/after", before.length, "->", updated.length);
//         setBasicInfo((prev) => ({ ...prev, floorPlan: updated }));
//         break;
//       }
//       case "Door": {
//         const before = (formData as any).doorPhoto || [];
//         const updated = before.filter((_: any, i: number) => i !== index);
//         console.log("[BIG] Door before/after", before.length, "->", updated.length);
//         setFormData((prev) => ({ ...prev, doorPhoto: updated }));
//         break;
//       }
//       default: {
//         const before = actionImages[field] || [];
//         const updated = before.filter((_, i) => i !== index);
//         console.log("[BIG] Mini", field, "before/after", before.length, "->", updated.length);
//         setActionImages((prev) => ({ ...prev, [field]: updated }));
//         setFormData((prev) => ({ ...prev, [`${field}Images`]: updated } as any));
//         break;
//       }
//     }
//   } finally {
//     console.groupEnd();
//   }
// };

//   // const handleActionFieldsChange = (
//   //   key: string,
//   //   value: string,
//   //   type: string
//   // ) => {
//   //   // type: 'Severity' | 'Category' | 'Remediation' | 'Comments' | 'DueDate'
//   //   const fieldName = `${key}${type}`;
//   //   setFormData((prev: any) => ({
//   //     ...prev,
//   //     [fieldName]: value,
//   //   }));
//   // };
//   const handleActionFieldsChange = (
//     field: string,
//     type: string,
//     value: string
//   ) => {
//     setFormData((prev) => ({
//       ...prev,
//       [`${field}${type}`]: value, // e.g. headSeverity = "2"
//     }));
//   };

//   const handleResetAction = (key: string) => {
//     // reset section flags + photos for a specific key
//     setActionMenuFlag((prev) => ({ ...prev, [key]: false }));
//     setActionImages((prev) => ({ ...prev, [key]: [] }));
//     setFormData((prev: any) => ({
//       ...prev,
//       [`${key}Severity`]: "",
//       [`${key}Category`]: "",
//       [`${key}Remediation`]: "",
//       [`${key}Comments`]: "",
//       [`${key}DueDate`]: "",
//     }));
//   };

//   const handleCancel = () => {
//     navigation.goBack();
//   };

//   // --- helpers (top-level inside the component) ---
//  const isEmpty = (v: any) => {
//   if (v == null) return true;
//   if (Array.isArray(v)) return v.length === 0;
//   const t = String(v).trim();
//   return t === "" || t.toLowerCase() === "select";
// };

// const showAlert = (title: string, msg: string) => {
//   Alert.alert(title, msg);
// };
//   // Focus first error using the refs you already register in FormComponent
//   const focusFirstError = (emap: Record<string, string>) => {
//      const key = Object.keys(emap)[0];
//   const ref = mandatoryFieldRef.current?.[key];
//   if (ref && typeof ref.focus === "function") {
//     try { ref.focus(); } catch {}
//   }
//     const preferOrder = [
//       "date",
//       "floor",
//       "doorType",
//       "doorOther",
//       "doorPhoto",
//       "hingeLocation",
//       "fireResistance",
//       "head",
//       "hinge",
//       "closing",
//       "threshold",
//       "doorThickness",
//       "frameDepth",
//       "doorSize",
//       "fullDoorsetSize",
//       "floorPlan",
//     ];
//     for (const key of preferOrder) {
//       if (emap[key]) {
//         const ref = mandatoryFieldRef.current?.[key];
//         if (ref && typeof ref.focus === "function") {
//           try {
//             ref.focus();
//           } catch {}
//         }
//         break;
//       }
//     }
//   };

//   // --- the validator you’ll call from the Submit button ---
// const validateRequired = async (): Promise<boolean> => {
//   if (isView) return true;  // view mode doesn’t submit edits

//   setValidationFlag(true);
//   const e: Record<string, string> = {};

//   // Base requireds
//   if (isEmpty(basicFormData?.date)) e.date = "Inspection Date is required";
//   if (isEmpty(basicFormData?.floor)) e.floor = "Floor is required";
//   if (isEmpty(formData?.doorType)) e.doorType = "Door Type is required";
//   if (doorOtherFlag && isEmpty((formData as any)?.doorOther))
//     e.doorOther = "Other Door Type is required";
//   if (isEmpty(formData?.doorNumber)) e.doorNumber = "Door Number is required";
//   if (isEmpty(formData?.hingeLocation))
//     e.hingeLocation = "Hinge Location is required";
//   if (isEmpty(formData?.fireResistance))
//     e.fireResistance = "Fire rating is required";

//   // Files / images
//   if (isEmpty(basicFormData?.floorPlan)) e.floorPlan = "Floor plan file is required";
//   if (isEmpty(formData?.doorPhoto)) e.doorPhoto = "Door photo is required";

//   // Measurements
//   ["head","hinge","closing","threshold","doorThickness","frameDepth","doorSize","fullDoorsetSize"]
//   .forEach((k) => {
//     if (isEmpty((formData as any)?.[k])) e[k] = `${k} is required`;
//   });

//   if (Object.keys(e).length) {
//     setErrors(e);
//     showAlert(
//       "Missing Required Fields",
//       Object.values(e).map(m => `• ${m}`).join("\n")
//     );
//     focusFirstError(e);
//     return false;
//   }

//   // MiniCapture checks (>3 needs action + photo)
//   const missingMini: string[] = [];
//   ["head","hinge","closing","threshold"].forEach((field) => {
//     const val = Number((formData as any)[field]);
//     if (Number.isFinite(val) && val > 3) {
//       const sev = (formData as any)[`${field}Severity`] ?? "";
//       const cat = (formData as any)[`${field}Category`] ?? "";
//       // const com = (formData as any)[`${field}Comments`] ?? "";
//       const rem = (formData as any)[`${field}Remediation`] ?? "";
//       const dd  = (formData as any)[`${field}DueDate`] ?? "";
//       // const imgs = (actionImages as any)?.[field] ?? [];
//       if (isEmpty(sev) || isEmpty(cat)|| isEmpty(rem) || isEmpty(dd)) {
//         missingMini.push(`${field}: add severity, category, comments, remediation, due date, and at least 1 photo`);
//       }
//     }
//   });

//   if (missingMini.length) {
//     showAlert(
//       "Missing Action Details",
//       `For gaps > 3mm, action details are mandatory:\n\n${missingMini.map(m => `• ${m}`).join("\n")}`
//     );
//     return false;
//   }

//   setErrors({});
//   return true;
// };

//   // ----- Submit -----
//   const handleSubmit = async (status: string = "Compliant") => {

//     setValidationFlag(true);
//      const quickErrors: Record<string, string> = {};
//   if (!isView) {
//     if (isEmpty(basicFormData?.floor)) quickErrors.floor = "Floor is required";
//     if (isEmpty(formData?.doorType)) quickErrors.doorType = "Door Type is required";
//     if (isEmpty(formData?.hingeLocation)) quickErrors.hingeLocation = "Hinge Location is required";
//     if (Object.keys(quickErrors).length) {
//       setErrors(quickErrors);
//       focusFirstError(quickErrors);
//       return;
//     }
//   }
//     // if (!validateRequired()) return;
//     try {
//       setSubmitting(true);

//       const phyKeys: ("head" | "hinge" | "closing" | "threshold")[] = [
//         "head",
//         "hinge",
//         "closing",
//         "threshold",
//       ];

//       // Helper: does this physical section have an action?
//       const isActive = (k: string) => {
//         const m = Number((formData as any)[k]);
//         const hasAny =
//           !!(formData as any)[`${k}Severity`] ||
//           !!(formData as any)[`${k}Category`] ||
//           !!(formData as any)[`${k}Remediation`] ||
//           !!(formData as any)[`${k}Comments`] ||
//           !!(formData as any)[`${k}DueDate`];
//         return (Number.isFinite(m) && m >= 4) || hasAny;
//       };

//       // ---- physicalMeasurement ----
//       const physicalMeasurement: any = {
//         fireRatingID: (formData as any).fireResistance ?? "",
//         // comments: basicFormData?.comment ?? "No comments",
//         comments: basicFormData?.comments ?? "No comments",
//         hingePosition: (formData as any).hingeLocation ?? "",
//       };

//       // ---- complianceChecks ----

//       phyKeys.forEach((k) => {
//         const active = isActive(k);
//         physicalMeasurement[k] = {
//           value: Number((formData as any)[k]),
//           actionItem: active ? "yes" : "no",
//           timeline: active ? "Short term" : "",
//           severity: active ? (formData as any)[`${k}Severity`] ?? "" : "",
//           comment: active ? (formData as any)[`${k}Comments`] ?? "" : "",
//           category: active ? (formData as any)[`${k}Category`] ?? "" : "",
//           dueDate: active ? (formData as any)[`${k}DueDate`] ?? null : null,
//           remediation: active ? (formData as any)[`${k}Remediation`] ?? "" : "",
//           photos: active ? actionImages[k] ?? [] : [],
//         };
//       });

//       // non-gap physical fields (always no action)
//       (
//         ["doorThickness", "frameDepth", "doorSize", "fullDoorsetSize"] as const
//       ).forEach((key) => {
//         physicalMeasurement[key] = {
//           value: Number((formData as any)[key]),
//           actionItem: "no",
//           timeline: "",
//           severity: "",
//           comment: "",
//           category: "",
//           dueDate: null,
//           remediation: "",
//           photos: [],
//         };
//       });

//       // ---- complianceChecks ----
//       const compArr: ComplianceKey[] = [
//         "intumescentStrips",
//         "coldSmokeSeals",
//         "selfClosingDevice",
//         "fireLockedSign",
//         "fireShutSign",
//         "holdOpenDevice",
//         "visibleCertification",
//         "doorGlazing",
//         "pyroGlazing",
//       ];

//       const complianceChecks = compArr.map((item) => {
//         const id = (complianceCheck as any)[`${item}Id`] ?? "";
//         const isCompliant = Boolean((complianceCheck as any)[item]);

//         // special case: when a self closer exists, "Keep Locked" never requires action
//         const suppressFireLocked = item === "fireLockedSign" && !fireKeepLocked;

//         const requireAction = !suppressFireLocked && !isCompliant;

//         const sev = (complianceCheck as any)[`${item}Severity`] ?? "";
//         const com = (complianceCheck as any)[`${item}Comments`] ?? "";
//         const cat = (complianceCheck as any)[`${item}Category`] ?? "";
//         const dd = (complianceCheck as any)[`${item}DueDate`] || null; // "" → null
//         const rem = (complianceCheck as any)[`${item}Remediation`] ?? "";
//         const photos = ((actionImages as any)[item] ?? []) as string[];

//         return {
//           complianceCheckMasterID: id,
//           isCompliant,
//           // actionItem: requireAction
//           //   ? {
//           //       timeline: "Short term",
//           //       severity: sev,
//           //       comment: com,
//           //       category: cat,
//           //       dueDate: dd,
//           //       remediation: rem,
//           //       photos,
//           //     }
//           //   : {
//           //       timeline: "",
//           //       severity: "",
//           //       comment: "",
//           //       category: "",
//           //       dueDate: null,
//           //       remediation: "",
//           //       photos: [],
//           //     },
//              actionItem: !isCompliant
//     ? { timeline: "Short term", severity: sev ?? "", comment: com ?? "", category: cat ?? "", dueDate: dd, remediation: rem ?? "", photos }
//      : null, // ← IMPORTANT: null, not an empty object
// //  };
// // });
//         };
//       });

//       // ---- door photos map ----
//       //  const doorImgArr = formData.doorPhoto;
//       const doorImgArr = Array.isArray(formData.doorPhoto) ? formData.doorPhoto : [];
//       const doorImgObj = {
//         additionalProp1: doorImgArr[0] || "",
//         additionalProp2: doorImgArr[1] || "",
//         additionalProp3: doorImgArr[2] || "",
//       };

//       if (!propertyId || !/^[0-9a-f-]{36}$/i.test(String(propertyId))) {
//         Alert.alert(
//           "Invalid property ID",
//           "Please select a valid property before submitting."
//         );
//         setSubmitting(false);
//         return;
//       }

//       const fullFormData = {
//         propertyInfo: {
//           propertyMasterId: propertyId,
//           inspectionStartedOn: basicFormData.date,
//           inspectedBy: userObj?.userName,
//           InspectedById: userObj?.userId,
//           inspectionApprovedDate: null,
//           lastInspectionDate: new Date().toISOString(),
//           inspectionApprovedBy: "",
//           lastInspectedBy: userObj?.userName,
//           // status, // from arg
//           status: "Compliant",
//           inspectionUpdatedBy: userObj?.userName,
//           inspectionUpdatedOn: new Date().toISOString(),
//           nextInspectionDueDate: null,
//         },
//         inspectedPropertyFloorsInfo: {
//           floorNo: basicFormData.floor ? Number(basicFormData.floor) : null,
//           floorPlanImage: basicFormData.floorPlan?.[0] ?? null,
//           createdBy: userObj?.userName,
//           updatedBy: userObj?.userName,
//         },
//         inspectedDoorDto: {
//           floorNo: basicFormData.floor ? Number(basicFormData.floor) : null,
//           floorImage: basicFormData.floorPlan?.[0] ?? null,
//           doorTypeId: (formData as any).doorType ?? "",
//           // doorTypeId: nOrNull((formData as any).doorType),

//           doorRefNumber: (formData as any).doorNumber ?? "",
//           doorNumber: (formData as any).doorNumber ?? "",
//           inspectedBy: userObj?.userName,
//           doorInspectionDate: basicFormData.date,
//           status: "Compliant",
//           flatName: "",
//           doorTypeName: (formData as any).doorTypeName ?? "",
//           propertyName: basicFormData.buildingName ?? "",
//           otherDoorTypeName: (formData as any).doorOther ?? "",
//           doorLocation: (formData as any).doorLocation ?? "",
//           doorPhoto: doorImgObj,

//         },
//         complianceChecks,
//         physicalMeasurement,
//         // additionalInfos: [{ imagePath: floorPlanImages }],
//         additionalInfos: (floorPlanImages || []).map((u) => ({ imagePath: u })),
//       };

//       console.log("➡️ SUBMIT payload:", fullFormData);

//       // const response = await saveData(JSON.stringify(fullFormData));
//       const response = await saveData(fullFormData);

//       if (response.status === 200) {
//         setToastData({
//           toastShow: true,
//           toastType: "success",
//           toastString: `✅ Inspection for Door Ref No: ${
//             (formData as any).doorNumber
//           } saved successfully.`,
//         });
//         setTimeout(() => handleCancel(), 1500);
//       } else {
//         setToastData({
//           toastShow: true,
//           toastType: "failure",
//           toastString: "❌ Failed to save. Please try again.",
//         });
//       }
//     } catch (err) {
//       console.error("❌ handleSubmit error:", err);
//       setToastData({
//         toastShow: true,
//         toastType: "failure",
//         toastString: "Something went wrong during submission.",
//       });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const saveData = async (payload: Record<string, any>) => {
//     try {
//     const token = userObj?.token;
//  const headers: any = { "Content-Type": "application/json" };
//  if (token) headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

//  const response = await http.post(SAVE_SURVEY_FORM_DATA, payload, { headers });

//       console.log("✅ API Response:", response.data);
//       return response;
//     } catch (err: any) {
//       if (err.response) {
//         // console.error("❌ API Error:", err.response.data);
//         // console.error("📛 Validation Errors:", err.response.data.errors);
//         console.error("❌ API Error status:", err.response.status);
//   console.error("❌ API Error body:", err.response.data);
//      if (err.response.data?.errors) {
//     console.error("📛 Validation Errors:", err.response.data.errors);
//    }
//       } else {
//         console.error("❌ Unexpected Error:", err.message);
//       }
//       throw err;
//     }
//   };

//   // ---- Validation helpers (no more throws) ----
//   const handleMandatoryFields = () => {
//     // highlight first missing field if you want; for now it’s a no-op
//   };

// const handleValidationOnSave = async (status: string) => {
//   setValidationFlag(true);
//   const ok = await validateRequired();
//   if (!ok) return;
//   await handleSubmit(status);
// };

//   // Basic form changes
//   const handleChange = (field: string, value: string) => {
//     setBasicFormData((prev: any) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   // BIG capture (Floor, Door, Additional)
// const handleImagesChange = async (incomingList: string[], field: string) => {
//   console.groupCollapsed("[BIG] handleImagesChange", field);
//   try {
//     const clean = (incomingList || []).filter(Boolean);
//     console.log("[BIG] incoming clean", { count: clean.length, sample: clean.map(x => x.slice(0,60)) });

//     // Current state (server URLs only) for this field
//     const getExisting = () => {
//       switch (field) {
//         case "Floor":      return basicInfo.floorPlan || [];
//         case "Door":       return (formData as any).doorPhoto || [];
//         case "Additional": return (basicFormData as any).additionalPhotos || [];
//         default:           return [];
//       }
//     };
//     const existing = getExisting();
//     console.log("[BIG] existing (state)", { count: existing.length, sample: existing.map((x: string | any[])=>x.slice(0,60)) });

//     // Only upload the *new* local/base64 items (non-HTTP)
//     const locals = clean.filter((u) => !/^https?:\/\//i.test(u));
//     console.log("[BIG] locals to upload", locals.length);

//     const uploaded = (
//       await Promise.all(locals.map((u) => uploadImageAPI([u], field)))
//     ).filter(Boolean) as string[];

//     console.log("[BIG] uploaded urls", uploaded);

//     // Merge: keep existing + any already-HTTP in clean + uploaded
//     const keepHttp = clean.filter((u) => /^https?:\/\//i.test(u));
//     const next = Array.from(new Set([...existing, ...keepHttp, ...uploaded]));
//     console.log("[BIG] merged next", { count: next.length, sample: next.map(x=>x.slice(0,60)) });

//     switch (field) {
//       case "Floor":
//         setBasicInfo((prev) => ({ ...prev, floorPlan: next }));
//         break;
//       case "Door":
//         setFormData((prev) => ({ ...prev, doorPhoto: next }));
//         break;
//       case "Additional":
//         setBasicFormData((prev: any) => ({ ...prev, additionalPhotos: next }));
//         break;
//     }
//   } catch (e) {
//     console.error("[BIG] handleImagesChange ERROR", e);
//   } finally {
//     console.groupEnd();
//   }
// };

//   // ViewSurvey.tsx
//   // const { mode } = useLocalSearchParams<{ mode?: string }>();

//   // app/viewSurvey/[doorRefNumber].tsx
//   const {
//     doorRefNumber = "",
//     mode: rawMode, // 👈 rename so no conflict
//     propertyMasterId,
//   } = useLocalSearchParams<{
//     doorRefNumber?: string;
//     mode?: string;
//     propertyMasterId?: string;
//   }>();

//   useEffect(() => {
//     const modeNorm = (rawMode ?? "").toString().trim().toLowerCase();
//     setIsView(modeNorm !== "edit");
//   }, [rawMode]);

//   // ---- Data load ----
//   useEffect(() => {
//     if (!doorRefNumber) {
//       setError("Invalid door reference number");
//       setIsLoading(false);
//       return;
//     }

//     const fetchData = async () => {
//       try {
//         const url =
//           `${GET_DOOR_INSPECTION_DATA}${encodeURIComponent(doorRefNumber)}` +
//           (propertyMasterId
//             ? `&propertyMasterId=${encodeURIComponent(propertyMasterId)}`
//             : "");

//         console.log("🌐 Fetching:", url);
//         const res = await http.get(url);

//         const data = res?.data;

//         const propertyRes = await http.get(
//           GET_PROPERTY_INFO_WITH_MASTER + data.propertyInfo.propertyMasterId
//         );
//         const property = propertyRes?.data;

//         if (data?.propertyInfo?.propertyMasterId) {
//           setPropertyId(data.propertyInfo.propertyMasterId);
//         }

//         const userId = userObj?.userId;
//         if (!userId) throw new Error("Missing user ID");

//         const clientRes = await http.get(GET_CLINET_ID_API + "/" + userId);
//         const status = property?.inspectionPropertyInfo?.status;

//         // ✅ isView: only editable if mode === 'edit'
//         // setIsView(mode === "edit" ? false : true);

//         const fd: FormData = {
//           doorNumber: data.inspectedDoorDto.doorNumber,
//           doorType: data.inspectedDoorDto.doorTypeId,
//           doorTypeName: data.inspectedDoorDto.doorTypeName,
//           doorOther: data.inspectedDoorDto.otherDoor,
//           // doorOther: data.inspectedDoorDto.otherDoorTypeName,
//           doorLocation: data.inspectedDoorDto.doorLocation,
//           fireResistance: data.physicalMeasurement.fireRatingID,
//           hingeLocation: data.physicalMeasurement.hingePosition,
//           doorPhoto: Object.values(
//             data.inspectedDoorDto.doorPhoto || {}
//           ).filter((url): url is string => !!url),
//           doorThickness: data.physicalMeasurement.doorThickness?.value,
//           frameDepth: data.physicalMeasurement.frameDepth?.value,
//           doorSize: data.physicalMeasurement.doorSize?.value,
//           fullDoorsetSize: data.physicalMeasurement.fullDoorsetSize?.value,
//           head: data.physicalMeasurement.head?.value,
//           hinge: data.physicalMeasurement.hinge?.value,
//           closing: data.physicalMeasurement.closing?.value,
//           threshold: data.physicalMeasurement.threshold?.value,
//           comments: data.physicalMeasurement?.comments ?? "",
//           photos: Object.values(data.physicalMeasurement.photo || {}).filter(
//             (url): url is string => !!url
//           ),
//         };

//         console.log("otherdoor", data.inspectedDoorDto.otherDoor);

//         // 🔧🔧🔧 BEGIN: copy physical action fields into flat formData keys + photos into actionImages
//         const pm = data.physicalMeasurement ?? {};
//         const physKeys = ["head", "hinge", "closing", "threshold"] as const;

//         // collect photos for actionImages from physical measurements
//         const physAI: ActionImages = {} as ActionImages;
//         physKeys.forEach((k) => {
//           const src = pm?.[k] || {};
//           physAI[k] = Array.isArray(src.photos) ? src.photos : []; // ✅
//         });

//         physKeys.forEach((k) => {
//           const src = pm?.[k] || {};
//           // formData expects flat keys like headSeverity, headCategory, etc.
//           (fd as any)[`${k}Severity`] = src.severity ?? "";
//           (fd as any)[`${k}Category`] = src.category ?? "";
//           (fd as any)[`${k}Comments`] = src.comment ?? "";
//           (fd as any)[`${k}Remediation`] = src.remediation ?? "";
//           (fd as any)[`${k}DueDate`] = src.dueDate
//             ? formatDateString(src.dueDate)
//             : "";
//           (fd as any)[`${k}photos`] = src.photos ?? "";
//           console.log("photos", src.photos);
//           // saved images for MiniCapture
//           physAI[k] = Array.isArray(src.photos) ? src.photos : [];
//         });
//         // 🔧🔧🔧 END
//         // setActionImages(physAI); // ✅ now FormComponent gets actionImages.<field>
//         setFormData(fd);

//         setBasicFormData({
//           buildingName: property.propertyMaster.propertyName,
//           uniqueRef: property.propertyMaster.uniqueRefNo,
//           location: property.propertyMaster.propertyLocation,
//           date: formatDateString(data.inspectedDoorDto.doorInspectionDate),
//           floor: data.inspectedPropertyFloorsInfo.floorNo,
//           floorPlan: [data.inspectedPropertyFloorsInfo.floorPlanImage],
//           additionalPhotos:
//             data.additionalInfos?.flatMap(
//               (info: any) => info.imagePath || []
//             ) || [],
//         });

//         const cc: ComplianceCheck = {} as ComplianceCheck;
//         const ai: ActionImages = {} as ActionImages;

//         Object.entries(COMPLIANCE_CHECK_MASTER).forEach(([idKey, id]) => {
//           const key = idKey.replace("Id", "") as ComplianceKey;
//           const item = data.complianceChecks.find(
//             (x: any) => x.complianceCheckMasterID === id
//           );
//           if (!item) return;

//           (cc as any)[key] =
//             key === "fireLockedSign" ? item?.isCompliant : item?.isCompliant;
//           (cc as any)[`${key}Timeline`] = item?.actionItem?.timeline;
//           (cc as any)[`${key}Severity`] = item?.actionItem?.severity;
//           (cc as any)[`${key}Comments`] = item?.actionItem?.comment;
//           (cc as any)[`${key}Remediation`] = item?.actionItem?.remediation;
//           (cc as any)[`${key}Category`] = item?.actionItem?.category;
//           (cc as any)[`${key}DueDate`] = item?.actionItem?.dueDate
//             ? formatDateString(item.actionItem.dueDate)
//             : "";
//           (cc as any)[`${key}Id`] = id;
//           (ai as any)[key] = item?.actionItem?.photos;

//           (cc as any)[key] = item?.isCompliant === true;

//           if (key === "selfClosingDevice" && !item?.isCompliant) {
//             setFireKeepLocked(true);
//           }
//           if (key === "doorGlazing") {
//             setIsGlazing(item?.isCompliant);
//           }
//         });

//         setComplianceCheck(cc);
//         setActionImages({ ...physAI, ...ai });

//         // setActionImages(ai);
//         setDoorTypesOption(property.doorTypes);
//         setFloorPlanImages([data.inspectedPropertyFloorsInfo.floorPlanImage]);
//         setIsColdSeals(
//           ["5", "6", "7"].includes(data.physicalMeasurement.fireRatingID)
//         );

//         setIsLoading(false);
//       } catch (err: any) {
//         console.error("❌ Data Load Error:", err);
//         setError(err?.message || "Unexpected error");
//         setIsLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   if (isLoading) {
//     return (
//       <ScrollView contentContainerStyle={{ padding: 20 }}>
//         <ActivityIndicator size="large" color="blue" />
//         <Text style={{ textAlign: "center", marginTop: 10 }}>
//           Loading data...
//         </Text>
//       </ScrollView>
//     );
//   }

//   if (error) {
//     return (
//       <ScrollView contentContainerStyle={{ padding: 20 }}>
//         <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
//       </ScrollView>
//     );
//   }

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//       style={{ flex: 1 }}
//     >
//       <ScrollView
//         contentContainerStyle={{
//           padding: 16,
//           paddingBottom: 100,
//           backgroundColor: "#f7f9fc",
//         }}
//         keyboardShouldPersistTaps="handled"
//       >
//         <FormComponent
//           isGlazing={isGlazing}
//           isFireKeepLocked={fireKeepLocked}
//           complianceCheck={complianceCheck}
//           actionImages={actionImages}
//           handleComplianceToggle={handleComplianceToggle}
//           handleComplianceActionFieldsChange={
//             handleComplianceActionFieldsChange
//           }
//           isView={isView}
//           basicFormData={basicFormData}
//           formData={formData}
//           // complianceCheck={complianceCheck}
//           actionmenuFlag={actionMenuFlag} // ✅ use the same state consistently
//           // actionImages={actionImages}
//           doorPhoto={(formData as any).doorPhoto}
//           floorPlanImages={floorPlanImages}
//           resetCaptureFlag={false}
//           isColdSeals={isColdSeals}
//           // isGlazing={isGlazing}
//           // isFireKeepLocked={fireKeepLocked}
//           ShowScanQRCode={false}
//           doorOtherFlag={doorOtherFlag}
//           // doorOtherFlag={(formData as any).doorType === "99"}
//           doorTypesOption={doorTypesOption}
//           validationFlag={validationFlag}
//           isLoading={isLoading}
//           mandatoryFieldRef={mandatoryFieldRef}
//           errors={errors}
//           handleChange={handleChange}
//           handleFormDataChange={handleFormDataChange}
//           handleGapsChange={() => {}}
//           // handleComplianceToggle={handleComplianceToggle}
//           handleResetAction={(field, _type) => handleResetAction(field)}
//           // handleComplianceActionFieldsChange={handleComplianceActionFieldsChange}
//           handleImagesChange={handleImagesChange}
//           handleImagesChangeMini={handleImagesChangeMini}
//           handleDeleteImages={handleDeleteImages}
//           // handleResetAction={(key: string) => handleResetAction(key)}
//           handleActionFieldsChange={(
//             key: string,
//             type: string,
//             value: string
//           ) => handleActionFieldsChange(key, type, value)}
//           handleFireResistanceChange={() => {}}
//           generateQRCode={() => {}}
//           setShowScanQRCode={() => {}}
//           handleCancel={handleCancel}
//           handleSubmit={handleSubmit}
//           handleValidationOnSave={handleValidationOnSave}
//           // handleComplianceActionFieldsChange={handleComplianceActionFieldsChange}
//         />
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// };

// export default ViewSurvey;

import * as FileSystem from "expo-file-system";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
} from "react-native";
import { useSelector } from "react-redux";
import {
  GET_CLINET_ID_API,
  GET_DOOR_INSPECTION_DATA,
  GET_PROPERTY_INFO_WITH_MASTER,
  SAVE_SURVEY_FORM_DATA,
} from "../../components/api/apiPath";

import { hostName } from "@/components/config/config";
import http from "../../components/api/server";
import FormComponent from "../../components/common/FormComponent";
import { RootState } from "../../components/slices/store";
import {
  ActionImages,
  ActionMenuFlag,
  ComplianceCheck,
  FormData,
} from "../../components/types";

export const BASE_MEASURES: (keyof FormData)[] = [
  "head",
  "hinge",
  "closing",
  "threshold",
];

export const BASE_MEASURES_COMP: (keyof ComplianceCheck)[] = [
  "pyroGlazing",
  "coldSmokeSeals",
  "fireLockedSign",
  "gapUnderDoor",
  "visionPanel",
];

// keep this type near the top of the file
type ComplianceKey =
  | "intumescentStrips"
  | "coldSmokeSeals"
  | "selfClosingDevice"
  | "fireLockedSign"
  | "fireShutSign"
  | "holdOpenDevice"
  | "visibleCertification"
  | "doorGlazing"
  | "pyroGlazing";

const COMPLIANCE_CHECK_MASTER: Record<`${ComplianceKey}Id`, string> = {
  intumescentStripsId: "927da4a9-3c0b-46a7-8fb2-00af566a41e6",
  coldSmokeSealsId: "2d46bbc6-3a52-48ee-ad7d-80c3f3cdf352",
  selfClosingDeviceId: "145baf7e-bcc6-4c8f-b925-070e751ba2d6",
  fireLockedSignId: "942c7963-7d98-49db-a13e-63ee7b4fcfd1",
  fireShutSignId: "b7157137-2bfc-423d-b236-6620c527519b",
  holdOpenDeviceId: "a106ba4e-ef40-4510-851e-09d1315becc5",
  visibleCertificationId: "99ab902f-794a-491b-a6e3-26c8a57f9527",
  doorGlazingId: "1b2886cc-a1a3-4573-a5be-7df68c0db109",
  pyroGlazingId: "c9873267-e600-4c99-bf08-088dee277909",
};

const defaultActionMenuFlag: ActionMenuFlag = {
  head: false,
  hinge: false,
  closing: false,
  threshold: false,
};

const formatDateString = (date: string | Date): string => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

const isHttpUrl = (u?: string) => !!u && /^https?:\/\//i.test(u);

const ViewSurvey: React.FC = () => {
  const params = useLocalSearchParams();
  const navigation = useNavigation();

  interface BasicInfo {
    buildingName: string;
    uniqueRef: string;
    date: string;
    location: string;
    floor: number | string;
    floorPlan: string[]; // make sure this matches what you're assigning
    // comments: string;
  }

  // const mode = params.mode?.toString(); // "view" | "edit" | undefined
  const userObj = useSelector((state: RootState) => state.user?.userObj);
  const [doorOtherFlag, setDoorOtherFlag] = useState(false);
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    buildingName: "",
    uniqueRef: "",
    date: new Date().toISOString().split("T")[0],
    location: "",
    floor: "",
    floorPlan: [], // should be string, not array or object
    // comments: "",
  });
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [propertyId, setPropertyId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({} as FormData);
  // const [complianceCheck, setComplianceCheck] = useState<ComplianceCheck>(
  //   {} as ComplianceCheck
  // );

  // state you already have:
  const [complianceCheck, setComplianceCheck] = useState<ComplianceCheck>(
    {} as any
  );
  const [actionImages, setActionImages] = useState<ActionImages>({} as any);
  const [isGlazing, setIsGlazing] = useState<boolean>(true);
  const [fireKeepLocked, setFireKeepLocked] = useState<boolean>(false);

  // const [actionImages, setActionImages] = useState<ActionImages>(
  //   {} as ActionImages
  // );
  const [basicFormData, setBasicFormData] = useState<any>({});
  const [actionMenuFlag, setActionMenuFlag] = useState<ActionMenuFlag>(
    defaultActionMenuFlag
  );
  const [floorPlanImages, setFloorPlanImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [doorTypesOption, setDoorTypesOption] = useState<any[]>([]);
  const [isView, setIsView] = useState(true); // default read-only until data loads
  const [isColdSeals, setIsColdSeals] = useState(false);
  // const [isGlazing, setIsGlazing] = useState(false);
  // const [fireKeepLocked, setFireKeepLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mandatoryFieldRef = useRef<Record<string, TextInput | null>>({});

  // NEW: local validation flag so we don’t throw
  const [validationFlag, setValidationFlag] = useState<boolean>(false);

  const [toastData, setToastData] = useState({
    toastShow: false,
    toastType: "",
    toastString: "",
  });

  // ---------- Validation helpers ----------
  type FieldKey =
    // keys that you also use to register refs from FormComponent
    | "date"
    | "floor"
    | "doorNumber"
    | "doorType"
    | "doorOther"
    | "fireResistance"
    | "hingeLocation";

  const isBlank = (v: any) =>
    v === undefined || v === null || String(v).trim() === "";

  const LABELS: Record<FieldKey, string> = {
    date: "Inspection Date",
    floor: "Floor",
    doorNumber: "Door Reference/Number",
    doorType: "Door Type",
    doorOther: "Other Door Type",
    fireResistance: "Fire Rating",
    hingeLocation: "Hinge Position",
  };

  const REQUIRED_ALWAYS: FieldKey[] = [
    "date",
    "floor",
    "doorNumber",
    "doorType",
    "fireResistance",
    "hingeLocation",
  ];

  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});

  // const doorRefNumber =
  //   typeof params.doorRefNumber === "string"
  //     ? params.doorRefNumber
  //     : Array.isArray(params.doorRefNumber)
  //     ? params.doorRefNumber[0]
  //     : "";

  // ----- Handlers: plain form changes -----
  // ViewSurvey.tsx
  // const handleFormDataChange = (field: string, value: string) => {
  //   setFormData((prev) => ({ ...prev, [field]: value }));
  //   if (!isView && ["head", "hinge", "threshold"].includes(field)) {
  //     const n = parseFloat(String(value).replace(",", "."));
  //     setActionMenuFlag((prev) => ({
  //       ...prev,
  //       [field]: Number.isFinite(n) && n > 3,
  //     }));
  //   }
  // };

  // helper: look up the label for a doorType id
  const getDoorTypeName = (
    id?: string | number,
    opts?: { doorTypeId: number; doorTypeName: string }[]
  ) => {
    if (!id || !opts?.length) return "";
    const found = opts.find((o) => String(o.doorTypeId) === String(id));
    return found?.doorTypeName ?? "";
  };

  const handleFormDataChange = (field: string, value: string) => {
    // 1) Keep both "other" keys in sync no matter which one the UI touches
    if (field === "doorOther" || field === "otherDoorTypeName") {
      setFormData((prev) => ({
        ...prev,
        doorOther: value,
        otherDoorTypeName: value,
      }));
      return;
    }

    // 2) When Door Type changes:
    if (field === "doorType") {
      // Resolve the display name for the selected id
      const selectedName = getDoorTypeName(value, doorTypesOption)
        ?.trim()
        .toLowerCase();

      const isOther =
        selectedName?.includes("other") ||
        String(value).trim().toLowerCase() === "other"; // in case backend literally sends "other"

      // Toggle the extra input visibility
      setDoorOtherFlag(isOther);

      setFormData((prev) => ({
        ...prev,
        doorType: value,
        doorTypeName:
          getDoorTypeName(value, doorTypesOption) || prev.doorTypeName,
        // If NOT Other, clear any stale custom text; if Other, keep whatever is already there
        doorOther: isOther
          ? prev.doorOther ?? prev.otherDoorTypeName ?? ""
          : "",
        otherDoorTypeName: isOther
          ? prev.otherDoorTypeName ?? prev.doorOther ?? ""
          : "",
      }));
      return;
    }

    // 3) Default: just set the field
    setFormData((prev) => ({ ...prev, [field]: value }));

    // 4) Your existing action-menu rule for gap fields (>3)
    if (!isView && ["head", "hinge", "threshold"].includes(field)) {
      const n = parseFloat(String(value).replace(",", "."));
      setActionMenuFlag((prev) => ({
        ...prev,
        [field]: Number.isFinite(n) && n > 3,
      }));
    }
  };

  const handleComplianceActionFieldsChange = (
    field: string, // e.g. "intumescentStrips"
    type: string, // "Severity" | "Category" | "Remediation" | "Comments" | "DueDate" | "Timeline"
    value: string
  ) => {
    setComplianceCheck((prev) => ({
      ...prev,
      [`${field}${type}`]: value,
    }));
  };

  const clearCompliance = (k: ComplianceKey, next: any) => {
    next[`${k}Timeline`] = "";
    next[`${k}Severity`] = "";
    next[`${k}Category`] = "";
    next[`${k}Comment`] = "";
    next[`${k}DueDate`] = "";
    next[`${k}Remediation`] = "";
    next[`${k}Images`] = []; // if you ever store Images on cc
    setActionImages((ai) => ({ ...ai, [k]: [] }));
  };

  const handleComplianceToggle = (field: ComplianceKey, nextVal: boolean) => {
    setComplianceCheck((prev) => {
      const next: any = { ...prev, [field]: nextVal };

      // Self closer → hide Keep Locked when YES
      if (field === "selfClosingDevice") {
        setFireKeepLocked(!nextVal);
        if (nextVal) {
          next.fireLockedSign = true;
          clearCompliance("fireLockedSign", next);
        }
      }

      // Glazing → hide Pyro when NO
      if (field === "doorGlazing") {
        setIsGlazing(nextVal);
        if (!nextVal) {
          next.pyroGlazing = true;
          clearCompliance("pyroGlazing", next);
        }
      }

      // Generic: if toggled to YES, clear its own action/images
      if (nextVal) {
        clearCompliance(field, next);
      }

      return next;
    });
  };

  // ----- Handlers: MiniCapture integration -----
  // keep field-first internally
  // REPLACE your current handleImagesChangeMini with this:
  // const handleImagesChangeMini = (images: string[], field: string) => {
  //   const key = field.toLowerCase();
  //   setActionImages(prev => ({ ...prev, [key]: images }));
  //   setFormData(prev => ({ ...prev, [`${key}Images`]: images }));
  // };

  async function base64DataUrlToFileUri(
    dataUrl: string
  ): Promise<{ uri: string; name: string; type: string }> {
    console.log("[upload] base64DataUrlToFileUri start", {
      len: dataUrl?.length,
      head: dataUrl?.slice(0, 30),
    });

    if (!dataUrl) throw new Error("Empty dataUrl");
    const match = dataUrl.match(/^data:(.+?);base64,(.*)$/);
    const type = match?.[1] || "image/jpeg";
    const base64 = match?.[2] || dataUrl.replace(/^data:.+;base64,/, "");
    const name = `Upload_${Date.now()}.${type.includes("png") ? "png" : "jpg"}`;
    const path = FileSystem.cacheDirectory + name;
    await FileSystem.writeAsStringAsync(path, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    console.log("[upload] base64DataUrlToFileUri wrote file", path);

    return { uri: path, name, type };
  }

  const guessMimeFromName = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext === "png") return "image/png";
    if (ext === "webp") return "image/webp";
    return "image/jpeg";
  };
  async function normaliseForUpload(
    src: string,
    field: string
  ): Promise<{ uri: string; name: string; type: string }> {
    console.log("[upload] normaliseForUpload start", {
      field,
      srcHead: src?.slice(0, 40),
      platform: Platform.OS,
    });

    if (!src) throw new Error("Invalid image source");
    if (src.startsWith("data:image/")) {
      return base64DataUrlToFileUri(src);
    }
    const name = `${field}_Image_${Date.now()}.jpg`;
    return { uri: src, name, type: guessMimeFromName(name) };
  }

  const uploadImageAPI = async (
    newImages: string[],
    field: string
  ): Promise<string> => {
    console.groupCollapsed("[upload] uploadImageAPI", field);
    try {
      const last = (newImages || []).filter(Boolean).pop();
      console.log("[upload] last", last);
      if (!last) return "";

      // Already uploaded?
      if (/^https?:\/\//i.test(last)) {
        console.log("[upload] already a URL");
        return last;
      }

      // ---- auth/header/url ----
      const rawToken = userObj?.token ?? "";
      const auth =
        rawToken &&
        (rawToken.startsWith("Bearer ") ? rawToken : `Bearer ${rawToken}`);
      const apiBase = (hostName || "").replace(/\/+$/, "");
      const url = `${apiBase}/api/Inspection/upload`;

      // Build a local file path we can upload
      const filenameBase = `${field}_${Date.now()}`;
      let fileUri = last;
      let name = `${filenameBase}.jpg`;
      let type = "image/jpeg";

      if (last.startsWith("data:")) {
        // data URL -> write to cache
        const match = last.match(/^data:(.+?);base64,(.*)$/);
        const mime = match?.[1] || "image/jpeg";
        const base64 = match?.[2] || "";
        const ext = mime.includes("png") ? "png" : "jpg";
        name = `${filenameBase}.${ext}`;
        type = mime;
        fileUri = FileSystem.cacheDirectory + name;
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        console.log("[upload] wrote data URL to", fileUri);
      } else if (!/^file:|^content:/i.test(last)) {
        // any other scheme on native -> download first
        const target = FileSystem.cacheDirectory + name;
        const dl = await FileSystem.downloadAsync(last, target);
        fileUri = dl.uri;
        console.log("[upload] downloaded to", fileUri);
      } else {
        // file:// or content:// — keep as-is
        const tail = last.split("/").pop() || name;
        name = tail;
        if (tail.toLowerCase().endsWith(".png")) type = "image/png";
        console.log("[upload] using local file", fileUri, name, type);
      }

      if (Platform.OS === "web") {
        // ---------- WEB: use fetch + FormData ----------
        const form = new FormData();
        const blob = await (await fetch(fileUri)).blob();
        const ext = /png/i.test(blob.type) ? "png" : "jpg";
        const webName = name.includes(".") ? name : `${filenameBase}.${ext}`;
        form.append("File", blob, webName);
        form.append("Client", "ABC");
        form.append("Property", "Candor");
        form.append("InspectionDate", new Date().toISOString());

        console.log("[upload] web POST", url);
        const resp = await fetch(url, {
          method: "POST",
          headers: auth ? { Authorization: auth } : undefined,
          body: form,
        });
        if (!resp.ok) {
          const text = await resp.text().catch(() => "");
          console.error(
            "[upload] web failed",
            resp.status,
            text?.slice(0, 300)
          );
          return "";
        }
        const data = await resp.json().catch(() => ({} as any));
        console.log("[upload] web ok", data?.result?.blobUrl);
        return data?.result?.blobUrl || "";
      } else {
        // ---------- NATIVE: use FileSystem.uploadAsync (no FormData) ----------
        console.log("[upload] native uploadAsync", {
          url,
          fileUri,
          name,
          type,
        });
        const result = await FileSystem.uploadAsync(url, fileUri, {
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: "File",
          parameters: {
            Client: "ABC",
            Property: "Candor",
            InspectionDate: new Date().toISOString(),
          },
          headers: auth ? { Authorization: auth } : undefined,
          mimeType: type, // optional
        });

        // result.body is a string
        if (result.status !== 200) {
          console.error(
            "[upload] native failed",
            result.status,
            result.body?.slice(0, 300)
          );
          return "";
        }
        let data: any = {};
        try {
          data = JSON.parse(result.body);
        } catch {}
        console.log("[upload] native ok", data?.result?.blobUrl);
        return data?.result?.blobUrl || "";
      }
    } catch (err) {
      console.error(`[upload] uploadImageAPI error (field: ${field})`, err);
      return "";
    } finally {
      console.groupEnd();
    }
  };

  // helper
  const isRemoteUrl = (u: string) => /^https?:\/\//i.test(u);

  // MINI capture (physical/compliance)
  const handleImagesChangeMini = async (newImages: string[], field: string) => {
    console.groupCollapsed("[MINI] handleImagesChangeMini", field);
    try {
      const prev = actionImages[field] || [];
      const clean = (newImages || []).filter(Boolean);
      console.log("[MINI] prev/clean", prev.length, clean.length);

      const toUpload = clean.filter((u) => !/^https?:\/\//i.test(u));
      console.log("[MINI] toUpload", toUpload.length);

      const uploaded = (
        await Promise.all(toUpload.map((u) => uploadImageAPI([u], field)))
      ).filter(Boolean) as string[];

      console.log("[MINI] uploaded", uploaded.length);

      const next = Array.from(
        new Set([
          ...prev,
          ...uploaded,
          ...clean.filter((u) => /^https?:\/\//i.test(u)),
        ])
      );
      console.log("[MINI] next", next.length);

      setActionImages((p) => ({ ...p, [field]: next }));
      setFormData((p) => ({ ...p, [`${field}Images`]: next } as any));
    } catch (e) {
      console.error("[MINI] handleImagesChangeMini ERROR", e);
    } finally {
      console.groupEnd();
    }
  };

  // REPLACE your handleDeleteImages with this:
  // const handleDeleteImages = (field: string, index: number) => {
  //   const key = field.toLowerCase();
  //   setActionImages(prev => {
  //     const list = [...(prev[key] || [])];
  //     if (index >= 0 && index < list.length) list.splice(index, 1);
  //     return { ...prev, [key]: list };
  //   });
  //   setFormData(prev => {
  //     const arr = [ ...((prev as any)[`${key}Images`] || []) ];
  //     if (index >= 0 && index < arr.length) arr.splice(index, 1);
  //     return { ...prev, [`${key}Images`]: arr };
  //   });
  // };
  const handleDeleteImages = (index: number, field: string) => {
    console.groupCollapsed("[BIG] handleDeleteImages", field);
    try {
      console.log("[BIG] delete index", index);
      switch (field) {
        case "Floor": {
          const before = (basicFormData?.floorPlan as string[]) || [];
          const updated = before.filter((_, i) => i !== index);
          setBasicFormData((prev: any) => ({ ...prev, floorPlan: updated }));
          break;
        }
        case "Door": {
          const before = (formData as any).doorPhoto || [];
          const updated = before.filter((_: any, i: number) => i !== index);
          console.log(
            "[BIG] Door before/after",
            before.length,
            "->",
            updated.length
          );
          setFormData((prev) => ({ ...prev, doorPhoto: updated }));
          break;
        }
        default: {
          const before = actionImages[field] || [];
          const updated = before.filter((_, i) => i !== index);
          console.log(
            "[BIG] Mini",
            field,
            "before/after",
            before.length,
            "->",
            updated.length
          );
          setActionImages((prev) => ({ ...prev, [field]: updated }));
          setFormData(
            (prev) => ({ ...prev, [`${field}Images`]: updated } as any)
          );
          break;
        }
      }
    } finally {
      console.groupEnd();
    }
  };

  // const handleActionFieldsChange = (
  //   key: string,
  //   value: string,
  //   type: string
  // ) => {
  //   // type: 'Severity' | 'Category' | 'Remediation' | 'Comments' | 'DueDate'
  //   const fieldName = `${key}${type}`;
  //   setFormData((prev: any) => ({
  //     ...prev,
  //     [fieldName]: value,
  //   }));
  // };
  const handleActionFieldsChange = (
    field: string,
    type: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [`${field}${type}`]: value, // e.g. headSeverity = "2"
    }));
  };

  const handleResetAction = (key: string) => {
    // reset section flags + photos for a specific key
    setActionMenuFlag((prev) => ({ ...prev, [key]: false }));
    setActionImages((prev) => ({ ...prev, [key]: [] }));
    setFormData((prev: any) => ({
      ...prev,
      [`${key}Severity`]: "",
      [`${key}Category`]: "",
      [`${key}Remediation`]: "",
      [`${key}Comment`]: "",
      [`${key}DueDate`]: "",
    }));
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  // --- helpers (top-level inside the component) ---
  const isEmpty = (v: any) => {
    if (v == null) return true;
    if (Array.isArray(v)) return v.length === 0;
    const t = String(v).trim();
    return t === "" || t.toLowerCase() === "select";
  };

  const showAlert = (title: string, msg: string) => {
    Alert.alert(title, msg);
  };
  // Focus first error using the refs you already register in FormComponent
  const focusFirstError = (emap: Record<string, string>) => {
    const key = Object.keys(emap)[0];
    const ref = mandatoryFieldRef.current?.[key];
    if (ref && typeof ref.focus === "function") {
      try {
        ref.focus();
      } catch {}
    }
    const preferOrder = [
      "date",
      "floor",
      "doorType",
      "doorOther",
      "doorPhoto",
      "hingeLocation",
      "fireResistance",
      "head",
      "hinge",
      "closing",
      "threshold",
      "doorThickness",
      "frameDepth",
      "doorSize",
      "fullDoorsetSize",
      "floorPlan",
    ];
    for (const key of preferOrder) {
      if (emap[key]) {
        const ref = mandatoryFieldRef.current?.[key];
        if (ref && typeof ref.focus === "function") {
          try {
            ref.focus();
          } catch {}
        }
        break;
      }
    }
  };

  // Gap fields we support
  const PHYS_KEYS = ["head", "hinge", "closing", "threshold"] as const;

  // Is a gap "active"? (≥4mm OR any action fields touched)
  const isGapActive = (k: (typeof PHYS_KEYS)[number], src: any) => {
    const v = Number(src?.[k]);
    const hasAny =
      !!src?.[`${k}Severity`] ||
      !!src?.[`${k}Category`] ||
      !!src?.[`${k}Remediation`] ||
      !!src?.[`${k}Comment`] ||
      !!src?.[`${k}DueDate`];
    return (Number.isFinite(v) && v >= 4) || hasAny;
  };

  // Build a per-field "required" map for just the action pieces that are active
  const buildActionRequiredMap = (srcForm: any, srcImgs: any) => {
    const map: Record<string, boolean> = {};
    PHYS_KEYS.forEach((k) => {
      const active = isGapActive(k, srcForm);
      map[`${k}Severity`] = active;
      map[`${k}Category`] = active;
      map[`${k}Remediation`] = active;
      map[`${k}Comment`] = active;
      map[`${k}DueDate`] = active;
      map[`${k}Images`] =
        active && Array.isArray(srcImgs?.[k]) && srcImgs[k].length === 0; // images required only when active
    });
    return map;
  };

  const actionRequiredMap: Record<string, boolean> = useMemo(
    () => buildActionRequiredMap(formData, actionImages),
    [formData, actionImages]
  );

  // Which compliance toggles we support in UI/order
  const COMPLIANCE_KEYS = [
    "intumescentStrips",
    "coldSmokeSeals",
    "selfClosingDevice",
    "fireLockedSign",
    "fireShutSign",
    "holdOpenDevice",
    "visibleCertification",
    "doorGlazing",
    "pyroGlazing",
  ] as const;
  type ComplianceToggle = (typeof COMPLIANCE_KEYS)[number];

  // Should this compliance item require an action section?
  function complianceRequiresAction(
    key: ComplianceToggle,
    cc: any, // your complianceCheck state
    opts: { fireKeepLocked: boolean; isGlazing: boolean }
  ) {
    // your existing booleans
    const isCompliant = Boolean(cc?.[key]);
    // fireLockedSign suppressed when self-closer exists (you track as !fireKeepLocked)
    const suppressFireLocked = key === "fireLockedSign" && !opts.fireKeepLocked;
    // pyroGlazing suppressed when there is NO glazing (you flip pyro to true and clear)
    const suppressPyro = key === "pyroGlazing" && !opts.isGlazing;

    if (suppressFireLocked || suppressPyro) return false;
    return !isCompliant; // action only when non-compliant
  }

  // Build a per-field required map for compliance action fields
 const buildComplianceRequiredMap = (
  cc: any,
  imgs: any,
  opts: { fireKeepLocked: boolean; isGlazing: boolean }
) => {
  const map: Record<string, boolean> = {};
  COMPLIANCE_KEYS.forEach((k) => {
    // suppress rules
    if (k === "fireLockedSign" && !opts.fireKeepLocked) return;
    if (k === "pyroGlazing" && !opts.isGlazing) return;

    const isYes = cc?.[k] === true;
    const active = !isYes; // we need action when toggled NO

    // mark action subfields required only when active
    map[`${k}Severity`]    = active;
    map[`${k}Category`]    = active;
    map[`${k}Remediation`] = active;
    map[`${k}Comment`]     = active;
    map[`${k}DueDate`]     = active;
    const list = (imgs?.[k] as string[]) ?? [];
    map[`${k}Images`]      = active && list.length === 0;
  });
  return map;
};


  const complianceRequiredMap: Record<string, boolean> = useMemo(
    () =>
      buildComplianceRequiredMap(complianceCheck, actionImages, {
        fireKeepLocked,
        isGlazing,
      }),
    [complianceCheck, actionImages, fireKeepLocked, isGlazing]
  );

  
  // --- the validator you’ll call from the Submit button ---
  // ViewSurvey.tsx
  const validateRequired = (status: string = "Compliant"): boolean => {
    if (isView) return true;

    setValidationFlag(true);
    const e: Record<string, string> = {};

    // -------- Base requireds --------
    if (isEmpty(basicFormData?.date)) e.date = "Inspection Date is required";
    if (isEmpty(basicFormData?.floor)) e.floor = "Floor is required";
    if (isEmpty(formData?.doorType)) e.doorType = "Door Type is required";
    if (doorOtherFlag && isEmpty((formData as any)?.doorOther))
      e.doorOther = "Other Door Type is required";
    if (isEmpty(formData?.doorNumber)) e.doorNumber = "Door Number is required";
    if (isEmpty(formData?.hingeLocation))
      e.hingeLocation = "Hinge Position is required";
    if (isEmpty(formData?.fireResistance))
      e.fireResistance = "Fire rating is required";

    // Require at least one floor plan & one door photo
    if (isEmpty(basicFormData?.floorPlan))
      e.floorPlan = "Floor plan is required";
    if (isEmpty(formData?.doorPhoto)) e.doorPhoto = "Door photo is required";

    // Non-gap numeric basics
    (
      ["doorThickness", "frameDepth", "doorSize", "fullDoorsetSize"] as const
    ).forEach((k) => {
      if (isEmpty((formData as any)?.[k])) e[k] = `${k} is required`;
    });

    // Require these numeric fields
(["head","hinge","closing","threshold","doorThickness","frameDepth","doorSize","fullDoorsetSize"] as const)
  .forEach((k) => {
    if (isEmpty((formData as any)?.[k])) e[k] = `${k} is required`;
  });

    // -------- Gap action requirements ONLY when active --------
    // const reqMap = buildActionRequiredMap(formData, actionImages);
    // const actionRequiredMap = buildActionRequiredMap(formData, actionImages);

    PHYS_KEYS.forEach((field) => {
      const active = isGapActive(field, formData);
      if (!active) return;
      const sev = (formData as any)[`${field}Severity`];
      const cat = (formData as any)[`${field}Category`];
      // const com = (formData as any)[`${field}Comment`];
      const rem = (formData as any)[`${field}Remediation`];
      const dd = (formData as any)[`${field}DueDate`];
      const imgs = (actionImages as any)?.[field] ?? [];

      if (isEmpty(sev))
        e[`${field}Severity`] = `${field}: severity is required`;
      if (isEmpty(cat))
        e[`${field}Category`] = `${field}: category is required`;
      // if (isEmpty(com)) e[`${field}Comment`] = `${field}: comment is required`;
      if (isEmpty(rem))
        e[`${field}Remediation`] = `${field}: remediation is required`;
      if (isEmpty(dd)) e[`${field}DueDate`] = `${field}: due date is required`;
      // if (!imgs.length)
      //   e[`${field}Images`] = `${field}: at least one photo is required`;
    });

    // After your physical gap validation block:
    COMPLIANCE_KEYS.forEach((key) => {
      const need = complianceRequiresAction(key, complianceCheck, {
        fireKeepLocked,
        isGlazing,
      });
      if (!need) return;

      const sev = (complianceCheck as any)[`${key}Severity`];
      const cat = (complianceCheck as any)[`${key}Category`];
      // const com = (complianceCheck as any)[`${key}Comment`];
      const rem = (complianceCheck as any)[`${key}Remediation`];
      const dd = (complianceCheck as any)[`${key}DueDate`];
      // const photos = ((actionImages as any)[key] ?? []) as string[];

      if (isEmpty(sev)) e[`${key}Severity`] = `${key}: severity is required`;
      if (isEmpty(cat)) e[`${key}Category`] = `${key}: category is required`;
      // if (isEmpty(com)) e[`${key}Comment`] = `${key}: comment is required`;
      if (isEmpty(rem))
        e[`${key}Remediation`] = `${key}: remediation is required`;
      if (isEmpty(dd)) e[`${key}DueDate`] = `${key}: due date is required`;
      // if (!photos.length) e[`${key}Images`] = `${key}: at least one photo is required`;
    });

    if (Object.keys(e).length) {
      setErrors(e);
      showAlert(
        "Missing Required Fields",
        Object.values(e)
          .map((m) => `• ${m}`)
          .join("\n")
      );
      focusFirstError(e);
      return false;
    }

    setErrors({});
    return true;
  };

  // ----- Submit -----
  const handleSubmit = async (status: string = "Compliant") => {
    //   setValidationFlag(true);
    //    const quickErrors: Record<string, string> = {};
    // if (!isView) {
    //   if (isEmpty(basicFormData?.floor)) quickErrors.floor = "Floor is required";
    //   if (isEmpty(formData?.doorType)) quickErrors.doorType = "Door Type is required";
    //   if (isEmpty(formData?.hingeLocation)) quickErrors.hingeLocation = "Hinge Location is required";
    //   if (Object.keys(quickErrors).length) {
    //     setErrors(quickErrors);
    //     focusFirstError(quickErrors);
    //     return;
    //   }
    // }
    // if (!validateRequired()) return;
    try {
      setSubmitting(true);

      const phyKeys: ("head" | "hinge" | "closing" | "threshold")[] = [
        "head",
        "hinge",
        "closing",
        "threshold",
      ];

      // Helper: does this physical section have an action?
      const isActive = (k: string) => {
        const m = Number((formData as any)[k]);
        const hasAny =
          !!(formData as any)[`${k}Severity`] ||
          !!(formData as any)[`${k}Category`] ||
          !!(formData as any)[`${k}Remediation`] ||
          !!(formData as any)[`${k}Comment`] ||
          !!(formData as any)[`${k}DueDate`];
        return (Number.isFinite(m) && m >= 4) || hasAny;
      };

      // ---- physicalMeasurement ----
      // Helper at top of handleSubmit
      const active = (k: (typeof PHYS_KEYS)[number]) =>
        isGapActive(k, formData);

      // ---- physicalMeasurement ----
      const physicalMeasurement: any = {
        fireRatingID: (formData as any).fireResistance ?? "",
        comments: (formData as any).comments ?? "",
        hingePosition: (formData as any).hingeLocation ?? "",
      };

      PHYS_KEYS.forEach((k) => {
        const on = active(k);
        physicalMeasurement[k] = {
          value: Number((formData as any)[k]),
          actionItem: on ? "yes" : "no",
          timeline: on ? (formData as any)[`${k}Timeline`] || "Short term" : "",
          severity: on ? (formData as any)[`${k}Severity`] ?? "" : "",
          comment: on ? (formData as any)[`${k}Comment`] ?? "" : "",
          category: on ? (formData as any)[`${k}Category`] ?? "" : "",
          dueDate: on ? (formData as any)[`${k}DueDate`] || null : null,
          remediation: on ? (formData as any)[`${k}Remediation`] ?? "" : "",
          photos: on ? (actionImages as any)?.[k] ?? [] : [],
        };
      });

      // Non-gap numeric blocks stay as "no action"
      (
        ["doorThickness", "frameDepth", "doorSize", "fullDoorsetSize"] as const
      ).forEach((key) => {
        physicalMeasurement[key] = {
          value: Number((formData as any)[key]),
          actionItem: "no",
          timeline: "",
          severity: "",
          comment: "",
          category: "",
          dueDate: null,
          remediation: "",
          photos: [],
        };
      });

      // ---- complianceChecks ----
      const compArr: ComplianceKey[] = [
        "intumescentStrips",
        "coldSmokeSeals",
        "selfClosingDevice",
        "fireLockedSign",
        "fireShutSign",
        "holdOpenDevice",
        "visibleCertification",
        "doorGlazing",
        "pyroGlazing",
      ];

      const complianceChecks = compArr.map((item) => {
        const id = (complianceCheck as any)[`${item}Id`] ?? "";
        const isCompliant = Boolean((complianceCheck as any)[item]);

        const sev = (complianceCheck as any)[`${item}Severity`] ?? "";
        const com = (complianceCheck as any)[`${item}Comment`] ?? "";
        const cat = (complianceCheck as any)[`${item}Category`] ?? "";
        const dd = (complianceCheck as any)[`${item}DueDate`] || null;
        const rem = (complianceCheck as any)[`${item}Remediation`] ?? "";
        const photos = ((actionImages as any)[item] ?? []) as string[];

        const suppressFireLocked = item === "fireLockedSign" && !fireKeepLocked;
        const requireAction = !suppressFireLocked && !isCompliant;

        return {
          complianceCheckMasterID: id,
          isCompliant,
          actionItem: requireAction
            ? {
                timeline: "Short term",
                severity: sev,
                comment: com,
                category: cat,
                dueDate: dd,
                remediation: rem,
                photos,
              }
            : {
                timeline: "",
                severity: "",
                comment: com,
                category: "",
                dueDate: null,
                remediation: "",
                photos: [],
              },
        };
      });

      // ---- door photos map ----
      const doorImgArr = formData.doorPhoto;
      const doorImgObj = {
        additionalProp1: doorImgArr[0] || "",
        additionalProp2: doorImgArr[1] || "",
        additionalProp3: doorImgArr[2] || "",
      };

      if (!propertyId || propertyId.toString().length !== 36) {
        Alert.alert(
          "Invalid property ID",
          "Please select a valid property before submitting."
        );
        setSubmitting(false);
        return;
      }

      const additionalPhotoUrls = (
        basicFormData?.additionalPhotos ?? []
      ).filter((u: string) => typeof u === "string" && u.trim() !== "");

      const additionalInfos =
        additionalPhotoUrls.length > 0
          ? [{ imagePath: additionalPhotoUrls }] // <-- MUST be string[]
          : [];

      const payload = {
        propertyInfo: {
          propertyMasterId: propertyId,
          inspectionStartedOn: basicFormData.date,
          inspectedBy: userObj?.userName,
          InspectedById: userObj?.userId,
          inspectionApprovedDate: null,
          lastInspectionDate: new Date().toISOString(),
          inspectionApprovedBy: "",
          lastInspectedBy: userObj?.userName,
          status, // from arg
          inspectionUpdatedBy: userObj?.userName,
          inspectionUpdatedOn: new Date().toISOString(),
          nextInspectionDueDate: null,
        },
        inspectedPropertyFloorsInfo: {
          floorNo: basicFormData.floor ? Number(basicFormData.floor) : null,
          // floorPlanImage: basicFormData.floorPlan?.[0] ?? "no image",
          floorPlanImage: basicFormData.floorPlan?.[0] ?? "",
          createdBy: userObj?.userEmail,
          updatedBy: userObj?.userEmail,
        },
        inspectedDoorDto: {
          floorNo: basicFormData.floor ? Number(basicFormData.floor) : null,
          floorImage: basicFormData.floorPlan?.[0] ?? "no image",
          doorTypeId: (formData as any).doorType ?? "",
          doorRefNumber: (formData as any).doorNumber ?? "",
          doorNumber: (formData as any).doorNumber ?? "",
          inspectedBy: userObj?.userName,
          doorInspectionDate: basicFormData.date,
          status: "Compliant",
          flatName: "Flat A",
          doorTypeName: (formData as any).doorTypeName ?? "",
          propertyName: basicFormData.buildingName ?? "",
          otherDoorTypeName: (formData as any).doorOther ?? "",
          doorLocation: (formData as any).doorLocation ?? "",
          doorPhoto: doorImgObj,
        },
        complianceChecks,
        physicalMeasurement,
        // additionalInfos: [{ imagePath: floorPlanImages }],
        additionalInfos,
      };

      console.log("➡️ SUBMIT payload:", payload);
      console.log(
        "CHECK additionalInfos",
        Array.isArray(additionalInfos?.[0]?.imagePath),
        additionalInfos?.[0]?.imagePath
      );
      const response = await saveData(JSON.stringify(payload));

      if (response.status === 200) {
        setToastData({
          toastShow: true,
          toastType: "success",
          toastString: `✅ Inspection for Door Ref No: ${
            (formData as any).doorNumber
          } saved successfully.`,
        });
        setTimeout(() => handleCancel(), 1500);
      } else {
        setToastData({
          toastShow: true,
          toastType: "failure",
          toastString: "❌ Failed to save. Please try again.",
        });
      }
    } catch (err) {
      console.error("❌ handleSubmit error:", err);
      setToastData({
        toastShow: true,
        toastType: "failure",
        toastString: "Something went wrong during submission.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const saveData = async (payload: any) => {
    try {
      const token = userObj?.token;
      const headers: any = { "Content-Type": "application/json" };
      if (token) {
        headers.Authorization = token.startsWith("Bearer ")
          ? token
          : `Bearer ${token}`;
      }
      // -   const response = await http.post(SAVE_SURVEY_FORM_DATA, payload, {
      // -     headers: { "Content-Type": "application/json" },
      // -   });
      const response = await http.post(SAVE_SURVEY_FORM_DATA, payload, {
        headers,
      });
      return response;
    } catch (err: any) {
      if (err.response) {
        console.error("❌ API Error:", err.response.data);
        console.error("📛 Validation Errors:", err.response.data.errors);
      } else {
        console.error("❌ Unexpected Error:", err.message);
      }
      throw err;
    }
  };

  // const saveData = async (payload: any) => {
  //   try {
  //     const response = await http.post(SAVE_SURVEY_FORM_DATA, payload, {
  //       headers: { "Content-Type": "application/json" },
  //     });
  //     console.log("✅ API Response:", response.data);
  //     return response;
  //   } catch (err: any) {
  //     if (err.response) {
  //       console.error("❌ API Error:", err.response.data);
  //       console.error("📛 Validation Errors:", err.response.data.errors);
  //     } else {
  //       console.error("❌ Unexpected Error:", err.message);
  //     }
  //     throw err;
  //   }
  // };

  // ---- Validation helpers (no more throws) ----
  const handleMandatoryFields = () => {
    // highlight first missing field if you want; for now it’s a no-op
  };

  // ViewSurvey.tsx
  const handleValidationOnSave = async (status: string) => {
    setValidationFlag(true);
    if (!validateRequired(status)) return;
    await handleSubmit(status); // ← only here we call submit
  };

  // Basic form changes
  const handleChange = (field: string, value: string) => {
    setBasicFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  // BIG capture (Floor, Door, Additional)
  const handleImagesChange = async (incomingList: string[], field: string) => {
    console.groupCollapsed("[BIG] handleImagesChange", field);
    try {
      const clean = (incomingList || []).filter(Boolean);
      console.log("[BIG] incoming clean", {
        count: clean.length,
        sample: clean.map((x) => x.slice(0, 60)),
      });

      // Current state (server URLs only) for this field
      const getExisting = () => {
        switch (field) {
          case "Floor":
            return basicInfo.floorPlan || [];
          case "Door":
            return (formData as any).doorPhoto || [];
          case "Additional":
            return (basicFormData as any).additionalPhotos || [];
          default:
            return [];
        }
      };
      const existing = getExisting();
      console.log("[BIG] existing (state)", {
        count: existing.length,
        sample: existing.map((x: string | any[]) => x.slice(0, 60)),
      });

      // Only upload the *new* local/base64 items (non-HTTP)
      const locals = clean.filter((u) => !/^https?:\/\//i.test(u));
      console.log("[BIG] locals to upload", locals.length);

      const uploaded = (
        await Promise.all(locals.map((u) => uploadImageAPI([u], field)))
      ).filter(Boolean) as string[];

      console.log("[BIG] uploaded urls", uploaded);

      // Merge: keep existing + any already-HTTP in clean + uploaded
      const keepHttp = clean.filter((u) => /^https?:\/\//i.test(u));
      const next = Array.from(new Set([...existing, ...keepHttp, ...uploaded]));
      console.log("[BIG] merged next", {
        count: next.length,
        sample: next.map((x) => x.slice(0, 60)),
      });

      switch (field) {
        case "Floor":
          setBasicFormData((prev: any) => ({ ...prev, floorPlan: next }));
          break;
        case "Door":
          setFormData((prev) => ({ ...prev, doorPhoto: next }));
          break;
        case "Additional":
          setBasicFormData((prev: any) => ({
            ...prev,
            additionalPhotos: next,
          }));
          break;
      }
    } catch (e) {
      console.error("[BIG] handleImagesChange ERROR", e);
    } finally {
      console.groupEnd();
    }
  };

  // ViewSurvey.tsx
  // const { mode } = useLocalSearchParams<{ mode?: string }>();

  // app/viewSurvey/[doorRefNumber].tsx
  const {
    doorRefNumber = "",
    mode: rawMode, // 👈 rename so no conflict
    propertyMasterId,
  } = useLocalSearchParams<{
    doorRefNumber?: string;
    mode?: string;
    propertyMasterId?: string;
  }>();

  useEffect(() => {
    const modeNorm = (rawMode ?? "").toString().trim().toLowerCase();
    setIsView(modeNorm !== "edit");
  }, [rawMode]);

  // ---- Data load ----
  useEffect(() => {
    if (!doorRefNumber) {
      setError("Invalid door reference number");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const url =
          `${GET_DOOR_INSPECTION_DATA}${encodeURIComponent(doorRefNumber)}` +
          (propertyMasterId
            ? `&propertyMasterId=${encodeURIComponent(propertyMasterId)}`
            : "");

        console.log("🌐 propertyMasterId:", propertyMasterId);
        console.log("🌐 Fetching:", url);
        const res = await http.get(url);

        const data = res?.data;

        const propertyRes = await http.get(
          GET_PROPERTY_INFO_WITH_MASTER + data.propertyInfo.propertyMasterId
        );
        const property = propertyRes?.data;

        if (data?.propertyInfo?.propertyMasterId) {
          setPropertyId(data.propertyInfo.propertyMasterId);
        }

        const userId = userObj?.userId;
        if (!userId) throw new Error("Missing user ID");

        const clientRes = await http.get(GET_CLINET_ID_API + "/" + userId);
        const status = property?.inspectionPropertyInfo?.status;

        // ✅ isView: only editable if mode === 'edit'
        // setIsView(mode === "edit" ? false : true);

        const otherFromApi =
  data.inspectedDoorDto.otherDoorTypeName ??
  data.inspectedDoorDto.otherDoor ??
  "";

        const fd: FormData = {
          doorNumber: data.inspectedDoorDto.doorNumber,
          doorType: data.inspectedDoorDto.doorTypeId,
          doorTypeName: data.inspectedDoorDto.doorTypeName,
           doorOther: otherFromApi,                 // ✅
  otherDoorTypeName: otherFromApi,         // ✅
  otherDoorType: otherFromApi,             // ✅ (if your UI ever looked at this)
  doorTypeOther: otherFromApi,   
          // doorOther: data.inspectedDoorDto.otherDoor,
          // doorOther: data.inspectedDoorDto.otherDoorTypeName,
          doorLocation: data.inspectedDoorDto.doorLocation,
          fireResistance: data.physicalMeasurement.fireRatingID,
          hingeLocation: data.physicalMeasurement.hingePosition,
          doorPhoto: Object.values(
            data.inspectedDoorDto.doorPhoto || {}
          ).filter((url): url is string => !!url),
          doorThickness: data.physicalMeasurement.doorThickness?.value,
          frameDepth: data.physicalMeasurement.frameDepth?.value,
          doorSize: data.physicalMeasurement.doorSize?.value,
          fullDoorsetSize: data.physicalMeasurement.fullDoorsetSize?.value,
          head: data.physicalMeasurement.head?.value,
          hinge: data.physicalMeasurement.hinge?.value,
          closing: data.physicalMeasurement.closing?.value,
          threshold: data.physicalMeasurement.threshold?.value,
          comments: data.physicalMeasurement?.comments ?? "",
          photos: Object.values(data.physicalMeasurement.photo || {}).filter(
            (url): url is string => !!url
          ),
        };

        console.log("otherdoor", data.inspectedDoorDto.otherDoor);

        // 🔧🔧🔧 BEGIN: copy physical action fields into flat formData keys + photos into actionImages
        const pm = data.physicalMeasurement ?? {};
        const physKeys = ["head", "hinge", "closing", "threshold"] as const;

        // collect photos for actionImages from physical measurements
        const physAI: ActionImages = {} as ActionImages;
        physKeys.forEach((k) => {
          const src = pm?.[k] || {};
          physAI[k] = Array.isArray(src.photos) ? src.photos : []; // ✅
        });

        physKeys.forEach((k) => {
          const src = pm?.[k] || {};
          // formData expects flat keys like headSeverity, headCategory, etc.
          (fd as any)[`${k}Severity`] = src.severity ?? "";
          (fd as any)[`${k}Category`] = src.category ?? "";
          (fd as any)[`${k}Comment`] = src.comment ?? "";
          (fd as any)[`${k}Remediation`] = src.remediation ?? "";
          (fd as any)[`${k}DueDate`] = src.dueDate
            ? formatDateString(src.dueDate)
            : "";
          (fd as any)[`${k}photos`] = src.photos ?? "";
          console.log("photos", src.photos);
          // saved images for MiniCapture
          physAI[k] = Array.isArray(src.photos) ? src.photos : [];
        });
        // 🔧🔧🔧 END
        // setActionImages(physAI); // ✅ now FormComponent gets actionImages.<field>
        // const looksOther = /(^|[^a-z])other([^a-z]|$)/i.test(fd.doorTypeName || "");
const hasCustom = !!otherFromApi.trim();
setDoorOtherFlag( hasCustom);
        setFormData(fd);

        setBasicFormData({
          buildingName: property.propertyMaster.propertyName,
          uniqueRef: property.propertyMaster.uniqueRefNo,
          location: property.propertyMaster.propertyLocation,
          date: formatDateString(data.inspectedDoorDto.doorInspectionDate),
          floor: data.inspectedPropertyFloorsInfo.floorNo,
          floorPlan: [data.inspectedPropertyFloorsInfo.floorPlanImage],
          additionalPhotos:
            data.additionalInfos?.flatMap(
              (info: any) => info.imagePath || []
            ) || [],
        });

        const cc: ComplianceCheck = {} as ComplianceCheck;
        const ai: ActionImages = {} as ActionImages;

        Object.entries(COMPLIANCE_CHECK_MASTER).forEach(([idKey, id]) => {
          const key = idKey.replace("Id", "") as ComplianceKey;
          const item = data.complianceChecks.find(
            (x: any) => x.complianceCheckMasterID === id
          );
          if (!item) return;

          (cc as any)[key] =
            key === "fireLockedSign" ? item?.isCompliant : item?.isCompliant;
          (cc as any)[`${key}Timeline`] = item?.actionItem?.timeline;
          (cc as any)[`${key}Severity`] = item?.actionItem?.severity;
          (cc as any)[`${key}Comment`] = item?.actionItem?.comment;
          (cc as any)[`${key}Remediation`] = item?.actionItem?.remediation;
          (cc as any)[`${key}Category`] = item?.actionItem?.category;
          (cc as any)[`${key}DueDate`] = item?.actionItem?.dueDate
            ? formatDateString(item.actionItem.dueDate)
            : "";
          (cc as any)[`${key}Id`] = id;
          (ai as any)[key] = item?.actionItem?.photos;

          (cc as any)[key] = item?.isCompliant === true;

          if (key === "selfClosingDevice" && !item?.isCompliant) {
            setFireKeepLocked(true);
          }
          if (key === "doorGlazing") {
            setIsGlazing(item?.isCompliant);
          }
        });

        setComplianceCheck(cc);
        setActionImages({ ...physAI, ...ai });

        // setActionImages(ai);
        setDoorTypesOption(property.doorTypes);
        setFloorPlanImages([data.inspectedPropertyFloorsInfo.floorPlanImage]);
        setIsColdSeals(
          ["5", "6", "7"].includes(data.physicalMeasurement.fireRatingID)
        );

        setIsLoading(false);
      } catch (err: any) {
        console.error("❌ Data Load Error:", err);
        setError(err?.message || "Unexpected error");
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <ActivityIndicator size="large" color="blue" />
        <Text style={{ textAlign: "center", marginTop: 10 }}>
          Loading data...
        </Text>
      </ScrollView>
    );
  }

  if (error) {
    return (
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100,
          backgroundColor: "#f7f9fc",
        }}
        keyboardShouldPersistTaps="handled"
      >
        <FormComponent
          isGlazing={isGlazing}
          isFireKeepLocked={fireKeepLocked}
          complianceCheck={complianceCheck}
          actionImages={actionImages}
          handleComplianceToggle={handleComplianceToggle}
          handleComplianceActionFieldsChange={
            handleComplianceActionFieldsChange
          }
          isView={isView}
          basicFormData={basicFormData}
          formData={formData}
          // complianceCheck={complianceCheck}
          actionmenuFlag={actionMenuFlag} // ✅ use the same state consistently
          // actionImages={actionImages}
          doorPhoto={(formData as any).doorPhoto}
          floorPlanImages={floorPlanImages}
          resetCaptureFlag={false}
          isColdSeals={isColdSeals}
          // isGlazing={isGlazing}
          // isFireKeepLocked={fireKeepLocked}
          ShowScanQRCode={false}
          doorOtherFlag={doorOtherFlag}
          // doorOtherFlag={(formData as any).doorType === "99"}
          doorTypesOption={doorTypesOption}
          validationFlag={validationFlag}
          isLoading={isLoading}
          mandatoryFieldRef={mandatoryFieldRef}
          errors={errors}
          handleChange={handleChange}
          handleFormDataChange={handleFormDataChange}
          handleGapsChange={() => {}}
          // handleComplianceToggle={handleComplianceToggle}
          handleResetAction={(field, _type) => handleResetAction(field)}
          // handleComplianceActionFieldsChange={handleComplianceActionFieldsChange}
          handleImagesChange={handleImagesChange}
          handleImagesChangeMini={handleImagesChangeMini}
          handleDeleteImages={handleDeleteImages}
          // handleResetAction={(key: string) => handleResetAction(key)}
          handleActionFieldsChange={(
            key: string,
            type: string,
            value: string
          ) => handleActionFieldsChange(key, type, value)}
          handleFireResistanceChange={() => {}}
          generateQRCode={() => {}}
          setShowScanQRCode={() => {}}
          handleCancel={handleCancel}
          handleSubmit={handleSubmit}
          handleValidationOnSave={handleValidationOnSave}
          requiredMap={actionRequiredMap}
          requiredComplianceMap={complianceRequiredMap}
          // handleComplianceActionFieldsChange={handleComplianceActionFieldsChange}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ViewSurvey;
