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
  const handleFormDataChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleComplianceToggle = (field: keyof ComplianceCheck) => {
    setComplianceCheck((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // ----- Handlers: MiniCapture integration -----
  // keep field-first internally
  const handleImagesChangeMini = (
    field: string,
    images: string[],
    file?: string
  ) => {
    setActionImages((prev) => ({ ...prev, [field]: images }));
  };

  const handleDeleteImages = (field: string, index: number) => {
    setActionImages((prev) => {
      const list = [...(prev[field] || [])];
      list.splice(index, 1);
      return { ...prev, [field]: list };
    });
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
  const handleActionFieldsChange = (field: string, type: string, value: string) => {
  setFormData(prev => ({
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
      [`${key}Comments`]: "",
      [`${key}DueDate`]: "",
    }));
  };

  const handleCancel = () => {
    navigation.goBack();
  };

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
      comments: formData.comments || "",
      hingePosition: (formData as any).hingeLocation ?? "",
    };

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
        remediation: active
          ? (formData as any)[`${k}Remediation`] ?? ""
          : "",
        photos: active ? (actionImages[k] ?? []) : [],
      };
    });

    // non-gap physical fields (always no action)
    ([
      "doorThickness",
      "frameDepth",
      "doorSize",
      "fullDoorsetSize",
    ] as const).forEach((key) => {
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
      const isSpecialCase = item === "fireLockedSign" && !fireKeepLocked;
      const isCompliant = (complianceCheck as any)[item];
      const actionRequired = !isSpecialCase && !isCompliant;

      return {
        complianceCheckMasterID: (complianceCheck as any)[`${item}Id`] ?? "",
        isCompliant,
        actionItem: actionRequired
          ? {
              timeline: "Short term",
              severity: (complianceCheck as any)[`${item}Severity`] ?? "",
              comment: (complianceCheck as any)[`${item}Comments`] ?? "",
              category: (complianceCheck as any)[`${item}Category`] ?? "",
              dueDate: (complianceCheck as any)[`${item}DueDate`] ?? null,
              remediation:
                (complianceCheck as any)[`${item}Remediation`] ?? "",
              photos: (actionImages as any)[item] ?? [],
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
      (formData as any).doorPhoto ??
      (formData as any).doorPhotos ??
      [];
    const doorImgObj: Record<string, string> = {};
    doorPhotosArr.forEach((url, i) => {
      doorImgObj[`Image ${i + 1} Path`] = url;
    });

    if (!propertyId || propertyId.toString().length !== 36) {
      Alert.alert("Invalid property ID", "Please select a valid property before submitting.");
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
        toastString: `✅ Inspection for Door Ref No: ${(formData as any).doorNumber} saved successfully.`,
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

  const handleValidationOnSave = (status: string) => {
    // keep your existing logic; call setValidationFlag instead of throwing
    setValidationFlag(false);
    // ... you can port your previous checks here ...
    // for demo, just submit:
    handleSubmit(status);
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
  // edit => editable, anything else => view-only
  setIsView(mode !== "edit");
  console.log("mode:", mode, "isView:", mode !== "edit");
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
        setIsView(mode === "edit" ? false : true);

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
        };

        // 🔧🔧🔧 BEGIN: copy physical action fields into flat formData keys + photos into actionImages
    const pm = data.physicalMeasurement ?? {};
    const physKeys = ["head", "hinge", "closing", "threshold"] as const;

    // collect photos for actionImages from physical measurements
    const physAI: ActionImages = {} as ActionImages;

    physKeys.forEach((k) => {
      const src = pm?.[k] || {};
      // formData expects flat keys like headSeverity, headCategory, etc.
      (fd as any)[`${k}Severity`] = src.severity ?? "";
      (fd as any)[`${k}Category`] = src.category ?? "";
      (fd as any)[`${k}Comments`] = src.comment ?? "";
      (fd as any)[`${k}Remediation`] = src.remediation ?? "";
      (fd as any)[`${k}DueDate`] = src.dueDate ? formatDateString(src.dueDate) : "";
      // saved images for MiniCapture
      physAI[k] = Array.isArray(src.photos) ? src.photos : [];
    });
    // 🔧🔧🔧 END

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
        setActionImages(ai);
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
          handleImagesChangeMini={(images: string[], field: string) =>
            handleImagesChangeMini(field, images)
          }
          handleDeleteImages={(index: number, field: string) =>
            handleDeleteImages(field, index)
          }
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
