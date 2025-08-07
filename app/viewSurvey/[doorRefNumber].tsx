import { useLocalSearchParams, useNavigation, usePathname } from "expo-router";
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
  const pathname = usePathname();
  const navigation = useNavigation();

  // const { propertyId } = useLocalSearchParams<{ propertyId: string }>();

  // const params = useLocalSearchParams();
  const mode = params.mode?.toString();
  const userObj = useSelector((state: RootState) => state.user.userObj);
  // const { userObj } = useSelector((state: any) => state.user);
  const [basicInfo, setBasicInfo] = useState<any>({});
  // const [propertyMasterId, setPropertyMasterId] = useState<number>(0);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [actionmenuFlag, setActionmenuFlag] = useState<any>({});
  const [propertyId, setPropertyId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({} as FormData);
  const [complianceCheck, setComplianceCheck] = useState<ComplianceCheck>(
    {} as ComplianceCheck
  );
  const [actionImages, setActionImages] = useState<ActionImages>(
    {} as ActionImages
  );
  const [basicFormData, setBasicFormData] = useState<any>({});
  const [actionMenuFlag, setActionMenuFlag] = useState<any>({});
  const [floorPlanImages, setFloorPlanImages] = useState<string[]>([]);
  // const [additionalPhotos, setAdditionalPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [doorTypesOption, setDoorTypesOption] = useState<any[]>([]);
  const [isView, setIsView] = useState(false);
  const [isColdSeals, setIsColdSeals] = useState(false);
  const [isGlazing, setIsGlazing] = useState(false);
  const [fireKeepLocked, setFireKeepLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mandatoryFieldRef = useRef<Record<string, TextInput | null>>({});

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

  // Handle input field changes (physical, door info, etc.)
  const handleFormDataChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle switches
  const handleComplianceToggle = (field: keyof ComplianceCheck) => {
    setComplianceCheck((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (status: string = "Compliance") => {
    try {
      const phyGaps = ["head", "hinge", "closing", "threshold"];
      let newObj: any = {
        fireRatingID: formData.fireResistance ?? "",
        comments: basicFormData.comment || "No comments",
        hingePosition: formData.hingeLocation,
      };

      phyGaps.forEach((elem) => {
        newObj[elem] = {
          value: Number(formData[elem]),
          actionItem: actionmenuFlag[elem] ? "yes" : "no",
          timeline: "Short term",
          severity: actionmenuFlag[elem]
            ? formData[elem + "Severity"] ?? ""
            : "",
          comment: actionmenuFlag[elem]
            ? formData[elem + "Comments"] ?? ""
            : "",
          category: actionmenuFlag[elem]
            ? formData[elem + "Category"] ?? ""
            : "",
          dueDate: actionmenuFlag[elem]
            ? formData[elem + "DueDate"] ?? null
            : null,
          remediation: actionmenuFlag[elem]
            ? formData[elem + "Remediation"] ?? ""
            : "",
          photos: actionmenuFlag[elem] ? actionImages[elem] : [],
        };
      });

      const phyMeasures = [
        "doorThickness",
        "frameDepth",
        "doorSize",
        "fullDoorsetSize",
      ];
      phyMeasures.forEach((elem) => {
        newObj[elem] = {
          value: Number(formData[elem]),
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

      const compArr = [
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
      const newArr = compArr.map((item) => {
        const isSpecialCase = item === "fireLockedSign" && !fireKeepLocked;
        const isCompliant = complianceCheck[item];
        const actionRequired = !isSpecialCase && !isCompliant;

        return {
          complianceCheckMasterID: complianceCheck[item + "Id"] ?? "",
          isCompliant,
          actionItem: actionRequired
            ? {
                timeline: "Short term",
                severity: complianceCheck[item + "Severity"] ?? "",
                comment: complianceCheck[item + "Comments"] ?? "",
                category: complianceCheck[item + "Category"] ?? "",
                dueDate: complianceCheck[item + "DueDate"] ?? null,
                remediation: complianceCheck[item + "Remediation"] ?? "",
                photos: actionImages[item],
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

      const doorImgObj: Record<string, string> = {};
      // formData.doorPhotos.forEach((img: string, index: number) => {
      //   doorImgObj[`Image ${index + 1} Path`] = img;
      // });

      const doorPhotos = formData.doorPhotos || [];
      for (let key = 1; key <= doorPhotos.length; key++) {
        const name = "Image " + key + " Path";
        doorImgObj[name] = doorPhotos[key - 1];
      }

      if (!propertyId || propertyId.toString().length !== 36) {
        Alert.alert(
          "Invalid property ID",
          "Please select a valid property before submitting."
        );
        setIsLoading(false);
        return;
      }

      const fullFormData = {
        propertyInfo: {
          propertyMasterId: propertyId,
          inspectionStartedOn: basicFormData.date,
          inspectedBy: userObj?.userName,
          InspectedById: userObj?.userId, // 🔧 FIXED!
          inspectionApprovedDate: null,
          lastInspectionDate: new Date().toISOString(),
          inspectionApprovedBy: "",
          lastInspectedBy: userObj?.userName,
          status: status,
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
          doorTypeId: formData.doorType ?? "",
          doorRefNumber: formData.doorNumber ?? "",
          doorNumber: formData.doorNumber ?? "",
          inspectedBy: userObj?.userName,
          doorInspectionDate: basicFormData.date,
          status: "Compliant",
          flatName: "Flat A",
          doorTypeName: formData.doorTypeName ?? "",
          propertyName: basicFormData.buildingName ?? "",
          otherDoorTypeName: formData.doorOther,
          doorLocation: formData.doorLocation,
          doorPhoto: doorImgObj,
        },
        complianceChecks: newArr,
        physicalMeasurement: newObj,
        additionalInfos: [
          {
            imagePath: floorPlanImages,
          },
        ],
      };

      const response = await saveData(JSON.stringify(fullFormData));

      if (response.status === 200) {
        setToastData({
          toastShow: true,
          toastType: "success",
          toastString: `✅ Inspection for Door Ref No: ${formData.doorNumber} saved successfully.`,
        });
        setTimeout(() => handleCancel(), 3000);
      } else {
        setIsLoading(false);
        setToastData({
          toastShow: true,
          toastType: "failure",
          toastString: "❌ Failed to save. Please try again.",
        });
      }
    } catch (err) {
      console.error("❌ handleSubmit error:", err);
      setIsLoading(false);
      setToastData({
        toastShow: true,
        toastType: "failure",
        toastString: "Something went wrong during submission.",
      });
    }
  };

  const saveData = async (payload: any) => {
    try {
      const response = await http.post(SAVE_SURVEY_FORM_DATA, payload, {
        headers: {
          "Content-Type": "application/json",
        },
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

  const handleCancel = () => {
    navigation.goBack(); // if using React Navigation
  };

  const handleValidationOnSave = (status: string) => {
    setIsLoading(true);
    let validFlag1 = false;
    let validFlag2 = false;
    let validFlag3 = false;
    let validFlag4 = false;
    let validFlag5 = false;
    let validFlag6 = false;

    for (let key in BASE_MEASURES) {
      if (
        formData[key] === "" ||
        formData[key] === null ||
        formData[key] === undefined
      ) {
        validFlag1 = true;
        break;
      } else if (
        actionMenuFlag[key] === true &&
        (formData[key + "Severity"] === "Select" ||
          formData[key + "Category"] === "Select" ||
          formData[key + "Remediation"] === "" ||
          formData[key + "DueDate"] === "")
      ) {
        validFlag1 = true;
        break;
      } else if (key === "hinge" && formData.hingeLocation === "Select") {
        validFlag1 = true;
        break;
      } else {
        validFlag1 = false;
      }
    }

    let checkArr = { doorType: "doorType", doorPhotos: "doorPhotos" };
    for (let key in checkArr) {
      if (
        key === "doorPhotos" &&
        Array.isArray(formData[key]) &&
        formData[key].length === 0
      ) {
        validFlag2 = true;
        break;
      } else if (key === "doorType") {
        if (
          formData[key] === "4" &&
          (formData.doorOther === "" ||
            formData.doorOther === null ||
            formData.doorOther === undefined)
        ) {
          validFlag2 = true;
          break;
        } else if (formData[key] === "Select") {
          validFlag2 = true;
          break;
        }
      } else {
        validFlag2 = false;
      }
    }

    for (let key in BASE_MEASURES_COMP) {
      if (key === "pyroGlazing" && complianceCheck.doorGlazing === true) {
        if (
          actionMenuFlag[key] === true &&
          (complianceCheck[key + "Severity"] === "Select" ||
            complianceCheck[key + "Category"] === "Select" ||
            complianceCheck[key + "Remediation"] === "" ||
            complianceCheck[key + "DueDate"] === "")
        ) {
          validFlag3 = true;
          break;
        } else {
          validFlag3 = false;
        }
      } else if (key === "coldSmokeSeals") {
        if (isColdSeals) {
          if (
            actionMenuFlag[key] === true &&
            (complianceCheck[key + "Severity"] === "Select" ||
              complianceCheck[key + "Category"] === "Select" ||
              complianceCheck[key + "Remediation"] === "" ||
              complianceCheck[key + "DueDate"] === "")
          ) {
            validFlag3 = true;
            break;
          } else {
            validFlag3 = false;
          }
        }
      } else if (key === "fireLockedSign") {
        if (fireKeepLocked) {
          if (
            actionMenuFlag[key] === true &&
            (complianceCheck[key + "Severity"] === "Select" ||
              complianceCheck[key + "Category"] === "Select" ||
              complianceCheck[key + "Remediation"] === "" ||
              complianceCheck[key + "DueDate"] === "")
          ) {
            validFlag3 = true;
            break;
          } else {
            validFlag3 = false;
          }
        }
      } else {
        if (
          actionMenuFlag[key] === true &&
          (complianceCheck[key + "Severity"] === "Select" ||
            complianceCheck[key + "Category"] === "Select" ||
            complianceCheck[key + "Remediation"] === "" ||
            complianceCheck[key + "DueDate"] === "")
        ) {
          validFlag3 = true;
          break;
        } else {
          validFlag3 = false;
        }
      }
    }

    const phyFields = [
      "doorThickness",
      "frameDepth",
      "doorSize",
      "fullDoorsetSize",
    ];
    for (let key of phyFields) {
      if (
        formData[key] === "" ||
        formData[key] === null ||
        formData[key] === undefined
      ) {
        validFlag4 = true;
        break;
      } else {
        validFlag4 = false;
      }
    }

    if (
      basicFormData.floorPlan.length === 0 ||
      basicFormData.floor === undefined ||
      basicFormData.floor === null ||
      basicFormData.floor === ""
    ) {
      validFlag5 = true;
    } else {
      validFlag5 = false;
    }

    if (
      formData.doorLocation === "" ||
      formData.doorLocation === undefined ||
      formData.doorLocation === null
    ) {
      validFlag6 = true;
    } else {
      validFlag6 = false;
    }

    if (
      validFlag1 ||
      validFlag2 ||
      validFlag3 ||
      validFlag4 ||
      validFlag5 ||
      validFlag6
    ) {
      setValidationFlag(true);
      handleMandatoryFields(); // You must define this elsewhere
      setIsLoading(false);
    } else {
      setValidationFlag(false);
      handleSubmit("Compliance");
    }
  };

  // Handle floor/door/floorplan values
  const handleChange = (field: string, value: string) => {
    setBasicFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImagesChange = (images: string[], field: string) => {
    if (field === "Floor") {
      setBasicFormData((prev: any) => ({
        ...prev,
        floorPlan: images,
      }));
    } else if (field === "Door") {
      setFormData((prev) => ({
        ...prev,
        doorPhoto: images,
      }));
    } else if (field === "Additional") {
      setBasicFormData((prev: any) => ({
        ...prev,
        additionalPhotos: images,
      }));
    }
  };

  useEffect(() => {
    console.log("Floor Plan Images Updated:", basicFormData.floorPlan);
  }, [basicFormData.floorPlan]);

  useEffect(() => {
    console.log("door Images Updated:", formData.doorPhoto);
  }, [formData.doorPhoto]);

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
        console.log("✅ Door API Data:", data);

        const propertyRes = await http.get(
          GET_PROPERTY_INFO_WITH_MASTER + data.propertyInfo.propertyMasterId
        );
        const property = propertyRes?.data;
        console.log("Propertydata", property);
        // ✅ Set the propertyMasterId from the response into state
        if (data?.propertyInfo?.propertyMasterId) {
          setPropertyId(data.propertyInfo.propertyMasterId);
        }
        //  setPropertyId(propertyRes.data.propertyInfo.propertyMasterId);
        const userId = userObj?.userId;
        if (!userId) throw new Error("Missing user ID");

        const clientRes = await http.get(GET_CLINET_ID_API + "/" + userId);
        const role = clientRes?.data?.roleId;
        const status = property?.inspectionPropertyInfo?.status;

        // ✅ Use mode param from URL to determine view/edit
        setIsView(mode !== "edit");
        console.log("🧭 Mode:", mode, "→ isView:", mode !== "edit");

        // ✅ Set FormData
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

        setFormData(fd);

        // ✅ Set BasicFormData
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

        // ✅ Set Compliance and Action Images
        const cc: ComplianceCheck = {} as ComplianceCheck;
        const ai: ActionImages = {} as ActionImages;
        let fireLockFlag = false;
        let glazingFlag = false;

        Object.entries(COMPLIANCE_CHECK_MASTER).forEach(([idKey, id]) => {
          const key = idKey.replace("Id", "") as ComplianceKey;
          const item = data.complianceChecks.find(
            (x: any) => x.complianceCheckMasterID === id
          );
          if (!item) return;

          cc[key] =
            key === "fireLockedSign"
              ? fireLockFlag || item?.isCompliant
              : item?.isCompliant;
          cc[`${key}Timeline`] = item?.actionItem?.timeline;
          cc[`${key}Severity`] = item?.actionItem?.severity;
          cc[`${key}Comments`] = item?.actionItem?.comment;
          cc[`${key}Remediation`] = item?.actionItem?.remediation;
          cc[`${key}Category`] = item?.actionItem?.category;
          cc[`${key}DueDate`] = item?.actionItem?.dueDate
            ? formatDateString(item.actionItem.dueDate)
            : "";
          cc[`${key}Id`] = id;
          ai[key] = item?.actionItem?.photos;

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
          // actionmenuFlag={defaultActionMenuFlag}
          actionmenuFlag={actionMenuFlag}
          actionImages={actionImages}
          doorPhoto={formData.doorPhoto}
          floorPlanImages={floorPlanImages}
          resetCaptureFlag={false}
          isColdSeals={isColdSeals}
          isGlazing={isGlazing}
          isFireKeepLocked={fireKeepLocked}
          ShowScanQRCode={false}
          doorOtherFlag={formData.doorType === "99"}
          doorTypesOption={doorTypesOption}
          validationFlag={false}
          isLoading={isLoading}
          mandatoryFieldRef={mandatoryFieldRef}
          handleChange={handleChange}
          handleFormDataChange={handleFormDataChange}
          handleGapsChange={() => {}} // use if needed
          handleComplianceToggle={handleComplianceToggle}
          handleImagesChange={handleImagesChange}
          handleImagesChangeMini={() => {}}
          handleDeleteImages={() => {}}
          handleResetAction={() => {}}
          handleActionFieldsChange={() => {}}
          handleFireResistanceChange={() => {}}
          generateQRCode={() => {}}
          setShowScanQRCode={() => {}}
          handleCancel={() => {}}
          // handleValidationOnSave={() => {}}
          handleSubmit={handleSubmit}
          handleValidationOnSave={handleValidationOnSave}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ViewSurvey;
function setValidationFlag(arg0: boolean) {
  throw new Error("Function not implemented.");
}

function handleMandatoryFields() {
  throw new Error("Function not implemented.");
}

// function handleSubmit(status: string) {
//   throw new Error("Function not implemented.");
// }

// function setSubmitting(arg0: boolean) {
//   throw new Error("Function not implemented.");
// }

function setMessage(arg0: string) {
  throw new Error("Function not implemented.");
}
