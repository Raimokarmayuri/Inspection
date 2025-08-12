import * as FileSystem from "expo-file-system";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

const ViewSurvey: React.FC = () => {
  const params = useLocalSearchParams();
  const navigation = useNavigation();

  // const mode = params.mode?.toString(); // "view" | "edit" | undefined
  const userObj = useSelector((state: RootState) => state.user?.userObj);

  const [basicInfo, setBasicInfo] = useState<any>({});
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [propertyId, setPropertyId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({} as FormData);
  const [complianceCheck, setComplianceCheck] = useState<ComplianceCheck>(
    {} as ComplianceCheck
  );
  const [actionImages, setActionImages] = useState<ActionImages>(
    {} as ActionImages
  );
  const [basicFormData, setBasicFormData] = useState<any>({});
  const [actionMenuFlag, setActionMenuFlag] = useState<ActionMenuFlag>(
    defaultActionMenuFlag
  );
  const [floorPlanImages, setFloorPlanImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [doorTypesOption, setDoorTypesOption] = useState<any[]>([]);
  const [isView, setIsView] = useState(true); // default read-only until data loads
  const [isColdSeals, setIsColdSeals] = useState(false);
  const [isGlazing, setIsGlazing] = useState(false);
  const [fireKeepLocked, setFireKeepLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mandatoryFieldRef = useRef<Record<string, TextInput | null>>({});

  // NEW: local validation flag so we don’t throw
  const [validationFlag, setValidationFlag] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [toastData, setToastData] = useState({
    toastShow: false,
    toastType: "",
    toastString: "",
  });

  const doorRefNumber =
    typeof params.doorRefNumber === "string"
      ? params.doorRefNumber
      : Array.isArray(params.doorRefNumber)
      ? params.doorRefNumber[0]
      : "";

  // ----- Handlers: plain form changes -----
  // ViewSurvey.tsx
  const handleFormDataChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (!isView && ["head", "hinge", "threshold"].includes(field)) {
      const n = parseFloat(String(value).replace(",", "."));
      setActionMenuFlag((prev) => ({
        ...prev,
        [field]: Number.isFinite(n) && n > 3,
      }));
    }
  };

  const handleComplianceToggle = (field: keyof ComplianceCheck) => {
    setComplianceCheck((prev) => {
      const nextVal = !prev[field];
      const next: any = { ...prev, [field]: nextVal };

      // Self closing device ↔ Keep Locked special case
      if (field === "selfClosingDevice") {
        // if NO self-closing device → Keep Locked sign becomes relevant
        setFireKeepLocked(!nextVal);
        if (nextVal) {
          // when self closer present, we treat "Keep Locked" as compliant
          next.fireLockedSign = true;
        }
      }

      // Glazing ↔ Pyro flow
      if (field === "doorGlazing") {
        setIsGlazing(nextVal);
        if (!nextVal) {
          // optionally reset pyro fields when no glazing
          // next.pyroGlazing = true; // or false, depending on your rules
          // next.pyroGlazingSeverity = "Select";
          // next.pyroGlazingCategory = "Select";
          // next.pyroGlazingRemediation = "";
          // next.pyroGlazingComments = "";
          // next.pyroGlazingDueDate = "";
        }
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
    const match = dataUrl.match(/^data:(.+?);base64,(.*)$/);
    const type = match?.[1] || "image/jpeg";
    const base64 = match?.[2] || dataUrl.replace(/^data:.+;base64,/, "");
    const name = `Upload_${Date.now()}.${type.includes("png") ? "png" : "jpg"}`;
    const path = FileSystem.cacheDirectory + name;
    await FileSystem.writeAsStringAsync(path, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
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
    try {
      const rawToken = userObj?.token ?? "";
      if (!rawToken) {
        console.warn("No auth token found in userObj");
        return "";
      }

      // ✅ ensure exactly one "Bearer " prefix
      const authHeader = rawToken.startsWith("Bearer ")
        ? rawToken
        : `Bearer ${rawToken}`;

      const latest = newImages[newImages.length - 1];
      let filePart: { uri?: string; name: string; type: string } | File | Blob;
      let name = `${field}_Image_${Date.now()}.jpg`;
      let type = "image/jpeg";

      if (Platform.OS === "web") {
        const res = await fetch(latest);
        const blob = await res.blob();
        type = blob.type || type;
        // Use File on web so the server gets a filename
        filePart = new File([blob], name, { type });
      } else {
        const parts = await normaliseForUpload(latest, field);
        name = parts.name;
        type = parts.type;
        filePart = { uri: parts.uri, name, type } as any;
      }

      const form = new FormData();
      form.append("File", filePart as any, name);
      form.append("Client", "ABC");
      form.append("Property", "Candor");
      form.append("InspectionDate", new Date().toISOString());

      const resp = await fetch(`${hostName}api/Inspection/upload`, {
        method: "POST",
        headers: {
          Authorization: authHeader, // ✅
          // DO NOT set Content-Type manually when sending FormData
        },
        body: form,
        // credentials: 'include', // only if your API uses cookies (likely not)
      });

      if (!resp.ok) {
        const www = resp.headers.get("www-authenticate") || "";
        const text = await resp.text().catch(() => "");
        console.error("Upload failed", {
          status: resp.status,
          wwwAuthenticate: www,
          body: text?.slice(0, 300),
        });
        return "";
      }

      const data = await resp.json().catch(() => ({} as any));
      return data?.result?.blobUrl || "";
    } catch (err) {
      console.error("uploadImageAPI error:", err);
      return "";
    }
  };

  const handleImagesChangeMini = async (
    newImages: string[],
    field: string
  ): Promise<void> => {
    const prev = actionImages[field] || [];

    // Only upload items that aren't already server URLs
    const toUpload = newImages.filter(
      (u) => !(u.startsWith("http://") || u.startsWith("https://"))
    );
    if (toUpload.length === 0) return;

    // Upload each new image using your existing API helper
    const uploaded = (
      await Promise.all(toUpload.map((u) => uploadImageAPI([u], field)))
    ).filter(Boolean) as string[];

    if (uploaded.length === 0) return;

    // Merge (and de-dupe just in case)
    const next = Array.from(new Set([...prev, ...uploaded]));
    setActionImages((prev) => ({ ...prev, [field]: next }));
    setFormData((prev) => ({ ...prev, [`${field}Images`]: next }));
    // setActionImages((prevMap) => ({ ...prevMap, [field]: next }));

    // (Optional) also mirror into formData so MiniCapture re-renders from it too
    // setFormData((prev: any) => ({ ...prev, [`${field}Images`]: next }));
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
    switch (field) {
      case "Floor": {
        const updated = [...basicInfo.floorPlan];
        updated.splice(index, 1);
        setBasicInfo((prev: any) => ({ ...prev, floorPlan: updated }));
        break;
      }

      case "Door": {
        const updated = [...formData.doorPhoto];
        updated.splice(index, 1);
        setFormData((prev) => ({
          ...prev,
          doorPhoto: updated,
          // Optional: clear doorPhoto if it's the one removed
          // doorPhoto: updated[0] || "",
        }));
        break;
      }

      default: {
        const imgArr = actionImages[field] || [];
        const updatedImages = imgArr.filter((_, i) => i !== index);
        setActionImages((prev) => ({
          ...prev,
          [field]: updatedImages,
        }));
        break;
      }
    }

    // Optional: delete from blob storage
    // deleteImageAPI(imageToDelete);
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

    const isEmpty = (v: any) =>
    v === undefined ||
    v === null ||
    (typeof v === "string" && v.trim() === "") ||
    (Array.isArray(v) && v.length === 0);


  const handleResetAction = (key: string) => {
    // reset section flags + photos for a specific key
    setActionMenuFlag((prev) => ({ ...prev, [key]: false }));
    setActionImages((prev) => ({ ...prev, [key]: [] }));
    setFormData((prev: any) => ({
      ...prev,
      [`${key}Severity`]: "",
      [`${key}Category`]: "",
      [`${key}Remediation`]: "",
      [`${key}Comments`]: "",
      [`${key}DueDate`]: "",
    }));
  };
  // mark the first failing field
  const focusFirstError = (errs: Record<string, string>) => {
    const firstKey = Object.keys(errs)[0];
    const el = mandatoryFieldRef.current[firstKey];
    if (el?.focus) el.focus();
    // optional: scroll to it if needed
    // scrollRef.current?.scrollTo({ y: <y-position>, animated: true });
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  //  const validateAndSubmit = async () => {
  //   const e: Record<string, string> = {};

  //   // Basic requireds
  //   if (isEmpty(basicInfo.floor)) e.floor = "Floor is required";
  //   if (isEmpty(formData.doorType)) e.doorType = "Door Type is required";
  //   if (isEmpty(formData.doorNumber)) e.doorNumber = "Door Number is required";
  //   if (isEmpty(formData.hingeLocation))
  //     e.hingeLocation = "Hinge Location is required";
  //   if (isEmpty(formData.fireResistance))
  //     e.fireResistance = "Fire rating is required";

  //   // Files / images
  //   if (isEmpty(basicInfo.floorPlan))
  //     e.floorPlan = "Floor plan file is required";
  //   if (isEmpty(formData.doorPhoto)) e.doorPhoto = "Door photo is required";

  //   // Measurements (add/remove as needed)
  //   const reqMeasurements = [
  //     "head",
  //     "hinge",
  //     "closing",
  //     "threshold",
  //     "doorThickness",
  //     "frameDepth",
  //     "doorSize",
  //     "fullDoorsetSize",
  //   ];
  //   reqMeasurements.forEach((k) => {
  //     if (isEmpty((formData as any)[k])) e[k] = `${k} is required`;
  //   });

  //   // Example date required (if you want it mandatory)
  //   // if (!date) e.date = "Date is required";

  //   if (Object.keys(e).length) {
  //     setErrors(e);
  //     focusFirstError(e);
  //     return;
  //   }

  //   setErrors({});
  //   // proceed with your existing submit
  //   handleSubmit();
  // };

  // ----- Submit -----
  const handleSubmit = async (status: string = "Compliance") => {
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
          !!(formData as any)[`${k}Comments`] ||
          !!(formData as any)[`${k}DueDate`];
        return (Number.isFinite(m) && m >= 4) || hasAny;
      };

      // ---- physicalMeasurement ----
      const physicalMeasurement: any = {
        fireRatingID: (formData as any).fireResistance ?? "",
        comments: basicFormData?.comment ?? "No comments",
        hingePosition: (formData as any).hingeLocation ?? "",
      };

      // ---- complianceChecks ----

      phyKeys.forEach((k) => {
        const active = isActive(k);
        physicalMeasurement[k] = {
          value: Number((formData as any)[k]),
          actionItem: active ? "yes" : "no",
          timeline: active ? "Short term" : "",
          severity: active ? (formData as any)[`${k}Severity`] ?? "" : "",
          comment: active ? (formData as any)[`${k}Comments`] ?? "" : "",
          category: active ? (formData as any)[`${k}Category`] ?? "" : "",
          dueDate: active ? (formData as any)[`${k}DueDate`] ?? null : null,
          remediation: active ? (formData as any)[`${k}Remediation`] ?? "" : "",
          photos: active ? actionImages[k] ?? [] : [],
        };
      });

      // non-gap physical fields (always no action)
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

        // special case: when a self closer exists, "Keep Locked" never requires action
        const suppressFireLocked = item === "fireLockedSign" && !fireKeepLocked;

        const requireAction = !suppressFireLocked && !isCompliant;

        const sev = (complianceCheck as any)[`${item}Severity`] ?? "";
        const com = (complianceCheck as any)[`${item}Comments`] ?? "";
        const cat = (complianceCheck as any)[`${item}Category`] ?? "";
        const dd = (complianceCheck as any)[`${item}DueDate`] || null; // "" → null
        const rem = (complianceCheck as any)[`${item}Remediation`] ?? "";
        const photos = ((actionImages as any)[item] ?? []) as string[];

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
                comment: "",
                category: "",
                dueDate: null,
                remediation: "",
                photos: [],
              },
        };
      });

      // ---- door photos map ----
      const doorPhotosArr: string[] =
        (formData as any).doorPhoto ?? (formData as any).doorPhotos ?? [];
      const doorImgObj: Record<string, string> = {};
      doorPhotosArr.forEach((url, i) => {
        doorImgObj[`Image ${i + 1} Path`] = url;
      });

      if (!propertyId || propertyId.toString().length !== 36) {
        Alert.alert(
          "Invalid property ID",
          "Please select a valid property before submitting."
        );
        setSubmitting(false);
        return;
      }

      const fullFormData = {
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
          floorPlanImage: basicFormData.floorPlan?.[0] ?? "no image",
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
        additionalInfos: [{ imagePath: floorPlanImages }],
      };

      console.log("➡️ SUBMIT payload:", fullFormData);

      const response = await saveData(JSON.stringify(fullFormData));

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
    } catch (error: any) {
          if (error.response?.data?.errors) {
            console.error("🚨 Validation Errors:", error.response.data.errors);
            const firstKey = Object.keys(error.response.data.errors)[0];
            const firstMsg = error.response.data.errors[firstKey][0];
            Alert.alert("Validation Error", `${firstKey}: ${firstMsg}`);
          } else {
            Alert.alert("Submission Error", error.message || "Unknown error");
          }
        } finally {
          setSubmitting(false);
        }
  };

  const saveData = async (payload: any) => {
    try {
      const response = await http.post(SAVE_SURVEY_FORM_DATA, payload, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("✅ API Response:", response.data);
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

  // ---- Validation helpers (no more throws) ----
  const handleMandatoryFields = () => {
    // highlight first missing field if you want; for now it’s a no-op
  };

  // const handleValidationOnSave = (status: string) => {
  //   // keep your existing logic; call setValidationFlag instead of throwing
  //   setValidationFlag(false);
  //   // ... you can port your previous checks here ...
  //   // for demo, just submit:
  //   handleSubmit(status);
  // };

     const handleValidationOnSave = async () => {
    const e: Record<string, string> = {};

    // Basic requireds
    if (isEmpty(basicInfo.floor)) e.floor = "Floor is required";
    if (isEmpty(formData.doorType)) e.doorType = "Door Type is required";
    if (isEmpty(formData.doorNumber)) e.doorNumber = "Door Number is required";
    if (isEmpty(formData.hingeLocation))
      e.hingeLocation = "Hinge Location is required";
    if (isEmpty(formData.fireResistance))
      e.fireResistance = "Fire rating is required";

    // Files / images
    if (isEmpty(basicInfo.floorPlan))
      e.floorPlan = "Floor plan file is required";
    if (isEmpty(formData.doorPhoto)) e.doorPhoto = "Door photo is required";

    // Measurements (add/remove as needed)
    const reqMeasurements = [
      "head",
      "hinge",
      "closing",
      "threshold",
      "doorThickness",
      "frameDepth",
      "doorSize",
      "fullDoorsetSize",
    ];
    reqMeasurements.forEach((k) => {
      if (isEmpty((formData as any)[k])) e[k] = `${k} is required`;
    });

    // Example date required (if you want it mandatory)
    // if (!date) e.date = "Date is required";

    if (Object.keys(e).length) {
      setErrors(e);
      focusFirstError(e);
      return;
    }

    setErrors({});
    // proceed with your existing submit
    handleSubmit();
  };

  // Basic form changes
  const handleChange = (field: string, value: string) => {
    setBasicFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImagesChange = (images: string[], field: string) => {
    if (field === "Floor") {
      setBasicFormData((prev: any) => ({ ...prev, floorPlan: images }));
    } else if (field === "Door") {
      setFormData((prev: any) => ({ ...prev, doorPhotos: images }));
    } else if (field === "Additional") {
      setBasicFormData((prev: any) => ({ ...prev, additionalPhotos: images }));
    }
  };

  // ViewSurvey.tsx
  const { mode } = useLocalSearchParams<{ mode?: string }>();

  useEffect(() => {
    const modeNorm = (mode ?? "").toString().trim().toLowerCase();
    setIsView(modeNorm !== "edit"); // false in edit mode
    console.log(
      "mode raw:",
      mode,
      "normalized:",
      modeNorm,
      "isView:",
      modeNorm !== "edit"
    );
  }, [mode]);

  // ---- Data load ----
  useEffect(() => {
    if (!doorRefNumber) {
      setError("Invalid door reference number");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await http.get(GET_DOOR_INSPECTION_DATA + doorRefNumber);
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

        const fd: FormData = {
          doorNumber: data.inspectedDoorDto.doorNumber,
          doorType: data.inspectedDoorDto.doorTypeId,
          doorTypeName: data.inspectedDoorDto.doorTypeName,
          doorOther: data.inspectedDoorDto.otherDoorTypeName,
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
          (fd as any)[`${k}Comments`] = src.comment ?? "";
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
        setActionImages(physAI); // ✅ now FormComponent gets actionImages.<field>

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
          (cc as any)[`${key}Comments`] = item?.actionItem?.comment;
          (cc as any)[`${key}Remediation`] = item?.actionItem?.remediation;
          (cc as any)[`${key}Category`] = item?.actionItem?.category;
          (cc as any)[`${key}DueDate`] = item?.actionItem?.dueDate
            ? formatDateString(item.actionItem.dueDate)
            : "";
          (cc as any)[`${key}Id`] = id;
          (ai as any)[key] = item?.actionItem?.photos;

          if (key === "selfClosingDevice" && !item?.isCompliant) {
            setFireKeepLocked(true);
          }
          if (key === "doorGlazing") {
            setIsGlazing(item?.isCompliant);
          }
        });

        setComplianceCheck(cc);
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
          isView={isView}
          basicFormData={basicFormData}
          formData={formData}
          complianceCheck={complianceCheck}
          actionmenuFlag={actionMenuFlag} // ✅ use the same state consistently
          actionImages={actionImages}
          doorPhoto={(formData as any).doorPhoto}
          floorPlanImages={floorPlanImages}
          resetCaptureFlag={false}
          isColdSeals={isColdSeals}
          isGlazing={isGlazing}
          isFireKeepLocked={fireKeepLocked}
          ShowScanQRCode={false}
          doorOtherFlag={(formData as any).doorType === "99"}
          doorTypesOption={doorTypesOption}
          validationFlag={validationFlag}
          isLoading={isLoading}
          mandatoryFieldRef={mandatoryFieldRef}
          handleChange={handleChange}
          handleFormDataChange={handleFormDataChange}
          handleGapsChange={() => {}}
          handleComplianceToggle={handleComplianceToggle}
          handleImagesChange={handleImagesChange}
          handleImagesChangeMini={handleImagesChangeMini}
          handleDeleteImages={handleDeleteImages}
          handleResetAction={(key: string) => handleResetAction(key)}
          handleActionFieldsChange={(
            key: string,
            value: string,
            type: string
          ) => handleActionFieldsChange(key, value, type)}
          handleFireResistanceChange={() => {}}
          generateQRCode={() => {}}
          setShowScanQRCode={() => {}}
          handleCancel={handleCancel}
          handleSubmit={handleSubmit}
          handleValidationOnSave={handleValidationOnSave}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ViewSurvey;
