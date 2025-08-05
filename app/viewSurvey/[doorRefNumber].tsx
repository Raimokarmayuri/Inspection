import { useLocalSearchParams, usePathname } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
} from "../../components/api/apiPath";
import http from "../../components/api/server";
import { Statuses, UserRoles } from "../../components/common/constants";
import FormComponent from "../../components/common/FormComponent";
import { RootState } from "../../components/slices/store";
import {
  ActionImages,
  ActionMenuFlag,
  ComplianceCheck,
  FormData,
} from "../../components/types";

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
  const userObj = useSelector((state: RootState) => state.user.userObj);
  // const { userObj } = useSelector((state: any) => state.user);

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

  const [doorTypesOption, setDoorTypesOption] = useState<any[]>([]);
  const [isView, setIsView] = useState(false);
  const [isColdSeals, setIsColdSeals] = useState(false);
  const [isGlazing, setIsGlazing] = useState(false);
  const [fireKeepLocked, setFireKeepLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mandatoryFieldRef = useRef<Record<string, TextInput | null>>({});

  const doorRefNumber =
    typeof params.doorRefNumber === "string"
      ? params.doorRefNumber
      : Array.isArray(params.doorRefNumber)
      ? params.doorRefNumber[0]
      : "";

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
        console.log("✅ Door API Data:", res?.data);

        const propertyRes = await http.get(
          GET_PROPERTY_INFO_WITH_MASTER + data.propertyInfo.propertyMasterId
        );
        const property = propertyRes?.data;
        console.log("Propertydata", propertyRes);
        const userId = userObj?.userId;
        if (!userId) throw new Error("Missing user ID");

        const clientRes = await http.get(GET_CLINET_ID_API + "/" + userId);

        const role = clientRes?.data?.roleId;
        const status = property?.inspectionPropertyInfo?.status;
        console.log("data", clientRes);
        console.log("📸 Render - formData.doorPhoto:", formData.doorPhoto);

        if (role === UserRoles.APPROVER || role === UserRoles.ADMIN) {
          setIsView(
            pathname.includes("viewSurvey") ||
              [
                Statuses.COMPLETED,
                Statuses.INPROGRESS,
                Statuses.REJECTED,
              ].includes(status)
          );
        } else if (role === UserRoles.INSPECTOR) {
          setIsView(
            pathname.includes("viewSurvey") || status === Statuses.COMPLETED
          );
        } else {
          setIsView(true);
        }

        // ✅ FormData setup
        const fd: FormData = {
          doorNumber: data.inspectedDoorDto.doorNumber,
          doorType: data.inspectedDoorDto.doorTypeId,
          doorTypeName: data.inspectedDoorDto.doorTypeName,
          doorOther: data.inspectedDoorDto.otherDoorTypeName,
          doorLocation: data.inspectedDoorDto.doorLocation,
          fireResistance: data.physicalMeasurement.fireRatingID,
          hingeLocation: data.physicalMeasurement.hingePosition,
          // doorPhoto: [data.inspectedDoorDto.doorPhoto?.["Image 1 Path"]],
          doorPhoto: Object.values(
            data.inspectedDoorDto.doorPhoto || ({} as Record<string, string>)
          ).filter((url): url is string => !!url),

          doorThickness: data.physicalMeasurement.doorThickness?.value,
          frameDepth: data.physicalMeasurement.frameDepth?.value,
          doorSize: data.physicalMeasurement.doorSize?.value,
          fullDoorsetSize: data.physicalMeasurement.fullDoorsetSize?.value,
          head: data.physicalMeasurement.head?.value,
          hinge: data.physicalMeasurement.hinge?.value,
          closing: data.physicalMeasurement.closing?.value,
          threshold: data.physicalMeasurement.threshold?.value,
          // ✅ add this to fix the error
          comments: data.physicalMeasurement?.comments ?? "",
        };

        setFormData(fd);

        setBasicFormData({
          buildingName: property.propertyMaster.propertyName,
          uniqueRef: property.propertyMaster.uniqueRefNo,
          location: property.propertyMaster.propertyLocation,
          date: formatDateString(data.inspectedDoorDto.doorInspectionDate),
          floor: data.inspectedPropertyFloorsInfo.floorNo,
          floorPlan: [data.inspectedPropertyFloorsInfo.floorPlanImage],
          // additionalPhotos: [data.inspectedPropertyFloorsInfo.additionalPhotos],
          additionalPhotos:
            data.additionalInfos?.flatMap(
              (info: any) => info.imagePath || []
            ) || [],
        });

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
        // setAdditionalPhotos([data.inspectedPropertyFloorsInfo.additionalPhotos]);
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
          actionmenuFlag={defaultActionMenuFlag}
          actionImages={actionImages}
          doorPhoto={formData.doorPhoto}
          floorPlanImages={floorPlanImages}
          // additionalPhotos={additionalPhotos}
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
          handleChange={() => {}}
          handleFormDataChange={() => {}}
          handleGapsChange={() => {}}
          handleComplianceToggle={() => {}}
          handleImagesChange={handleImagesChange}
          handleImagesChangeMini={() => {}}
          handleDeleteImages={() => {}}
          handleResetAction={() => {}}
          handleActionFieldsChange={() => {}}
          handleFireResistanceChange={() => {}}
          generateQRCode={() => {}}
          setShowScanQRCode={() => {}}
          handleCancel={() => {}}
          handleValidationOnSave={() => {}}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ViewSurvey;
