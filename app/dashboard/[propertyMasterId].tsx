import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import { useSelector } from "react-redux";
import {
  GENERATEQRCODE_API,
  GET_NEXT_REF_NUMBER,
  GET_PROPERTY_INFO_WITH_MASTER,
  SAVE_SURVEY_FORM_DATA,
} from "../../components/api/apiPath";
import http from "../../components/api/server";
import Capture from "../../components/common/Capture";
import Footer from "../../components/common/Footer";
import MiniCapture from "../../components/common/MiniCapture";
import QrScanner from "../../components/common/QrScanner";
import { hostName } from "../../components/config/config";

// import * as FileSystem from "expo-file-system";
// import { Platform } from "react-native";

/** Guess MIME from extension */
const guessMimeFromName = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
};

/** Convert base64 Data URL to a temp file URI for RN */
/** Convert base64 Data URL to a temp file URI for RN */
async function base64DataUrlToFileUri(
  dataUrl: string
): Promise<{ uri: string; name: string; type: string }> {
  if (!dataUrl) throw new Error("Empty dataUrl");
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

/** Normalize any path or base64 string into an uploadable object */
async function normaliseForUpload(
  src: string,
  field: string
): Promise<{ uri: string; name: string; type: string }> {
  if (!src) throw new Error("Invalid image source");
  if (src.startsWith("data:image/")) {
    return base64DataUrlToFileUri(src);
  }
  const name = `${field}_Image_${Date.now()}.jpg`;
  return { uri: src, name, type: guessMimeFromName(name) };
}

const isHttpUrl = (u?: string) => !!u && /^https?:\/\//i.test(u);


const Dashboard = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();

  const { propertyMasterId } = route.params;
  const userObj = useSelector((state: any) => state.user.userObj);
  const [isGlazing, setIsGlazing] = useState<boolean>(false);
  const [doorOtherFlag, setDoorOtherFlag] = useState(false);
  const [doorOptions, setDoorOptions] = useState<DoorTypeOption[]>([]);
  const [loading, setLoading] = useState(true);
  // const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [showScanQRCode, setShowScanQRCode] = useState(false);
  const [loadingQR, setLoadingQR] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const scrollRef = useRef<ScrollView>(null);
  // const mandatoryFieldRef = useRef<Record<string, any>>({}); // you’re already using this
  const [showMiniErrors, setShowMiniErrors] = useState(false);

  const [actionImages, setActionImages] = useState<Record<string, string[]>>(
    {}
  );

  interface BasicInfo {
    buildingName: string;
    uniqueRef: string;
    date: string;
    location: string;
    floor: string;
    floorPlan: string[]; // make sure this matches what you're assigning
    comments: string;
  }

  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    buildingName: "",
    uniqueRef: "",
    date: new Date().toISOString().split("T")[0],
    location: "",
    floor: "",
    floorPlan: [], // should be string, not array or object
    comments: "",
  });

  type FormData = {
    doorNumber: string;
    doorType: string;
    doorTypeName: string;
    doorOther: string;
    // doorPhoto: string;
    fireResistance: string;
    head: string;
    hingeLocation: string;
    hinge: string;
    closing: string;
    threshold: string;
    doorThickness: string;
    frameDepth: string;
    doorSize: string;
    fullDoorsetSize: string;
    compliance: string;
    doorPhoto: string[];
  };
  const isEmpty = (v: any) =>
    v === undefined ||
    v === null ||
    (typeof v === "string" && v.trim() === "") ||
    (Array.isArray(v) && v.length === 0);

  // mark the first failing field
  const focusFirstError = (errs: Record<string, string>) => {
    const firstKey = Object.keys(errs)[0];
    const el = mandatoryFieldRef.current[firstKey];
    if (el?.focus) el.focus();
    // optional: scroll to it if needed
    // scrollRef.current?.scrollTo({ y: <y-position>, animated: true });
  };
  const [formData, setFormData] = useState<FormData>({
    doorNumber: "",
    doorType: "",
    doorPhoto: [],
    doorTypeName: "",
    doorOther: "",
    // doorPhoto: "",
    fireResistance: "",
    head: "",
    hingeLocation: "",
    hinge: "",
    closing: "",
    threshold: "",
    doorThickness: "",
    frameDepth: "",
    doorSize: "",
    fullDoorsetSize: "",
    compliance: "",
  });
  type FormDataKey = keyof FormData;

  const key: FormDataKey = "doorNumber"; // Example, adjust accordingly

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (date: Date) => {
    // Format to DD/MM/YYYY
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false); // Hide calendar after selection
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const [isColdSeals, setIsColdSeals] = useState(false);
  const [actionmenuFlag, setActionMenuFlag] = useState<{
    [key: string]: boolean;
  }>({
    head: false,
    hinge: false,
    closing: false,
    threshold: false,
    doorThickness: false,
    frameDepth: false,
    doorSize: false,
    fullDoorsetSize: false,
  });

  const resetCaptureFlag = false;
  // const mandatoryFieldRef = useRef({});

  type DoorTypeOption = {
    doorTypeId: string;
    doorTypeName: string;
  };

  useEffect(() => {
    if (userObj && propertyMasterId) {
      fetchInitialData();
      // fetchPropertyData();
    }
  }, [userObj, propertyMasterId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const propRes = await http.get(
        `${GET_PROPERTY_INFO_WITH_MASTER}${propertyMasterId}`
      );
      const refRes = await http.get(
        `${GET_NEXT_REF_NUMBER}${propertyMasterId}/${userObj.userId}`
      );

      // Fetch door types from API (replace with your actual endpoint if needed)
      const doorTypesRes = await http.get(
        `${GET_PROPERTY_INFO_WITH_MASTER}${propertyMasterId}`
      );
      // If your API returns { doorTypes: [...] }
      const doorTypes = Array.isArray(doorTypesRes.data)
        ? doorTypesRes.data
        : doorTypesRes.data.doorTypes || [];

      setDoorOptions(doorTypes);

      const property = propRes.data.propertyMaster;
      const nextRef = refRes.data.nextRefNumber;

      const initials = (str: string) =>
        str
          .split(" ")
          .filter(Boolean)
          .map((w: string) => w[0].toUpperCase())
          .join("");

      const doorRef = `${initials(userObj.userName)}-${initials(
        property.propertyName
      )}-DRN-${String(nextRef).padStart(4, "0")}`;

      setBasicInfo((prev) => ({
        ...prev,
        buildingName: property.propertyName,
        uniqueRef: property.uniqueRefNo,
        location: property.propertyLocation,
      }));

      setFormData((prev) => ({
        ...prev,
        doorNumber: doorRef,
      }));
    } catch (e) {
      console.error("Failed to load property details:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleComplianceToggle = (name: string, value: boolean) => {
  setComplianceCheck((prev: any) => ({ ...prev, [name]: value }));

  // doorGlazing side effect
  if (name === "doorGlazing") setIsGlazing(value);

  // If toggled to YES (true), nuke any action fields & photos so they don't trip validation later.
  if (value === true) {
    setComplianceCheck((prev) => {
      const cleared = { ...prev };
      const suffixes = [
        "Timeline",
        "Severity",
        "Comments",
        "Category",
        "DueDate",
        "Remediation",
      ];
      for (const s of suffixes) cleared[`${name}${s}`] = s === "Comments" ? "" : "Select";
      return cleared;
    });

    // also clear saved images for that compliance item
    setActionImages((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }
};


  const handleFormDataChange = (name: string, value: string) => {
    if (name === "doorType") {
      const selectedType = doorOptions.find((opt) => opt.doorTypeId === value);
      const selectedName = selectedType?.doorTypeName || "";

      setFormData((prev) => ({
        ...prev,
        doorType: value,
        doorTypeName: selectedName,
         doorOther: selectedName === "Other" ? prev.doorOther : "",
      }));

      setDoorOtherFlag(selectedName === "Other");
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const BASE_MEASURES: Record<string, number> = {
    head: 3,
    hinge: 3,
    closing: 3,
    threshold: 3,
  };
  const COMPLIANCE_CHECK = {
    intumescentStrips: true,
    intumescentStripsTimeline: "Select",
    intumescentStripsSeverity: "Select",
    intumescentStripsComments: "",
    intumescentStripsCategory: "Select",
    intumescentStripsDueDate: "",
    intumescentStripsRemediation: "",
    intumescentStripsName: "Are there intumescent strips?",
    intumescentStripsId: "927da4a9-3c0b-46a7-8fb2-00af566a41e6",
    coldSmokeSeals: true,
    coldSmokeSealsTimeline: "Select",
    coldSmokeSealsSeverity: "Select",
    coldSmokeSealsComments: "",
    coldSmokeSealsCategory: "Select",
    coldSmokeSealsDueDate: "",
    coldSmokeSealsRemediation: "",
    coldSmokeSealsName: "Are there cold smoke seals?",
    coldSmokeSealsId: "2d46bbc6-3a52-48ee-ad7d-80c3f3cdf352",
    selfClosingDevice: true,
    selfClosingDeviceTimeline: "Select",
    selfClosingDeviceSeverity: "Select",
    selfClosingDeviceComments: "",
    selfClosingDeviceCategory: "Select",
    selfClosingDeviceDueDate: "",
    selfClosingDeviceRemediation: "",
    selfClosingDeviceName: "Self closing device?",
    selfClosingDeviceId: "145baf7e-bcc6-4c8f-b925-070e751ba2d6",
    fireLockedSign: true,
    fireLockedSignTimeline: "Select",
    fireLockedSignSeverity: "Select",
    fireLockedSignComments: "",
    fireLockedSignCategory: "Select",
    fireLockedSignDueDate: "",
    fireLockedSignRemediation: "",
    fireLockedSignName: "Fire door Keep Locked sign?",
    fireLockedSignId: "942c7963-7d98-49db-a13e-63ee7b4fcfd1",
    fireShutSign: true,
    fireShutSignTimeline: "Select",
    fireShutSignSeverity: "Select",
    fireShutSignComments: "",
    fireShutSignCategory: "Select",
    fireShutSignDueDate: "",
    fireShutSignRemediation: "",
    fireShutSignName: "Fire door Keep Shut sign?",
    fireShutSignId: "b7157137-2bfc-423d-b236-6620c527519b",
    holdOpenDevice: true,
    holdOpenDeviceName: "Is there a hold open device?",
    holdOpenDeviceId: "a106ba4e-ef40-4510-851e-09d1315becc5",
    visibleCertification: true,
    visibleCertificationName: "Is certification visible on fire door?",
    visibleCertificationId: "99ab902f-794a-491b-a6e3-26c8a57f9527",
    doorGlazing: true,
    doorGlazingName: "Does the door contain glazing?",
    doorGlazingId: "1b2886cc-a1a3-4573-a5be-7df68c0db109",
    pyroGlazing: true,
    pyroGlazingTimeline: "Select",
    pyroGlazingSeverity: "Select",
    pyroGlazingComments: "",
    pyroGlazingCategory: "Select",
    pyroGlazingDueDate: "",
    pyroGlazingRemediation: "",
    pyroGlazingName: "Is glazing pyro glazing?",
    pyroGlazingId: "c9873267-e600-4c99-bf08-088dee277909",
  };
  const [complianceCheck, setComplianceCheck] =
    useState<Record<string, any>>(COMPLIANCE_CHECK);

  // const handleFireResistanceChange = (value: string) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     fireResistance: value,
  //   }));

  //   const thresholdVal = Number(formData.threshold);

  //   if (value === "1") {
  //     setActionMenuFlag({
  //       threshold: !!formData.threshold && thresholdVal < 10,
  //     });
  //   } else {
  //     setActionMenuFlag({
  //       threshold:
  //         !!formData.threshold && thresholdVal !== BASE_MEASURES.threshold,
  //     });
  //   }

  //   if (["5", "6", "7"].includes(value)) {
  //     setIsColdSeals(true);
  //   } else {
  //     setIsColdSeals(false);
  //   }
  // };

  const handleGapsChange = (name: string, value: string) => {
    resetIndividualField(name);

    // keep text as typed
    setFormData((prev) => ({ ...prev, [name]: value }));

    const n = Number(value);
    if (!Number.isFinite(n)) {
      // turn off when not a number
      if (actionmenuFlag[name]) {
        setFormData((f: any) => {
          const {
            [`${name}Severity`]: _s,
            [`${name}Action`]: _a,
            [`${name}DueDate`]: _d,
            ...rest
          } = f;
          return rest;
        });
      }
      setActionMenuFlag((prev) => ({ ...prev, [name]: false }));
      return;
    }

    const base = BASE_MEASURES[name as keyof typeof BASE_MEASURES];

    let show = false;
    if (name === "threshold") {
      show =
        formData.fireResistance === "1"
          ? n < 10
          : n > (BASE_MEASURES.threshold ?? 3);
    } else if (base !== undefined) {
      show = n > base; // e.g., 3.1 > 3 → true
    }

    // Initialize action fields on first enable; clear on disable
    if (show && !actionmenuFlag[name]) {
      setFormData((f: any) => ({
        ...f,
        [`${name}Severity`]: f[`${name}Severity`] ?? "Select",
        [`${name}Action`]: f[`${name}Action`] ?? "",
        [`${name}DueDate`]: f[`${name}DueDate`] ?? "",
      }));
    } else if (!show && actionmenuFlag[name]) {
      setFormData((f: any) => {
        const {
          [`${name}Severity`]: _s,
          [`${name}Action`]: _a,
          [`${name}DueDate`]: _d,
          ...rest
        } = f;
        return rest;
      });
    }

    setActionMenuFlag((prev) => ({ ...prev, [name]: show }));
  };

const handleImagesChangeMini = async (newImages: string[], field: string) => {
  const prev = actionImages[field] || [];
  const clean = (newImages || []).filter(Boolean);
  // upload only the items that are not URLs
  const toUpload = clean.filter((u) => !isHttpUrl(u));
  if (toUpload.length === 0) return;

  const uploaded = (
    await Promise.all(toUpload.map((u) => uploadImageAPI([u], field)))
  ).filter((u) => !!u) as string[];

  if (uploaded.length === 0) return;

  const next = Array.from(new Set([...prev, ...uploaded]));
  setActionImages((p) => ({ ...p, [field]: next }));
  setFormData((p) => ({ ...p, [`${field}Images`]: next } as any));
};


  const handleResetAction = (
    field: string,
    section: "PHYSICAL" | "COMPLIANCE"
  ) => {
    const fieldKeys = [
      "Timeline",
      "Severity",
      "Comments",
      "Category",
      "DueDate",
      "Remediation",
    ];
    const resetFields = Object.fromEntries(
      fieldKeys.map((key) => [
        `${field}${key}`,
        key === "Comments" ? "" : "Select",
      ])
    );

    if (section === "PHYSICAL") {
      setFormData((prev) => ({
        ...prev,
        ...resetFields,
      }));
    } else if (section === "COMPLIANCE") {
      setComplianceCheck((prev) => ({
        ...prev,
        ...resetFields,
      }));
    }
  };

  const removeSpecialCharacters = (input: string) => {
    return input.replace(/[^a-zA-Z0-9 !?.,"'() & :; -]/g, ""); // Keeps letters, numbers, and spaces
  };

  const mandatoryFieldRef = useRef<Record<string, any>>({}); // you’re already using this

  const resetIndividualField = (field: string | number) => {
    mandatoryFieldRef.current[field] != null
      ? mandatoryFieldRef.current[field]
      : null;
  };

  // ...existing code...
  const getSeverityDate = (severityValue: string) => {
    switch (severityValue) {
      case "1":
        return new Date().toISOString().split("T")[0];
      case "2":
        return new Date(new Date().setDate(new Date().getDate() + 30))
          .toISOString()
          .split("T")[0];
      case "3":
        return new Date(new Date().setDate(new Date().getDate() + 90))
          .toISOString()
          .split("T")[0];
      case "4":
        return new Date(new Date().setDate(new Date().getDate() + 180))
          .toISOString()
          .split("T")[0];
      default:
        return "";
    }
  };

  const handleActionFieldsChange = (
    e: any,
    field: string,
    section: "PHYSICAL" | "COMPLIANCE"
  ) => {
    resetIndividualField(e.target.name);
    const name = `${field}${e.target.name}`;
    let value =
      e.target.name === "Comments"
        ? removeSpecialCharacters(e.target.value)
        : e.target.value;

    // Handle Severity: set DueDate automatically
    if (e.target.name === "Severity") {
      const dueDateKey = `${field}DueDate`;
      const dueDate = getSeverityDate(value);

      if (section === "PHYSICAL") {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          [dueDateKey]: dueDate,
        }));
      } else {
        setComplianceCheck((prev) => ({
          ...prev,
          [name]: value,
          [dueDateKey]: dueDate,
        }));
      }
      return;
    }

    // Handle Category: set Remediation if value is "5"
    if (e.target.name === "Category") {
      const remediationKey = `${field}Remediation`;
      const remediationText =
        value === "5" ? "Remediation - Fire Door Replacement required" : "";

      if (section === "PHYSICAL") {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          [remediationKey]: remediationText,
        }));
      } else {
        setComplianceCheck((prev) => ({
          ...prev,
          [name]: value,
          [remediationKey]: remediationText,
        }));
      }
      return;
    }

    // Default
    if (section === "PHYSICAL") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setComplianceCheck((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDeleteImages = (index: number, field: string) => {
    switch (field) {
      case "Floor": {
        const updated = [...basicInfo.floorPlan];
        updated.splice(index, 1);
        setBasicInfo((prev) => ({ ...prev, floorPlan: updated }));
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

  const [qrCodeImage, setQrCodeImage] = useState<string>("");
  const [showLoader, setShowLoader] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const generateQRCode = async () => {
    try {
      setShowLoader(true);
      const doorLink = `${window.location.origin}/editSurvey/${formData.doorNumber}`;
      const res = await http.get(`${GENERATEQRCODE_API}${doorLink}`);

      if (res.data && res.data.qrCode) {
        setQrCodeImage(res.data.qrCode); // ✅ base64 string
      } else {
        console.warn("QR code not found in response");
      }
    } catch (err) {
      console.error("QR generation error:", err);
    } finally {
      setShowLoader(false);
      setShowModal(true);
    }
  };

  const handlePrint = async (
    qrCode: string,
    formData: { doorNumber: string }
  ) => {
    const htmlContent = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .print-container { text-align: center; }
          img { max-width: 100%; height: auto; }
          h3 { margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="print-container">
          <img src="${qrCode}" alt="QR Code" width="400" height="400" />
          <h3>Door Reference Number: ${formData.doorNumber}</h3>
        </div>
      </body>
    </html>
  `;

    try {
      if (Platform.OS === "web") {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
          alert("Pop-up blocked. Please allow pop-ups to print.");
          return;
        }
        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        };
      } else {
        // Option A: open native print dialog directly
        await Print.printAsync({ html: htmlContent });

        // Option B: create a PDF and let the user share/save it
        // const { uri } = await Print.printToFileAsync({ html: htmlContent });
        // await Sharing.shareAsync(uri, { UTI: "com.adobe.pdf", mimeType: "application/pdf" });
      }
    } catch (err: any) {
      console.error("Print error:", err);
      Alert.alert("Print error", err?.message ?? String(err));
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

 const uploadImageAPI = async (
  newImages: string[],
  field: string
): Promise<string> => {
  try {
    // 💡 Filter out falsy values and keep only the last new local/base64 item
    const clean = (newImages || []).filter(Boolean);
    const last = clean.length ? clean[clean.length - 1] : null;

    if (!last) return "";                         // nothing to upload
    if (isHttpUrl(last)) return last;             // already uploaded URL

    const rawToken = userObj?.token ?? "";
    if (!rawToken) {
      console.warn("No auth token found in userObj");
      return "";
    }
    const authHeader = rawToken.startsWith("Bearer ")
      ? rawToken
      : `Bearer ${rawToken}`;

    let filePart: { uri?: string; name: string; type: string } | File | Blob;
    let name = `${field}_Image_${Date.now()}.jpg`;
    let type = "image/jpeg";

    if (Platform.OS === "web") {
      // last could be base64 or blob URL or local path handled by browser
      const res = await fetch(last);
      const blob = await res.blob();
      type = blob.type || type;
      filePart = new File([blob], name, { type });
    } else {
      // RN (Android/iOS)
      const parts = await normaliseForUpload(last, field);
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
      headers: { Authorization: authHeader }, // don't set Content-Type
      body: form,
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      console.error("Upload failed", { status: resp.status, body: text?.slice(0, 300) });
      return "";
    }

    const data = await resp.json().catch(() => ({} as any));
    return data?.result?.blobUrl || "";
  } catch (err) {
    console.error("uploadImageAPI error:", err);
    return "";
  }
};


const handleImagesChange = async (newImages: string[], field: string) => {
  const clean = (newImages || []).filter(Boolean);
  if (clean.length === 0) return; // nothing to do

  // Find the *last* item and upload only if it's not already a URL
  const last = clean[clean.length - 1];
  const uploadedUrl = isHttpUrl(last) ? last : await uploadImageAPI([last], field);
  if (!uploadedUrl) return;

  switch (field) {
    case "Additional": {
      setAdditionalImages((prev) => [...prev, uploadedUrl]);
      break;
    }
    case "Door": {
      setFormData((prev) => ({
        ...prev,
        doorPhoto: [...(prev.doorPhoto || []), uploadedUrl],
      }));
      break;
    }
    case "Floor": {
      setBasicInfo((prev) => ({
        ...prev,
        floorPlan: [...(prev.floorPlan || []), uploadedUrl],
      }));
      break;
    }
    default:
      console.warn(`Unhandled image field: ${field}`);
  }
};


  // nice labels for alert lines
  const LABELS: Record<string, string> = {
    head: "Head",
    hinge: "Hinge",
    closing: "Closing",
    threshold: "Threshold",
    doorThickness: "Door Thickness",
    frameDepth: "Frame Depth",
    doorSize: "Door Size",
    fullDoorsetSize: "Full Doorset Size",
    intumescentStrips: "Intumescent Strips",
    coldSmokeSeals: "Cold Smoke Seals",
    fireLockedSign: "Keep Locked Sign",
    fireShutSign: "Keep Shut Sign",
    pyroGlazing: "Pyro Glazing",
  };

  // given form object and a prefix, tell which MiniCapture fields are missing
  const requiredMiniErrorsForPrefix = (obj: any, prefix: string): string[] => {
    const val = (k: string) => String(obj?.[`${prefix}${k}`] ?? "").trim();
    const isMissing = (v: string) => v === "" || v === "Select"; // 👈 key change

    const sev = val("Severity");
    const cat = val("Category");
    const due = val("DueDate");
    const rem = val("Remediation");

    const errs: string[] = [];
    if (isMissing(sev)) errs.push("Severity");
    if (isMissing(cat)) errs.push("Category");
    if (isMissing(due)) errs.push("Due Date");
    if (cat !== "5" && rem.trim() === "") errs.push("Remediation");
    return errs;
  };

  // build one list of all missing MiniCapture requirements (physical + compliance)
 const PHYSICAL_KEYS: string[] = [
  "head",
  "hinge",
  "closing",
  "threshold",
  "doorThickness",
  "frameDepth",
  "doorSize",
  "fullDoorsetSize",
];

const collectMiniCaptureMissing = (): string[] => {
  const lines: string[] = [];
  const title = (k: string) => LABELS[k] || k;

  // PHYSICAL: only check the known physical keys and only when their flag is true
  PHYSICAL_KEYS.forEach((k) => {
    if (actionmenuFlag[k]) {
      const missing = requiredMiniErrorsForPrefix(formData, k);
      if (missing.length) lines.push(`${title(k)}: ${missing.join(", ")}`);
    }
  });

  // COMPLIANCE: only when toggle is NO (false) AND the item should be shown
  const complianceCandidates = [
    "intumescentStrips",
    "coldSmokeSeals",
    "fireLockedSign",
    "fireShutSign",
    "pyroGlazing",
  ] as const;

  const fireRes = String(formData.fireResistance ?? "");
  const showColdSmoke = ["5", "6", "7"].includes(fireRes);
  const showPyro = complianceCheck["doorGlazing"] === true;

  complianceCandidates.forEach((key) => {
    const shouldShow =
      complianceCheck[key] === false &&
      (key !== "coldSmokeSeals" || showColdSmoke) &&
      (key !== "pyroGlazing" || showPyro);

    if (shouldShow) {
      const missing = requiredMiniErrorsForPrefix(complianceCheck, key);
      if (missing.length) lines.push(`${title(key)}: ${missing.join(", ")}`);
    }
  });

  return lines;
};


  const validateAndSubmit = async () => {
    const e: Record<string, string> = {};

    if (Object.keys(e).length) {
      setErrors(e);
      focusFirstError(e);
      return;
    }

    // Basic requireds
    if (isEmpty(basicInfo.floor)) e.floor = "Floor is required";
    if (isEmpty(formData.doorType)) e.doorType = "Door Type is required";
    if (isEmpty(formData.doorPhoto)) e.doorPhoto = "Door Photo is required";
    if (isEmpty(formData.doorNumber)) e.doorNumber = "Door Number is required";
    if (isEmpty(formData.hingeLocation))
      e.hingeLocation = "Hinge Location is required";
    if (isEmpty(formData.fireResistance))
      e.fireResistance = "Fire rating is required";

    // Files / images
    if (isEmpty(basicInfo.floorPlan))
      e.floorPlan = "Floor plan file is required";
    if (isEmpty(formData.doorPhoto)) e.doorPhoto = "Door photo is required";
        // if (isEmpty(formData.doorOther)) e.doorPhoto = "DoorOther is required";


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
    if (!date) e.date = "Date is required";

    if (Object.keys(e).length) {
      setErrors(e);
      focusFirstError(e);
      return;
    }

    // ✅ Now validate MiniCapture blocks
    setShowMiniErrors(true); // makes MiniCapture show its inline red messages
    const miniIssues = collectMiniCaptureMissing();
    if (miniIssues.length) {
      showAlert(
        "Missing required action details",
        `Please complete:\n\n• ${miniIssues.join("\n• ")}`
      );
      return;
    }
    setErrors({});
    // proceed with your existing submit
    handleSubmit();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const nowIso = new Date().toISOString();

      const doorImgArr = formData.doorPhoto;
      const doorImgObj = {
        additionalProp1: doorImgArr[0] || "",
        additionalProp2: doorImgArr[1] || "",
        additionalProp3: doorImgArr[2] || "",
      };

      const PropertyInfo = {
        propertyMasterId: propertyMasterId,
        inspectionStartedOn: nowIso,
        inspectedBy: userObj?.userName || "",
        inspectedById: userObj?.userId || 0,
        inspectionApprovedDate: nowIso,
        lastInspectionDate: nowIso,
        inspectionApprovedBy: "",
        lastInspectedBy: userObj?.userName || "",
        status: "Compliant",
        inspectionUpdatedBy: userObj?.userName || "",
        inspectionUpdatedOn: nowIso,
        nextInspectionDueDate: nowIso,
      };

      const InspectedPropertyFloorsInfo = {
        floorNo: basicInfo.floor ? Number(basicInfo.floor) : 0,
        floorPlanImage: basicInfo.floorPlan[0] || "",
        createdBy: userObj?.userName || "",
        updatedBy: userObj?.userName || "",
      };

      const InspectedDoorDto = {
        doorTypeId: formData.doorType || "",
        doorRefNumber: formData.doorNumber || "",
        doorNumber: formData.doorNumber || "",
        floorNo: basicInfo.floor ? Number(basicInfo.floor) : 0,
        floorImage: basicInfo.floorPlan[0] || "",
        inspectedBy: userObj?.userName || "",
        doorInspectionDate: nowIso,
        status: "Compliant",
        flatName: "",
        doorTypeName: formData.doorTypeName || "",
        propertyName: basicInfo.buildingName || "",
        otherDoorTypeName: formData.doorOther || "",
        doorLocation: basicInfo.location || "",

        doorPhoto: doorImgObj,
      };

      const complianceKeys = [
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

      const complianceChecks = complianceKeys.map((key) => {
        const id = complianceCheck[`${key}Id`] || "";
        const isCompliant = complianceCheck[key] ?? true;
        const dueDateVal = complianceCheck[`${key}DueDate`] || nowIso;

        return {
          complianceCheckMasterID: id,
          isCompliant,
          actionItem: {
            timeline: isCompliant
              ? ""
              : complianceCheck[`${key}Timeline`] || "",
            severity: isCompliant
              ? ""
              : complianceCheck[`${key}Severity`] || "",
            comment: isCompliant ? "" : complianceCheck[`${key}Comments`] || "",
            category: isCompliant
              ? ""
              : complianceCheck[`${key}Category`] || "",
            dueDate: isCompliant ? null : dueDateVal,
            remediation: isCompliant
              ? ""
              : complianceCheck[`${key}Remediation`] || "",
            photos: isCompliant ? [] : actionImages[key] || [],
          },
        };
      });

      const physicalFields = [
        "head",
        "hinge",
        "closing",
        "threshold",
        "doorThickness",
        "frameDepth",
        "doorSize",
        "fullDoorsetSize",
      ];

      const PhysicalMeasurement: Record<string, any> = {
        fireRatingID: formData.fireResistance || "",
        hingePosition: formData.hingeLocation || "",
      };

      physicalFields.forEach((key: string) => {
        const timeline =
          formData[`${key}Timeline` as keyof typeof formData] || "";
        const severity =
          formData[`${key}Severity` as keyof typeof formData] || "";
        const category =
          formData[`${key}Category` as keyof typeof formData] || "";
        const remediation =
          formData[`${key}Remediation` as keyof typeof formData] || "";
        const dueDate =
          formData[`${key}DueDate` as keyof typeof formData];
        const comment =
          formData[`${key}Comments` as keyof typeof formData] || "";

        PhysicalMeasurement[key] = {
          value: Number(formData[key as keyof typeof formData] || 0),
          actionItem: "",
          timeline,
          severity,
          category,
          remediation,
          dueDate,
          comment,
          photos: actionImages[key] || [],
        };
      });

      PhysicalMeasurement["comments"] = basicInfo.comments || "";

      // const AdditionalInfos = [
      //   { imagePath: basicInfo.floorPlan[0] ? [basicInfo.floorPlan[0]] : [] },
      // ];
      const AdditionalInfos = additionalImages.map((img) => ({
        imagePath: [img],
      }));

      const payload = {
        propertyInfo: PropertyInfo,
        inspectedPropertyFloorsInfo: InspectedPropertyFloorsInfo,
        inspectedDoorDto: InspectedDoorDto,
        complianceChecks,
        additionalInfos: AdditionalInfos,
        physicalMeasurement: PhysicalMeasurement,
      };

      // ✅ Log payload clearly
      console.log("📦 Final Payload:\n", JSON.stringify(payload, null, 2));

      const response = await http.post(SAVE_SURVEY_FORM_DATA, payload);

       if (response.status === 200 || response.status === 201) {
      // ✅ Success message
      Alert.alert("Success", "✅ Inspection form submitted successfully.", [
        {
          text: "OK",
          onPress: () => {
            // navigate back when OK is pressed
            navigation.goBack();
          },
        },
      ]);
    } else {
      Alert.alert("❌ Error", "Submission failed. Try again.");
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

  const handleChange = (fieldName: string, value: string) => {
    if (fieldName === "comments") {
      const clean = removeSpecialCharacters(value);
      setBasicInfo((prev) => ({ ...prev, comments: clean }));
    } else {
      setBasicInfo((prev) => ({ ...prev, [fieldName]: value }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* <View style={styles.card}> */}
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <Text style={styles.label}>Building Name</Text>
          <TextInput
            style={styles.input}
            value={basicInfo.buildingName}
            editable={false}
          />

          <Text style={styles.label}>Unique Building Reference</Text>
          <TextInput
            style={styles.input}
            value={basicInfo.uniqueRef}
            editable={false}
          />

          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            value={basicInfo.date}
            editable={false}
          />

          {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={[styles.input, { height: 60 }]}
            multiline
            value={basicInfo.location}
            editable={false}
          />

          <Text style={styles.label}>Floor*</Text>
          <TextInput
            ref={(ref) => {
              if (ref) mandatoryFieldRef.current.floor = ref;
            }}
            // ref={(r) => (mandatoryFieldRef.current.floor = r)}
            style={[styles.input, errors.floor && styles.errorInput]}
            value={basicInfo.floor}
            keyboardType="numeric"
            onChangeText={(text) =>
              setBasicInfo((prev) => ({ ...prev, floor: text }))
            }
          />
          {errors.floor && <Text style={styles.errorText}>{errors.floor}</Text>}

          <Text style={styles.label}>Upload Floor Plan*</Text>
          <Capture
            onImagesChange={(images) => handleImagesChange(images, "Floor")}
            reset={resetCaptureFlag}
            onImageDelete={(index) => handleDeleteImages(index, "Floor")}
            fieldValue="floorFile"
            singleImageCapture={true}
            isView={false}
            savedImages={basicInfo.floorPlan}
            mandatoryFieldRef={mandatoryFieldRef}
            allowGallery={true}
          />
          {errors.floorPlan && (
            <Text style={styles.errorText}>{errors.floorPlan}</Text>
          )}

          <Text style={styles.label}>Door Number</Text>
          <TextInput
            style={styles.input}
            value={formData.doorNumber}
            editable={false}
          />

          <Text style={styles.label}>Door Type*</Text>
          <View
            style={[
              {
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 6,
                backgroundColor: "#e9f1fb",
                overflow: "hidden",
                height: Platform.OS === "ios" ? 200 : 48,
                justifyContent: "center",
                marginTop: 8,
              },
              errors.doorType && styles.errorInput, // red border when invalid
            ]}
          >
            <Picker
              ref={(ref) => {
                if (ref) mandatoryFieldRef.current.doorType = ref;
              }}
              selectedValue={formData.doorType}
              onValueChange={(v) => handleFormDataChange("doorType", v)}
              dropdownIconColor="#034694"
              style={{
                width: "100%",
                backgroundColor: "#e9f1fb",
                color: "#034694",
                fontSize: 16,
              }}
              mode="dropdown"
            >
              <Picker.Item label="Select" value="" />
              {doorOptions.map((opt) => (
                <Picker.Item
                  color="#034694"
                  key={opt.doorTypeId}
                  label={opt.doorTypeName}
                  value={opt.doorTypeId}
                />
              ))}
            </Picker>
          </View>
          {errors.doorType && (
            <Text style={styles.errorText}>{errors.doorType}</Text>
          )}

          {doorOtherFlag && (
            <>
                      {/* {errors.doorOther && <Text style={styles.errorText}>{errors.doorOther}</Text>} */}

              <Text style={styles.label}>Other Door Type*</Text>
              <TextInput
                style={styles.input}
                value={formData.doorOther}
                onChangeText={(t) =>
                  setFormData((prev) => ({ ...prev, doorOther: t }))
                }
              />
            </>
          )}

          <Text style={styles.label}>Upload Door Photo*</Text>
          <Capture
            onImagesChange={(images) => handleImagesChange(images, "Door")}
            reset={resetCaptureFlag}
            onImageDelete={(index) => handleDeleteImages(index, "Door")}
            fieldValue="doorFile"
            singleImageCapture
            isView={false}
            savedImages={formData.doorPhoto}
            mandatoryFieldRef={mandatoryFieldRef}
            allowGallery={true} // ✅ add this to let Capture also open gallery
          />
           {errors.doorPhoto && (
            <Text style={styles.errorText}>{errors.doorPhoto}</Text>
          )}
        {/* </View> */}

        {/* QR CODE SECTION */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>QR Code</Text>

          <TouchableOpacity style={styles.button} onPress={generateQRCode}>
            <Text>Generate QR Code</Text>
          </TouchableOpacity>
          {loadingQR && <ActivityIndicator style={{ marginTop: 10 }} />}
          {showLoader ? (
            <ActivityIndicator size="large" color="black" />
          ) : (
            qrCodeImage && (
              <Image
                source={{ uri: qrCodeImage }}
                style={{
                  height: 200,
                  width: 200,
                  alignSelf: "center",
                  marginTop: 20,
                }}
              />
            )
          )}

          <TouchableOpacity
            style={[styles.button, { marginTop: 20 }]}
            onPress={() => setShowScanQRCode((prev) => !prev)}
          >
            <Text>{showScanQRCode ? "Close QR Scanner" : "Scan QR Code"}</Text>
          </TouchableOpacity>

          {showScanQRCode && (
            <View style={{ height: 400 }}>
              <QrScanner />
            </View>
          )}
          {qrCodeImage && (
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                handlePrint(qrCodeImage, { doorNumber: formData.doorNumber })
              }
            >
              <Text>Print QR Code</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Fire Rating and Certification*</Text>
          <View
            style={[
              {
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 6,
                backgroundColor: "#e9f1fb",
                overflow: "hidden",
                height: Platform.OS === "ios" ? 200 : 48,
                justifyContent: "center",
                marginTop: 8,
              },
              errors.fireResistance && styles.errorInput, // red border when invalid
            ]}
          >
            <Picker
              selectedValue={String(formData?.fireResistance ?? "")} // ✅ force string
              onValueChange={(value) =>
                handleFormDataChange("fireResistance", value)
              }
              // enabled={!isView}
              dropdownIconColor="#034694"
              style={{
                width: "100%",
                backgroundColor: "#e9f1fb",
                color: "#034694",
                fontSize: 16,
              }}
            >
              <Picker.Item label="Select" value="" color="#999" />
              <Picker.Item label="FD30" value="1" color="#034694" />
              <Picker.Item label="FD60" value="2" color="#034694" />
              <Picker.Item label="FD90" value="3" color="#034694" />
              <Picker.Item label="FD120" value="4" color="#034694" />
              <Picker.Item label="FD30S" value="5" color="#034694" />
              <Picker.Item label="FD60S" value="6" color="#034694" />
              <Picker.Item label="FD90S" value="7" color="#034694" />
              <Picker.Item label="FD120S" value="8" color="#034694" />
            </Picker>
          </View>
        </View>
        {/* Physical Measurements Section */}

        <View style={styles.card}>
          <Text style={styles.label}>Physical Measurements - Gaps</Text>

          {[
            { key: "head", label: "Head (mm)" },
            { key: "hinge", label: "Hinge (mm)" },
            { key: "closing", label: "Closing (mm)" },
            { key: "threshold", label: "Threshold (mm)" },
            { key: "doorThickness", label: "Door Thickness (mm)" },
            { key: "frameDepth", label: "Frame Depth (mm)" },
            { key: "doorSize", label: "Door Size (mm)" },
            { key: "fullDoorsetSize", label: "Full Doorset Size (mm)" },
          ].map(({ key, label }) => (
            <View key={key}>
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>
                  {label} <Text style={{ color: "red" }}>*</Text>
                </Text>

                <TextInput
                  ref={(ref) => {
                    if (ref) mandatoryFieldRef.current[key] = ref;
                  }}
                  style={[styles.input, errors[key] && styles.errorInput]}
                  keyboardType={
                    Platform.OS === "ios" ? "decimal-pad" : "numeric"
                  }
                  value={formData[key as FormDataKey]?.toString() ?? ""}
                  onChangeText={(val) => {
                    const normalized = val
                      .replace(/,/g, ".") // comma → dot
                      .replace(/[^\d.]/g, "") // keep digits and dots
                      .replace(/^(\d*\.\d*).*$/, "$1"); // keep only first dot
                    handleGapsChange(key, normalized);
                  }}
                  placeholder={label}
                />
                {errors[key] && (
                  <Text style={styles.errorText}>{errors[key]}</Text>
                )}

                {actionmenuFlag[key] && (
                  <View style={styles.captureBox}>
                    <MiniCapture
                      fieldValue={key}
                      formData={formData}
                      onImagesChange={(images) =>
                        handleImagesChangeMini(images, key)
                      }
                      onResetChange={() => handleResetAction(key, "PHYSICAL")}
                      onHandleActionFieldsChange={(val, type) =>
                        handleActionFieldsChange(
                          { target: { name: type, value: val } },
                          key,
                          "PHYSICAL"
                        )
                      }
                      onImageDelete={(index) => handleDeleteImages(index, key)}
                      reset={resetCaptureFlag}
                      mandatoryFieldRef={mandatoryFieldRef}
                      isView={false}
                      savedImages={actionImages[key] || []}
                      forceShow={actionmenuFlag[key]} // ✅ tell MiniCapture to show at 3.1
                      showErrors={showMiniErrors}
                    />

                    {(formData as any)[`${key}Severity`] &&
                      (formData as any)[`${key}Severity`] !== "Select" && (
                        <View style={{ marginTop: 8 }}>
                          <Text style={styles.label}>Due Date</Text>
                          <TextInput
                            style={styles.input}
                            value={(formData as any)[`${key}DueDate`] || ""}
                            editable={false}
                          />
                        </View>
                      )}
                  </View>
                )}
              </View>

              {/* 👇 Add hingeLocation Picker just after 'head' field */}
              {key === "head" && (
                <View>
                  <Text style={styles.label}>
                    Hinge Location <Text style={{ color: "red" }}>*</Text>
                  </Text>
                  <View
                    style={[
                      {
                        borderWidth: 1,
                        borderColor: "#ccc",
                        borderRadius: 6,
                        backgroundColor: "#e9f1fb",
                        overflow: "hidden",
                        height: Platform.OS === "ios" ? 200 : 48,
                        justifyContent: "center",
                        marginTop: 8,
                      },
                      errors.hingeLocation && styles.errorInput,
                    ]}
                  >
                    <Picker
                      selectedValue={formData?.hingeLocation ?? ""}
                      onValueChange={(value) =>
                        handleFormDataChange("hingeLocation", value)
                      }
                      // enabled={!isView}
                      dropdownIconColor="#034694"
                      style={{
                        color: "#034694", // ✅ Text color
                        fontSize: 16,
                        width: "100%",
                        backgroundColor: "#e9f1fb",
                      }}
                    >
                      <Picker.Item label="Select" value="" color="#999" />
                      <Picker.Item label="Left" value="1" color="#034694" />
                      <Picker.Item label="Right" value="2" color="#034694" />
                    </Picker>
                    {errors.hingeLocation && (
                      <Text style={styles.errorText}>
                        {errors.hingeLocation}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* === Compliance Check (MiniCapture shows when value is FALSE) === */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Compliance Check</Text>

          {(() => {
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

            const miniEnabled: ComplianceKey[] = [
              "intumescentStrips",
              "coldSmokeSeals",
              "fireLockedSign",
              "fireShutSign",
              "pyroGlazing",
            ];

            let showFireLockedSign =
              complianceCheck["selfClosingDevice"] === false; // rule 1

let showPyroGlazing = complianceCheck["doorGlazing"] === true; // ✅ new


            const items: {
              key: ComplianceKey;
              label: string;
              show?: boolean;
            }[] = [
              {
                key: "intumescentStrips",
                label: "Are there intumescent strips?",
              },
              {
                key: "coldSmokeSeals",
                label: "Are there cold smoke seals?",
                show:
                  formData.fireResistance === "5" ||
                  formData.fireResistance === "6" ||
                  formData.fireResistance === "7",
              },
              { key: "selfClosingDevice", label: "Self closing device?" },
              {
                key: "fireLockedSign",
                label: "Fire door Keep Locked sign?",
                show: showFireLockedSign,
              },
              { key: "fireShutSign", label: "Fire door Keep Shut sign?" },
              { key: "holdOpenDevice", label: "Is there a hold open device?" },
              {
                key: "visibleCertification",
                label: "Is certification visible on fire door?",
              },
              {
                key: "doorGlazing",
                label: "Does the door contain glazing?",
                // show: showPyroGlazing,
              },
              {
                key: "pyroGlazing",
                label: "Is glazing pyro glazing?",
                show: showPyroGlazing,
              },
            ];

            return items
              .filter((i) => i.show === undefined || i.show)
              .map(({ key, label, show }) => {
                const allowedByShowFlag = show === undefined || show;
                const showMini =
                  miniEnabled.includes(key) &&
                  allowedByShowFlag &&
                  complianceCheck[key] === false;

                return (
                  <View key={key} style={{ marginBottom: 16 }}>
                    <View style={styles.complianceRow}>
                      <View style={styles.complianceLabelWrap}>
                        <Text
                          style={styles.complianceLabel}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {label}
                        </Text>
                      </View>

                      <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>N</Text>
                        <Switch
                          value={!!complianceCheck[key]}
                          onValueChange={(val) =>
                            handleComplianceToggle(key, val)
                          }
                        />
                        <Text style={styles.switchLabel}>Y</Text>
                      </View>
                    </View>

                    {showMini && (
                      <View style={styles.captureBox}>
                        <MiniCapture
                          fieldValue={key}
                          formData={complianceCheck}
                          savedImages={actionImages[key] || []}
                          onImagesChange={(images: string[]) =>
                            handleImagesChangeMini(images, key)
                          }
                          onImageDelete={(index: number) =>
                            handleDeleteImages(index, key)
                          }
                          onResetChange={() =>
                            handleResetAction(key, "COMPLIANCE")
                          }
                          onHandleActionFieldsChange={(
                            val: string,
                            fieldName: string
                          ) =>
                            handleActionFieldsChange(
                              { target: { name: fieldName, value: val } },
                              key,
                              "COMPLIANCE"
                            )
                          }
                          reset={resetCaptureFlag}
                          mandatoryFieldRef={mandatoryFieldRef}
                          isView={false}
                          forceShow={true}
                          showErrors={showMiniErrors}
                        />
                      </View>
                    )}
                  </View>
                );
              });
          })()}
        </View>

        <View
          style={{
            marginBottom: 24,
            padding: 16,
            backgroundColor: "#fff",
            borderRadius: 8,
            elevation: 2,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 10 }}>
            Additional Photos
          </Text>

          <Capture
            onImagesChange={(images) =>
              handleImagesChange(images, "Additional")
            }
            onImageDelete={(index) => handleDeleteImages(index, "Additional")}
            reset={resetCaptureFlag}
            mandatoryFieldRef={mandatoryFieldRef}
            fieldValue="additionalFile"
            savedImages={additionalImages}
            singleImageCapture={false}
            allowGallery={true}
            isView={false}
          />
        </View>

        <View
          style={{
            marginBottom: 24,
            padding: 16,
            backgroundColor: "#fff",
            borderRadius: 8,
            elevation: 2,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 10 }}>
            Additional Comments
          </Text>
          <TextInput
            style={{
              height: 120,
              borderWidth: 1,
              borderColor: "#ccc",
              padding: 10,
              borderRadius: 8,
              textAlignVertical: "top",
              backgroundColor: "#f9f9f9",
            }}
            multiline
            placeholder="Comments"
            value={basicInfo.comments}
            onChangeText={(text) => handleChange("comments", text)} // ✅ matches key
          />
        </View>
      </ScrollView>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 30,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[
            styles.button,
            {
              backgroundColor: "#ffffff",
              paddingVertical: 14,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
              borderWidth: 1,
              borderColor: "#000000",
              flex: 1, // equal space
              marginLeft: 8, // gap between buttons
            },
          ]}
        >
          <Text style={{ color: "#000000", fontSize: 16, fontWeight: "600" }}>
            Back
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: "#ffffff",
              paddingVertical: 14,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
              borderWidth: 1,
              borderColor: "#000000",
              flex: 1, // equal space
              marginRight: 8, // gap between buttons
            },
          ]}
          // onPress={handleSubmit}
          onPress={validateAndSubmit}
        >
          <Text style={{ color: "#000000", fontSize: 16, fontWeight: "600" }}>
            {submitting ? "Submitting..." : "Submit"}
          </Text>
        </TouchableOpacity>
      </View>

      {message ? (
        <View
          style={{
            marginTop: 20,
            backgroundColor: "#d4edda",
            borderColor: "#c3e6cb",
            borderWidth: 1,
            padding: 12,
            borderRadius: 6,
          }}
        >
          <Text style={{ color: "#155724", fontSize: 14 }}>{message}</Text>
        </View>
      ) : null}

      <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f5f5f5",
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  captureBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#f2f2f2",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    color: "#222",
    marginTop: 20,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
    color: "#333",
    fontSize: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f8f8f8",
    fontSize: 20,
  },
  textarea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    minHeight: 70,
    textAlignVertical: "top",
    marginTop: 10,
    fontSize: 20,
  },
  complianceForm: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  errorInput: { borderColor: "red" },
  errorText: { color: "red", marginTop: 4, fontSize: 12 },
  preview: {
    width: "100%",
    height: 200,
    marginTop: 10,
    borderRadius: 6,
  },
  button: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  cameraIcon: {
    marginLeft: 8,
    fontSize: 20,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    overflow: "hidden",
    height: 48,
    justifyContent: "center",
  },
  inputWrapper: {
    marginBottom: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#e9f1fb",
    overflow: "hidden",
    height: Platform.OS === "ios" ? 200 : 48, // iOS needs height
    justifyContent: "center",
    marginTop: 8,
  },
  picker: {
    width: "100%",
    backgroundColor: "#e9f1fb",
    color: "#034694",
    fontSize: 16,
  },
  complianceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },

  // Wrap for the label so it can shrink and ellipsize
  complianceLabelWrap: {
    flex: 1,
    minWidth: 0, // <-- critical so Text can actually shrink/ellipsize
  },

  // Optional: a bit smaller than your global .label (which is 20)
  complianceLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0, // <-- don't let the switch group shrink
  },

  switchLabel: {
    fontSize: 16,
    marginHorizontal: 6, // simple, cross-platform spacing
  },

  // complianceRow: {
  //   marginBottom: 16,
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   alignItems: "center",
  //   gap: 16,
  //   flexWrap: "wrap",
  // },
});

export default Dashboard;
function setError(arg0: any) {
  throw new Error("Function not implemented.");
}

function setFloorPlanImages(combined: any[]) {
  throw new Error("Function not implemented.");
}

function setHighlightDoor(arg0: boolean) {
  throw new Error("Function not implemented.");
}

function showAlert(title: string, message: string) {
  Alert.alert(title, message);
}
