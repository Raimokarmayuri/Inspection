import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
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
  const [highlightDoor, setHighlightDoor] = useState(false);

  // const [actionImages, setActionImages] = useState<{
  //   [key: string]: { url: string; name: string }[];
  // }>({});
  const [photos, setPhotos] = useState<{ uri: string }[]>([]);
  const [physicalFields, setPhysicalFields] = useState({
    doorWidth: "",
    doorHeight: "",
    doorMaterial: "",
    // add all your required fields
  });
  const [selectedItems, setSelectedItems] = useState({
    fireResistance: "",
    smokeSealType: "",
    doorType: "",
    // whatever you're collecting from dropdowns
  });
  const [actionImages, setActionImages] = useState<Record<string, string[]>>(
    {}
  );

  // const [basicInfo, setBasicInfo] = useState({
  //   buildingName: "",
  //   uniqueRef: "",
  //   date: new Date().toISOString().split("T")[0],
  //   location: "",
  //   floor: "",
  //   // floorPlan: "",
  //     floorPlan: string;
  //     floorPlan: [] as string[], // 👈 change here

  // });

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

  const [formData, setFormData] = useState<FormData>({
    doorNumber: "",
    doorType: "",
    doorPhoto: [],
    doorTypeName: "",
    doorOther: "",
    // doorPhoto: "",
    fireResistance: "",
    head: "",
    hingeLocation: "Select",
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
  const [floorPlanImages, setFloorPlanImages] = useState<string[]>([]);

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
    if (name === "doorGlazing") {
      setIsGlazing(value);
    }
    setActionMenuFlag((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFormDataChange = (name: string, value: string) => {
    if (name === "doorType") {
      const selectedType = doorOptions.find((opt) => opt.doorTypeId === value);
      const selectedName = selectedType?.doorTypeName || "";

      setFormData((prev) => ({
        ...prev,
        doorType: value,
        doorTypeName: selectedName,
      }));

      setDoorOtherFlag(selectedName === "Other");
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const pickImage = async (field: string) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      const uri = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;

      if (field === "floorPlan") {
        // Upload the image
        const uploadedUrl = await uploadImageAPI([uri], "Floor");
        if (uploadedUrl) {
          setBasicInfo((prev) => ({
            ...prev,
            floorPlan: [...(prev.floorPlan || []), uploadedUrl],
          }));
        }
      }
    }
  };

  const BASE_MEASURES: { [key: string]: number } = {
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

  // const [complianceCheck, setComplianceCheck] = useState<ComplianceCheck>(COMPLIANCE_CHECK);

  const handleFireResistanceChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      fireResistance: value,
    }));

    const thresholdVal = Number(formData.threshold);

    if (value === "1") {
      setActionMenuFlag({
        threshold: !!formData.threshold && thresholdVal < 10,
      });
    } else {
      setActionMenuFlag({
        threshold:
          !!formData.threshold && thresholdVal !== BASE_MEASURES.threshold,
      });
    }

    if (["5", "6", "7"].includes(value)) {
      setIsColdSeals(true);
    } else {
      setIsColdSeals(false);
    }
  };

  const handleGapsChange = (name: string, value: string) => {
    resetIndividualField(name); // currently a placeholder

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const numericValue = parseFloat(value);
    const threshold = BASE_MEASURES[name];

    if (name === "threshold") {
      if (formData.fireResistance === "1") {
        setActionMenuFlag((prev) => ({
          ...prev,
          [name]: numericValue < 10,
        }));
      } else {
        setActionMenuFlag((prev) => ({
          ...prev,
          [name]: numericValue > threshold,
        }));
      }
    } else {
      setActionMenuFlag((prev) => ({
        ...prev,
        [name]: numericValue > threshold,
      }));
    }
  };

  const handleImagesChangeMini = async (
    newImages: string[],
    field: string
  ): Promise<void> => {
    const imgArr = actionImages[field] || [];
    const combined = [...imgArr, ...newImages];

    setActionImages((prev) => ({
      ...prev,
      [field]: combined,
    }));
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

  // const mandatoryFieldRef = useRef({});
  // const mandatoryFieldRef = useRef<Record<string, TextInput | null>>({
  //   hingeLocation: null,
  // });
  const mandatoryFieldRef = useRef<Record<string, TextInput | null>>({});

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
  // ...existing code...

  // ...existing code...
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

  //   const handlePrint = () => {
  //   const printWindow = window.open("", "_blank");
  //   printWindow.document.write(`
  //     <html>
  //       <head>
  //         <style>
  //           body { font-family: Arial, sans-serif; }
  //           .print-container { text-align: center; }
  //           .modal-header { background-color: gray; color: white; padding: 10px; }
  //         </style>
  //       </head>
  //       <body>
  //         <div class="print-container" style="margin-top:100px">
  //           <img src="${qrCode}" alt="QR Code" height='400px' width='400px' />
  //           <h3>Door Reference Number: ${formData.doorNumber}</h3>
  //         </div>
  //       </body>
  //     </html>
  //   `);
  //   printWindow.document.close();
  //   printWindow.print();
  //   printWindow.close();
  // };

  const handlePrint = (qrCode: string, formData: { doorNumber: string }) => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      console.error("Failed to open print window.");
      return;
    }

    const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .print-container { text-align: center; }
          .modal-header { background-color: gray; color: white; padding: 10px; }
        </style>
      </head>
      <body>
        <div class="print-container" style="margin-top:100px">
          <img src="${qrCode}" alt="QR Code" height="400px" width="400px" />
          <h3>Door Reference Number: ${formData.doorNumber}</h3>
        </div>
      </body>
    </html>
  `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load before printing
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  const manualComplianceIds: Record<string, string> = {
    complianceCheckMasterID: "f54b5067-b68d-43b7-83cd-239dcedc5976",
  };

  const getBase64FromUri = async (uri: string): Promise<string> => {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/jpeg;base64,${base64}`;
  };

  const base64ToFile = (base64String: string, filename: string): File => {
    const arr = base64String.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  const uploadImageAPI = async (
    newImages: string[],
    field: string
  ): Promise<string> => {
    try {
      const latestImage = newImages[newImages.length - 1];
      const file = base64ToFile(
        latestImage,
        `${field}_Image_${Date.now()}.jpg`
      );
      const formDataToUpload = new FormData();
      formDataToUpload.append("File", file);
      formDataToUpload.append("Client", "ABC");
      formDataToUpload.append("Property", "Candor");
      formDataToUpload.append("InspectionDate", new Date().toISOString());

      const response = await fetch(`${hostName}api/Inspection/upload`, {
        method: "POST",
        body: formDataToUpload,
        headers: {
          Authorization: `Bearer ${userObj?.token}`,
        },
      });
      console.log("Auth Token:", `Bearer ${userObj?.token}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const dataResponse = await response.json();
      return dataResponse?.result?.blobUrl || "";
    } catch (error: any) {
      setError(error?.data || error);
      return "";
    }
  };

  const handleImagesChange = async (newImages: string[], field: string) => {
    const uploadedUrl = await uploadImageAPI(newImages, field);
    if (!uploadedUrl) return;

    switch (field) {
      case "Additional": {
        const combined = [...additionalImages, uploadedUrl];
        setAdditionalImages(combined);
        break;
      }

      case "Door": {
        setFormData((prev) => ({
          ...prev,
          // doorPhoto: uploadedUrl,
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
        break;
    }
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
          formData[`${key}DueDate` as keyof typeof formData] || nowIso;
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
        setMessage("✅ Inspection form submitted successfully!");
        Alert.alert("Success", "✅ Inspection form submitted successfully.", [
          { text: "OK", onPress: () => navigation.goBack() },
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
        <View style={styles.card}>
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

          {/* <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            value={basicInfo.date}
            editable={false}
          /> */}
          <Text style={{ marginBottom: 5 }}>Date</Text>

          <TouchableOpacity onPress={() => setShowPicker(true)}>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 5,
                padding: 10,
                height: 45,
                backgroundColor: "#fff",
              }}
              value={formatDate(date)}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>

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
            style={styles.input}
            value={basicInfo.floor}
            onChangeText={(text) =>
              setBasicInfo((prev) => ({ ...prev, floor: text }))
            }
          />

          <Text style={styles.label}>Upload Floor Plan*</Text>
          <Capture
            onImagesChange={(images) => handleImagesChange(images, "Floor")}
            reset={resetCaptureFlag}
            onImageDelete={(index) => handleDeleteImages(index, "Floor")}
            fieldValue="floorFile"
            singleImageCapture={true}
            isView={false} // ✅ This enables remove button
            savedImages={basicInfo.floorPlan} // ✅ Must be correctly updated
            mandatoryFieldRef={mandatoryFieldRef}
            allowGallery={true}
          />

          {/* <TouchableOpacity
            style={styles.button}
            onPress={() => pickImage("floorPlan")}
          >
            <Text>Choose File</Text>
            <Text style={styles.cameraIcon}>📷</Text>
          </TouchableOpacity>
          {basicInfo.floorPlan.map((imgUri, index) => (
            <Image
              key={index}
              source={{ uri: imgUri }}
              style={styles.preview}
            />
          ))} */}

          <Text style={styles.label}>Door Number</Text>
          <TextInput
            style={styles.input}
            value={formData.doorNumber}
            editable={false}
          />

          <Text style={styles.label}>Door Type*</Text>
          <View style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 6,
              backgroundColor: "#e9f1fb",
              overflow: "hidden",
              height: Platform.OS === "ios" ? 200 : 48, // ✅ iOS fix: give enough height
              justifyContent: "center",
              marginTop: 8,
            }}>
            <Picker
              selectedValue={formData.doorType}
              onValueChange={(value) => handleFormDataChange("doorType", value)}
              // enabled={!isView} // Disable in view mode
              dropdownIconColor="#034694"
              style={{
                width: "100%",
                backgroundColor: "#e9f1fb",
                color: "#034694",
                fontSize: 16,
              }}
              itemStyle={{
                fontSize: 16,
                color: "#034694", // Color of items when opened (mostly affects iOS)
              }}
              mode="dropdown" // or "dialog" on Android
            >
              <Picker.Item label="Select" value="" />
              {doorOptions.map((opt) => (
                <Picker.Item
                  key={opt.doorTypeId}
                  label={opt.doorTypeName}
                  value={opt.doorTypeId}
                />
              ))}
            </Picker>
          </View>

          {/* <View
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 6,
              backgroundColor: "#e9f1fb",
              overflow: "hidden",
              height: Platform.OS === "ios" ? 200 : 48, // ✅ iOS fix: give enough height
              justifyContent: "center",
              marginTop: 8,
            }}
          >
            <Picker
              selectedValue={formData.doorType}
              onValueChange={(value) => handleFormDataChange("doorType", value)}
              // enabled={!isView} // Disable in view mode
              dropdownIconColor="#034694"
              style={{
                width: "100%",
                backgroundColor: "#e9f1fb",
                color: "#034694",
                fontSize: 16,
              }}
              itemStyle={{
                fontSize: 16,
                color: "#034694", // Color of items when opened (mostly affects iOS)
              }}
              mode="dropdown" // or "dialog" on Android
            >
              <Picker.Item label="Select" value="" color="#999" />
              {doorOptions.map((type) => (
                <Picker.Item
                  key={type.doorTypeId}
                  label={type.doorTypeName}
                  value={String(type.doorTypeId)}
                  color="#034694"
                />
              ))}
            </Picker>
          </View> */}

          {doorOtherFlag && (
            <>
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

          {/* <TouchableOpacity
            style={styles.button}
            onPress={() => pickImage("doorPhoto")}
          >
            <Text>Choose File</Text>
            <Text style={styles.cameraIcon}>📷</Text>
          </TouchableOpacity>
          {formData.doorPhoto && (
            <Image
              source={{ uri: formData.doorPhoto }}
              style={styles.preview}
            />
          )} */}
        </View>

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

        <Text style={styles.label}>Fire Rating and Certification*</Text>
        <View
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 6,
              backgroundColor: "#e9f1fb",
              overflow: "hidden",
              height: Platform.OS === "ios" ? 200 : 48, // ✅ iOS fix: give enough height
              justifyContent: "center",
              marginTop: 8,
            }}
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
        {/* Physical Measurements Section */}

        <Text style={styles.label}>Fire Rating and Certification*</Text>

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
                style={styles.input}
                keyboardType="numeric"
                value={formData[key as FormDataKey]?.toString() ?? ""}
                onChangeText={(val) => {
                  const filteredVal = val.replace(/[-eE]/g, "");
                  handleGapsChange(key, filteredVal);
                }}
                placeholder={label}
                ref={(ref) => {
                  if (ref) mandatoryFieldRef.current[key] = ref;
                }}
              />

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
                    savedImages={[]}
                  />

                  {/* Show Due Date if Severity is selected */}
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
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 6,
              backgroundColor: "#e9f1fb",
              overflow: "hidden",
              height: Platform.OS === "ios" ? 200 : 48, // ✅ iOS fix: give enough height
              justifyContent: "center",
              marginTop: 8,
            }}
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
                </View>
              </View>
            )}
          </View>
        ))}

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
            const complianceItems: {
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
              { key: "fireLockedSign", label: "Fire door Keep Locked sign?" },
              { key: "fireShutSign", label: "Fire door Keep Shut sign?" },
              { key: "holdOpenDevice", label: "Is there a hold open device?" },
              {
                key: "visibleCertification",
                label: "Is certification visible on fire door?",
              },
              { key: "doorGlazing", label: "Does the door contain glazing?" },
              {
                key: "pyroGlazing",
                label: "Is glazing pyro glazing?",
                show: isGlazing,
              },
            ];
            return complianceItems
              .filter((item) => item.show === undefined || item.show)
              .map(({ key, label }) => (
                <View key={key} style={styles.complianceRow}>
                  <Text style={styles.label}>{label}</Text>
                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>N</Text>
                    <Switch
                      value={!!complianceCheck[key]}
                      onValueChange={(val) => handleComplianceToggle(key, val)}
                    />
                    <Text style={styles.switchLabel}>Y</Text>
                  </View>
                </View>
              ));
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

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: "#ffffff", // white background
            marginTop: 30,
            marginBottom: 20,
            paddingVertical: 14,
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
            borderWidth: 1, // black border
            borderColor: "#000000",
          },
        ]}
        onPress={handleSubmit}
      >
        <Text style={{ color: "#000000", fontSize: 16, fontWeight: "600" }}>
          {submitting ? "Submitting..." : "Submit"}
        </Text>
      </TouchableOpacity>

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
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 6,
  },
  switchLabel: {
    fontSize: 20,
  },
  complianceRow: {
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
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
