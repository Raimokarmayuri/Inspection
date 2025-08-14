import { Picker } from "@react-native-picker/picker";

import { useNavigation } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Footer from "../common/Footer";
import {
  ActionImages,
  ActionMenuFlag,
  BasicFormData,
  ComplianceCheck,
  FormData as InspectionFormData,
} from "../types";
import Capture from "./Capture";
import MiniCapture from "./MiniCapture";

interface FormProps {
  isView: boolean;
  basicFormData: BasicFormData;
  formData: InspectionFormData;
  doorPhoto: string[];
  complianceCheck: ComplianceCheck;
  actionmenuFlag: ActionMenuFlag;
  actionImages: ActionImages;
  floorPlanImages: string[];
  resetCaptureFlag: boolean;
  isColdSeals: boolean;
  isGlazing: boolean;
  isFireKeepLocked: boolean;
  ShowScanQRCode: boolean;
  doorOtherFlag: boolean;
  doorTypesOption: { doorTypeId: number; doorTypeName: string }[];
  validationFlag: boolean;
  isLoading: boolean;

  // mandatoryFieldRef: React.MutableRefObject<
  //   Record<string, TextInput | Picker | null>
  // >;

  mandatoryFieldRef: React.MutableRefObject<Record<string, TextInput | null>>;

  handleChange: (field: string, value: string) => void;
  handleFormDataChange: (field: string, value: string) => void;
  handleGapsChange: (field: string, value: string) => void;
  handleComplianceToggle: (
    field: keyof ComplianceCheck,
    value: boolean
  ) => void;
  handleImagesChange: (images: string[], field: string) => void;
  handleImagesChangeMini: (images: string[], field: string) => void;
  handleDeleteImages: (index: number, field: string) => void;
  // handleResetAction: (field: string, type: string) => void;
  handleResetAction: (field: string) => void;
  handleComplianceActionFieldsChange: (
    field: string,
    type: string,
    value: string
  ) => void;

  handleActionFieldsChange: (
    field: string,
    type: string,
    value: string
  ) => void;
  handleFireResistanceChange: (value: string) => void;
  generateQRCode: () => void;
  setShowScanQRCode: (show: boolean) => void;
  handleCancel: () => void;
  handleSubmit: (status?: string) => Promise<void>;

  handleValidationOnSave: (status: string) => void;

  errors?: Record<string, string>;
  onClearError?: (field: string) => void;
}

const hingeMap: Record<string, string> = { "1": "Left", "2": "Right" };
const fireRatingMap: Record<string, string> = {
  "1": "FD30",
  "2": "FD60",
  "3": "FD90",
  "4": "FD120",
  "5": "FD30S",
  "6": "FD60S",
  "7": "FD90S",
  "8": "FD120S",
};



const mergeImages = (a?: string[], b?: string[]) =>
  Array.from(new Set([...(a ?? []), ...(b ?? [])]));

const getDoorTypeName = (
  id?: string | number,
  opts?: { doorTypeId: number; doorTypeName: string }[]
) => {
  if (!id || !opts?.length) return "";
  const found = opts.find((o) => String(o.doorTypeId) === String(id));
  return found?.doorTypeName ?? "";
};

const FormComponent: React.FC<FormProps> = ({
  isView,
  basicFormData,
  formData,
  complianceCheck,
  actionmenuFlag,
  actionImages,
  floorPlanImages,
  resetCaptureFlag,
  isColdSeals,
  isGlazing,
  isFireKeepLocked,
  ShowScanQRCode,
  doorOtherFlag,
  doorTypesOption,
  isLoading,
  mandatoryFieldRef,
  handleChange,
  handleFormDataChange,
  handleComplianceToggle,
  handleImagesChange,
  handleImagesChangeMini,
  handleDeleteImages,
  handleResetAction,
  handleComplianceActionFieldsChange,
  handleActionFieldsChange,
  handleFireResistanceChange,
  generateQRCode,
  setShowScanQRCode,
  handleCancel,
  handleSubmit,
  handleValidationOnSave,
}) => {
  const navigation = useNavigation();
  const [submitting, setSubmitting] = useState(false);

  // put right after: const [submitting, setSubmitting] = useState(false);
const [errors, setErrors] = useState<Record<string, string>>({});
const [showMiniErrors, setShowMiniErrors] = useState(false);

const isEmpty = (v: any) =>
  v === undefined || v === null ||
  (typeof v === "string" && v.trim() === "") ||
  (Array.isArray(v) && v.length === 0);

const isUnselected = (v: any) => v === "" || v === "Select";

/** Which physical fields can open MiniCapture */
// const PHYSICAL_KEYS = [
//   "head",
//   "hinge",
//   "closing",
//   "threshold",
//   "doorThickness",
//   "frameDepth",
//   "doorSize",
//   "fullDoorsetSize",
// ] as const;
// Replace your PHYSICAL_KEYS with:
const MINI_PHYSICAL_KEYS = ["head","hinge","closing","threshold"] as const;

// (optional) keep a convenience array of all physical inputs (for validation/inputs)
const ALL_PHYSICAL_INPUTS = [
  "head","hinge","closing","threshold",
  "doorThickness","frameDepth","doorSize","fullDoorsetSize",
] as const;



/** Pretty names for the alert list */
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

/** Return missing fields for a MiniCapture block (Severity/Category/DueDate/Remediation) */
const requiredMiniErrorsForPrefix = (obj: any, prefix: string): string[] => {
  const val = (k: string) => String(obj?.[`${prefix}${k}`] ?? "").trim();
  const sel = (v: string) => v === "" || v === "Select";

  const severity = val("Severity");
  const category = val("Category");
  const dueDate = val("DueDate");
  const remediation = val("Remediation");

  const missing: string[] = [];
  if (sel(severity))  missing.push("Severity");
  if (sel(category))  missing.push("Category");
  if (sel(dueDate))   missing.push("Due Date");
  if (remediation === "") missing.push("Remedial/Action required");
  return missing;
};

/** Build a single list of all missing MiniCapture requirements */
// const collectMiniCaptureMissing = (): string[] => {
//   const lines: string[] = [];

//   // PHYSICAL: if MiniCapture is shown for a field, validate it
//   PHYSICAL_KEYS.forEach((k) => {
//     if (shouldShowMini(k)) {
//       const miss = requiredMiniErrorsForPrefix(formData, k);
//       if (miss.length) lines.push(`${LABELS[k]}: ${miss.join(", ")}`);
//     }
//   });

//   // COMPLIANCE: only those that can show MiniCapture per your rules
//   const COMPLIANCE_KEYS = [
//     "intumescentStrips",
//     "coldSmokeSeals",
//     "fireLockedSign",
//     "fireShutSign",
//     "pyroGlazing",
//   ] as const;

//   COMPLIANCE_KEYS.forEach((k) => {
//     // respect your existing visibility rules
//     const allowed =
//       (k !== "coldSmokeSeals" || isColdSeals) &&
//       (k !== "pyroGlazing"     || complianceCheck.doorGlazing === true);

//     if (showComplianceMini(k as any, allowed)) {
//       const miss = requiredMiniErrorsForPrefix(complianceCheck, k);
//       if (miss.length) lines.push(`${LABELS[k]}: ${miss.join(", ")}`);
//     }
//   });

//   return lines;
// };


  // const isEmpty = (v: any) =>
  //   v === undefined ||
  //   v === null ||
  //   (typeof v === "string" && v.trim() === "") ||
  //   (Array.isArray(v) && v.length === 0);

  // const isUnselected = (v: any) => v === "" || v === "Select";

  /** Validate only for edit (not view). Returns true if valid. */
  const validateRequired = () => {
    if (isView) return true; // nothing to validate in pure view mode

    const e: Record<string, string> = {};

    // Basic
    if (isEmpty(basicFormData.floor)) e.floor = "Floor is required";
    if (isEmpty(basicFormData.floorPlan))
      e.floorPlan = "Floor plan image is required";

    if (isUnselected(formData.doorType)) e.doorType = "Door type is required";

    if (isEmpty(formData.doorPhoto)) e.doorPhoto = "Door photo is required";

    if (isEmpty(formData.doorNumber)) e.doorNumber = "Door number is required";

    if (isUnselected(formData.fireResistance))
      e.fireResistance = "Fire rating is required";

    if (isUnselected(formData.hingeLocation))
      e.hingeLocation = "Hinge location is required";

    // Measurements
    (
      [
        "head",
        "hinge",
        "closing",
        "threshold",
        "doorThickness",
        "frameDepth",
        "doorSize",
        "fullDoorsetSize",
      ] as const
    ).forEach((k) => {
      if (isEmpty((formData as any)[k])) e[k] = `${k} is required`;
    });

    ALL_PHYSICAL_INPUTS.forEach(k => {
  if (isEmpty((formData as any)[k])) e[k] = `${k} is required`;
});

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // --- Compliance helpers (paste inside the component) ---
  // ---- Compliance helpers ----
  // const COMPLIANCE_KEYS = [
  //   "intumescentStrips",
  //   "coldSmokeSeals",
  //   "selfClosingDevice",
  //   "fireLockedSign",
  //   "fireShutSign",
  //   "holdOpenDevice",
  //   "visibleCertification",
  //   "doorGlazing",
  //   "pyroGlazing",
  // ] as const;

// --- Compliance helpers (replace your current block) ---
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

// ✅ Only these 4 show MiniCapture, and only when value === false
const MINI_CAPTURE_KEYS: ComplianceKey[] = [
  "intumescentStrips",
  "fireLockedSign",
  "fireShutSign",
  "pyroGlazing",
];

// Show MiniCapture strictly when the switch is OFF, honoring gates.
const showComplianceMini = (key: ComplianceKey) => {
  // Only our 4 keys are eligible
  if (!MINI_CAPTURE_KEYS.includes(key)) return false;

  // Gating:
  // - pyroGlazing only if glazing is present
  if (key === "pyroGlazing" && complianceCheck.doorGlazing !== true) return false;

  // - fireLockedSign only visible if SCD is OFF or external flag says to show it
  if (
    key === "fireLockedSign" &&
    !(complianceCheck.selfClosingDevice === false || isFireKeepLocked)
  ) return false;

  // Show MiniCapture only when the switch is false
  return complianceCheck[key] === false;
};

// Merge persisted + session images for compliance
const getComplianceImagesFor = (key: ComplianceKey) =>
  mergeImages(
    (complianceCheck as any)?.[`${key}Images`] as string[] | undefined,
    actionImages?.[key] as string[] | undefined
  );



  // merge persisted + session images for compliance in BOTH view & edit
  // const getComplianceImagesFor = (key: ComplianceKey) =>
  //   mergeImages(
  //     (complianceCheck as any)?.[`${key}Images`] as string[] | undefined,
  //     actionImages?.[key] as string[] | undefined
  //   );

  // whether this compliance key already has saved action data
  const hasComplianceActionData = (key: ComplianceKey) => {
    const cc = complianceCheck as any;
    const imgs = getComplianceImagesFor(key) || [];
    return Boolean(
      cc?.[`${key}Timeline`] ||
        cc?.[`${key}Severity`] ||
        cc?.[`${key}Category`] ||
        cc?.[`${key}Remediation`] ||
        cc?.[`${key}Comments`] ||
        cc?.[`${key}DueDate`] ||
        cc?.[`${key}photos`] ||
        imgs.length > 0
    );
  };

//   // show MiniCapture when false (non-compliant) OR when saved data exists
// const showComplianceMini = (key: ComplianceKey) => {
//   // applicability gates
//   if (key === "coldSmokeSeals" && !isColdSeals) return false;
//   if (key === "pyroGlazing" && complianceCheck.doorGlazing !== true) return false;
//   if (
//     key === "fireLockedSign" &&
//     !(complianceCheck.selfClosingDevice === false || isFireKeepLocked)
//   ) return false;

//   // treat undefined as off
//   return complianceCheck[key] !== true;
// };
  // Should we show the MiniCapture panel for compliance?
  // Show when value is FALSE (non-compliant) OR there is saved action data.
  // const shouldShowComplianceMini = (
  //   key: ComplianceKey,
  //   allowedByShow: boolean
  // ) => {
  //   if (!allowedByShow) return false;
  //   if (!complianceMiniEnabled.includes(key)) return false;
  //   return complianceCheck[key] === false || hasComplianceActionData(key);
  // };

  const getImagesForField = (field: string) => {
    // In view mode we can merge; in edit mode, actionImages is the single source of truth
    return isView
      ? mergeImages(
          (formData as any)?.[`${field}Images`] as string[] | undefined,
          actionImages?.[field] as string[] | undefined
        )
      : actionImages?.[field] ?? [];
  };

  const hasActionDataFor = (field: string) => {
    const fd = formData as any;
    const fdImgs = (fd[`${field}Images`] as string[] | undefined) ?? [];
    const actImgs = actionImages?.[field] ?? [];
    return Boolean(
      fd[`${field}Severity`] ||
        fd[`${field}Category`] ||
        fd[`${field}Remediation`] ||
        fd[`${field}Comments`] ||
        fd[`${field}DueDate`] ||
        fdImgs.length > 0 || // ✅ consider images from formData
        actImgs.length > 0 // ✅ and images captured this session
    );
  };

  // const ACTION_THRESHOLD = 3;

  // slightly sturdier number parser
  const getNum = (v: any) => {
    if (v === null || v === undefined) return NaN;
    const n = Number(String(v).trim());
    return Number.isFinite(n) ? n : NaN;
  };

const ACTION_THRESHOLD = 3;

const shouldShowMini = (field: string) => {
  // View mode: show if any action data exists
  if (isView) return hasActionDataFor(field);

  // Edit mode: only for the gap fields AND when value > 3 OR action data exists
  const isGapField = (MINI_PHYSICAL_KEYS as readonly string[]).includes(field);
  if (!isGapField) return false;

  const val = getNum((formData as any)[field]);
  return (
    (Number.isFinite(val) && val > ACTION_THRESHOLD) || hasActionDataFor(field)
  );
};


  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <Text style={styles.label}>Building Name</Text>
          <TextInput
            style={styles.input}
            value={basicFormData.buildingName || ""}
            editable={false}
          />

          <Text style={styles.label}>Unique Reference</Text>
          <TextInput
            style={styles.input}
            value={basicFormData.uniqueRef || ""}
            editable={false}
          />

          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            value={basicFormData.date || ""}
            editable={false}
          />

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={basicFormData.location || ""}
            editable={false}
          />

          <Text style={styles.label}>Floor</Text>
          <TextInput
            style={[styles.input, errors.floor && styles.errorInput]}
            keyboardType="numeric"
            value={String(basicFormData.floor || 0)}
            editable={!isView}
            onChangeText={(text) => handleChange("floor", text)}
          />
          {errors.floor && <Text style={styles.errorText}>{errors.floor}</Text>}

          <View className="d-flex gap-3 flex-wrap" style={styles.imageSection}>
            <Text style={styles.label}>Floor Plan</Text>
            <Capture
              isView={isView}
              savedImages={basicFormData.floorPlan}
              onImagesChange={(images) => handleImagesChange(images, "Floor")}
              reset={resetCaptureFlag}
              onImageDelete={(index) => handleDeleteImages(index, "Floor")}
              mandatoryFieldRef={mandatoryFieldRef}
              fieldValue={"floorFile"}
              singleImageCapture
            />
            {errors.floorPlan && (
              <Text style={styles.errorText}>{errors.floorPlan}</Text>
            )}
          </View>

          <Text style={styles.label}>Door Number</Text>
          <TextInput
            style={styles.input}
            value={formData.doorNumber || ""}
            editable={false}
          />
          {errors.doorNumber && (
            <Text style={styles.errorText}>{errors.doorNumber}</Text>
          )}

          <Text style={styles.label}>Door Type</Text>
          {isView ? (
            <Text style={styles.readOnlyValue}>
              {getDoorTypeName(formData?.doorType, doorTypesOption) || "—"}
            </Text>
          ) : (
            <View
              style={[styles.pickerWrap, errors.doorType && styles.errorInput]}
            >
              <Picker
                key={`doorType-${isView ? "view" : "edit"}`}
                selectedValue={String(formData?.doorType ?? "")}
                onValueChange={(value) =>
                  handleFormDataChange("doorType", value)
                }
                dropdownIconColor="#034694"
                style={styles.picker}
              >
                <Picker.Item label="Select" value="" color="#999" />
                {doorTypesOption.map((type) => (
                  <Picker.Item
                    key={type.doorTypeId}
                    label={type.doorTypeName}
                    value={String(type.doorTypeId)}
                    color="#034694"
                  />
                ))}
              </Picker>
            </View>
          )}
          {errors.doorType && (
            <Text style={styles.errorText}>{errors.doorType}</Text>
          )}

          {doorOtherFlag && (
            <>
              <Text style={styles.label}>Other Door Type</Text>
              <TextInput
                style={styles.input}
                value={formData.doorOther || ""}
                editable={!isView}
                onChangeText={(text) => handleFormDataChange("doorOther", text)}
              />
            </>
          )}

          <View className="d-flex gap-3 flex-wrap" style={styles.imageSection}>
            <Text style={styles.label}>Door Photo</Text>
            <Capture
              isView={isView}
              savedImages={formData.doorPhoto}
              onImagesChange={(images) => handleImagesChange(images, "Door")}
              reset={resetCaptureFlag}
              onImageDelete={(index) => handleDeleteImages(index, "Door")}
              mandatoryFieldRef={mandatoryFieldRef}
              fieldValue={"doorFile"}
              singleImageCapture
            />
            {errors.doorPhoto && (
              <Text style={styles.errorText}>{errors.doorPhoto}</Text>
            )}
          </View>
          {/* 🔥 Fire Rating and Certification */}
          <Text style={styles.label}>Fire Rating and Certification*</Text>
          {isView ? (
            <Text style={styles.readOnlyValue}>
              {fireRatingMap[String(formData?.fireResistance ?? "")] || "—"}
            </Text>
          ) : (
            <View
              style={[
                styles.pickerWrap,
                errors.fireResistance && styles.errorInput,
              ]}
            >
              <Picker
                key={`fire-${isView ? "view" : "edit"}`}
                selectedValue={String(formData?.fireResistance ?? "")}
                onValueChange={(value) =>
                  handleFormDataChange("fireResistance", value)
                }
                dropdownIconColor="#034694"
                style={styles.picker}
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
          )}
          {errors.fireResistance && (
            <Text style={styles.errorText}>{errors.fireResistance}</Text>
          )}

          <Text style={styles.sectionTitle}>Physical Measurements</Text>

          {/* 🧱 Head(mm) Field with MiniCapture */}
          {/* Head(mm) */}
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.label}>
              Head(mm)<Text style={{ color: "red" }}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              editable={!isView}
              placeholder="Head(mm)"
              value={String(formData.head ?? "")}
              onChangeText={(value) => handleFormDataChange("head", value)}
              ref={(el) => {
                if (mandatoryFieldRef?.current)
                  mandatoryFieldRef.current.head = el;
              }}
            />
            {errors.head && <Text style={styles.errorText}>{errors.head}</Text>}
          </View>

          {/* ✅ ALWAYS show MiniCapture */}

          {shouldShowMini("head") && (
            <MiniCapture
              key={`mc-${isView ? "view" : "edit"}-head`}
              isView={isView}
              fieldValue="head"
              formData={formData}
              savedImages={getImagesForField("head")}
              onImagesChange={(images) =>
                handleImagesChangeMini(images, "head")
              }
              onResetChange={() => handleResetAction("head")}
              onHandleActionFieldsChange={(val, type) =>
                handleActionFieldsChange("head", type, val)
              }
              onImageDelete={(index) => handleDeleteImages(index, "head")}
              reset={resetCaptureFlag}
              mandatoryFieldRef={mandatoryFieldRef}
               showErrors={showMiniErrors} 
            />
          )}

          {/* {actionmenuFlag.head && (
            <MiniCapture
              isView={isView}
              fieldValue="head"
              formData={formData}
              onImagesChange={(images) =>
                handleImagesChangeMini(images, "head")
              }
              onResetChange={() => handleResetAction("head", "PHYSICAL")}
              onHandleActionFieldsChange={(e, field) =>
                handleActionFieldsChange(e, field, "PHYSICAL")
              }
              onImageDelete={(index) => handleDeleteImages(index, "head")}
              reset={resetCaptureFlag}
              mandatoryFieldRef={mandatoryFieldRef}
              savedImages={[]} // replace with actual saved images if available
            />
          )} */}

          {/* Hinge Location */}
          <Text style={styles.label}>Hinge Location</Text>
          {isView ? (
            <Text style={styles.readOnlyValue}>
              {hingeMap[String(formData?.hingeLocation ?? "")] || "—"}
            </Text>
          ) : (
            <View
              style={[
                styles.pickerWrap,
                errors.hingeLocation && styles.errorInput,
              ]}
            >
              <Picker
                key={`hinge-${isView ? "view" : "edit"}`}
                selectedValue={String(formData?.hingeLocation ?? "")}
                onValueChange={(value) =>
                  handleFormDataChange("hingeLocation", value)
                }
                dropdownIconColor="#034694"
                style={styles.picker}
              >
                <Picker.Item label="Select" value="" color="#999" />
                <Picker.Item label="Left" value="1" color="#034694" />
                <Picker.Item label="Right" value="2" color="#034694" />
              </Picker>
            </View>
          )}
          {errors.hingeLocation && (
            <Text style={styles.errorText}>{errors.hingeLocation}</Text>
          )}

          {/* Render the 4 MINI capture fields with MiniCapture */}
{(["head","hinge","closing","threshold"] as const).map((field) => (
  <View key={field}>
    <Text style={styles.label}>
      {field.charAt(0).toUpperCase() + field.slice(1)} (mm)
    </Text>
    <TextInput
      style={[styles.input, errors[field] && styles.errorInput]}
      keyboardType="numeric"
      value={String((formData as any)[field] ?? "")}
      editable={!isView}
      onChangeText={(text) => handleFormDataChange(field, text)}
    />
    {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}

    {shouldShowMini(field) && (
      <MiniCapture
        key={`mc-${isView ? "view" : "edit"}-${field}`}
        isView={isView}
        fieldValue={field}
        formData={formData}
        savedImages={getImagesForField(field)}
        onImagesChange={(images) => handleImagesChangeMini(images, field)}
        onResetChange={() => handleResetAction(field)}
        onHandleActionFieldsChange={(val, type) =>
          handleActionFieldsChange(field, type, val)
        }
        onImageDelete={(index) => handleDeleteImages(index, field)}
        reset={resetCaptureFlag}
        mandatoryFieldRef={mandatoryFieldRef}
        showErrors={showMiniErrors}
      />
    )}
  </View>
))}

{/* Render the non-gap physical inputs WITHOUT MiniCapture */}
{(["doorThickness","frameDepth","doorSize","fullDoorsetSize"] as const).map((field) => (
  <View key={field}>
    <Text style={styles.label}>
      {field.charAt(0).toUpperCase() + field.slice(1)} (mm)
    </Text>
    <TextInput
      style={[styles.input, errors[field] && styles.errorInput]}
      keyboardType="numeric"
      value={String((formData as any)[field] ?? "")}
      editable={!isView}
      onChangeText={(text) => handleFormDataChange(field, text)}
    />
    {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
  </View>
))}



          {/* === Compliance Check (editable + MiniCapture rules) === */}
          <Text style={styles.sectionTitle}>Compliance Check</Text>

          {/* Intumescent Strips */}
          <View style={styles.complianceItem}>
            <Text style={styles.label}>Intumescent Strips</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.toggleText}>N</Text>
              <Switch
                value={!!complianceCheck.intumescentStrips}
                onValueChange={(val) =>
                  handleComplianceToggle("intumescentStrips", val)
                }
                disabled={isView}
              />
              <Text style={styles.toggleText}>Y</Text>
            </View>
          </View>
          {showComplianceMini("intumescentStrips") && (
            <MiniCapture
              key={`cc-mc-${isView ? "view" : "edit"}-intumescentStrips`}
              isView={isView}
              fieldValue="intumescentStrips"
              formData={complianceCheck}
              savedImages={getComplianceImagesFor("intumescentStrips")}
              onImagesChange={(images) =>
                handleImagesChangeMini(images, "intumescentStrips")
              }
              onImageDelete={(index) =>
                handleDeleteImages(index, "intumescentStrips")
              }
              // onResetChange={() =>
              //   handleResetAction("intumescentStrips", "COMPLIANCE")
              // }
              onResetChange={() => handleResetAction("intumescentStrips")}
              onHandleActionFieldsChange={(val, type) =>
                handleComplianceActionFieldsChange(
                  "intumescentStrips",
                  type,
                  val
                )
              }
              reset={resetCaptureFlag}
              mandatoryFieldRef={mandatoryFieldRef}
            />
          )}

          {/* Cold Smoke Seals (only for FDxS) */}
          {isColdSeals && (
            <>
              <View style={styles.complianceItem}>
                <Text style={styles.label}>Cold Smoke Seals</Text>
                <View style={styles.switchContainer}>
                  <Text style={styles.toggleText}>N</Text>
                  <Switch
                    value={!!complianceCheck.coldSmokeSeals}
                    onValueChange={(val) =>
                      handleComplianceToggle("coldSmokeSeals", val)
                    }
                    disabled={isView}
                  />
                  <Text style={styles.toggleText}>Y</Text>
                </View>
              </View>
              {isColdSeals && showComplianceMini("coldSmokeSeals") && (
                <MiniCapture
                  key={`cc-mc-${isView ? "view" : "edit"}-coldSmokeSeals`}
                  isView={isView}
                  fieldValue="coldSmokeSeals"
                  formData={complianceCheck}
                  savedImages={getComplianceImagesFor("coldSmokeSeals")}
                  onImagesChange={(images) =>
                    handleImagesChangeMini(images, "coldSmokeSeals")
                  }
                  onImageDelete={(index) =>
                    handleDeleteImages(index, "coldSmokeSeals")
                  }
                  onResetChange={() => handleResetAction("coldSmokeSeals")}
                  onHandleActionFieldsChange={(val, type) =>
                    handleComplianceActionFieldsChange(
                      "coldSmokeSeals",
                      type,
                      val
                    )
                  }
                  reset={resetCaptureFlag}
                  mandatoryFieldRef={mandatoryFieldRef}
                />
              )}
            </>
          )}

          {/* Self Closing Device (OFF -> force Keep Locked = ON) */}
          <View style={styles.complianceItem}>
            <Text style={styles.label}>Self Closing Device</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.toggleText}>N</Text>
              <Switch
                value={!!complianceCheck.selfClosingDevice}
                onValueChange={(val) => {
                  // if (val === false && !complianceCheck.fireLockedSign) {
                  //   handleComplianceToggle("fireLockedSign", true);
                  // }
                  // handleComplianceToggle("selfClosingDevice", val);

                  handleComplianceToggle("selfClosingDevice", val);
                }}
                disabled={isView}
              />
              <Text style={styles.toggleText}>Y</Text>
            </View>
          </View>

          {/* Fire door Keep Locked sign (visible if SCD is OFF or external flag) */}
          {(complianceCheck.selfClosingDevice === false ||
            isFireKeepLocked) && (
            <>
              <View style={styles.complianceItem}>
                <Text style={styles.label}>Fire door Keep Locked sign</Text>
                <View style={styles.switchContainer}>
                  <Text style={styles.toggleText}>N</Text>
                  <Switch
                    value={!!complianceCheck.fireLockedSign}
                    onValueChange={(val) =>
                      handleComplianceToggle("fireLockedSign", val)
                    }
                    disabled={isView}
                  />
                  <Text style={styles.toggleText}>Y</Text>
                </View>
              </View>
              {showComplianceMini("fireLockedSign") && (
                <MiniCapture
                  key={`cc-mc-${isView ? "view" : "edit"}-fireLockedSign`}
                  isView={isView}
                  fieldValue="fireLockedSign"
                  formData={complianceCheck}
                  savedImages={getComplianceImagesFor("fireLockedSign")}
                  onImagesChange={(images) =>
                    handleImagesChangeMini(images, "fireLockedSign")
                  }
                  onImageDelete={(index) =>
                    handleDeleteImages(index, "fireLockedSign")
                  }
                  onResetChange={() => handleResetAction("fireLockedSign")}
                  onHandleActionFieldsChange={(val, type) =>
                    handleComplianceActionFieldsChange(
                      "fireLockedSign",
                      type,
                      val
                    )
                  }
                  reset={resetCaptureFlag}
                  mandatoryFieldRef={mandatoryFieldRef}
                />
              )}
            </>
          )}

          {/* Fire door Keep Shut sign */}
          <View style={styles.complianceItem}>
            <Text style={styles.label}>Fire door Keep Shut sign</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.toggleText}>N</Text>
              <Switch
                value={!!complianceCheck.fireShutSign}
                onValueChange={(val) =>
                  handleComplianceToggle("fireShutSign", val)
                }
                disabled={isView}
              />
              <Text style={styles.toggleText}>Y</Text>
            </View>
          </View>
          {showComplianceMini("fireShutSign") && (
            <MiniCapture
              key={`cc-mc-${isView ? "view" : "edit"}-fireShutSign`}
              isView={isView}
              fieldValue="fireShutSign"
              formData={complianceCheck}
              savedImages={getComplianceImagesFor("fireShutSign")}
              onImagesChange={(images) =>
                handleImagesChangeMini(images, "fireShutSign")
              }
              onImageDelete={(index) =>
                handleDeleteImages(index, "fireShutSign")
              }
              onResetChange={() => handleResetAction("fireShutSign")}
              onHandleActionFieldsChange={(val, type) =>
                handleComplianceActionFieldsChange("fireShutSign", type, val)
              }
              reset={resetCaptureFlag}
              mandatoryFieldRef={mandatoryFieldRef}
            />
          )}

          {/* Hold Open Device */}
          <View style={styles.complianceItem}>
            <Text style={styles.label}>Hold open device</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.toggleText}>N</Text>
              <Switch
                value={!!complianceCheck.holdOpenDevice}
                onValueChange={(val) =>
                  handleComplianceToggle("holdOpenDevice", val)
                }
                disabled={isView}
              />
              <Text style={styles.toggleText}>Y</Text>
            </View>
          </View>

          {/* Visible Certification */}
          <View style={styles.complianceItem}>
            <Text style={styles.label}>Visible certification on fire door</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.toggleText}>N</Text>
              <Switch
                value={!!complianceCheck.visibleCertification}
                onValueChange={(val) =>
                  handleComplianceToggle("visibleCertification", val)
                }
                disabled={isView}
              />
              <Text style={styles.toggleText}>Y</Text>
            </View>
          </View>

          {/* Door Glazing (OFF -> hide Pyro Glazing & clear its action data) */}
          <View style={styles.complianceItem}>
            <Text style={styles.label}>Door contains glazing</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.toggleText}>N</Text>
              <Switch
                value={!!complianceCheck.doorGlazing}
                onValueChange={(val) => {
                  if (val === false) {
                    handleComplianceToggle("pyroGlazing", false);
                    handleResetAction("pyroGlazing");
                  }
                  handleComplianceToggle("doorGlazing", val);
                }}
                disabled={isView}
              />
              <Text style={styles.toggleText}>Y</Text>
            </View>
          </View>

          {/* Pyro Glazing (only when glazing is present) */}
          {complianceCheck.doorGlazing === true && (
            <>
              <View style={styles.complianceItem}>
                <Text style={styles.label}>Pyro glazing</Text>
                <View style={styles.switchContainer}>
                  <Text style={styles.toggleText}>N</Text>
                  <Switch
                    value={!!complianceCheck.pyroGlazing}
                    onValueChange={(val) =>
                      handleComplianceToggle("pyroGlazing", val)
                    }
                    disabled={isView}
                  />
                  <Text style={styles.toggleText}>Y</Text>
                </View>
              </View>
              {showComplianceMini("pyroGlazing") && (
                <MiniCapture
                  key={`cc-mc-${isView ? "view" : "edit"}-pyroGlazing`}
                  isView={isView}
                  fieldValue="pyroGlazing"
                  formData={complianceCheck}
                  savedImages={getComplianceImagesFor("pyroGlazing")}
                  onImagesChange={(images) =>
                    handleImagesChangeMini(images, "pyroGlazing")
                  }
                  onImageDelete={(index) =>
                    handleDeleteImages(index, "pyroGlazing")
                  }
                  onResetChange={() => handleResetAction("pyroGlazing")}
                  onHandleActionFieldsChange={(val, type) =>
                    handleComplianceActionFieldsChange("pyroGlazing", type, val)
                  }
                  reset={resetCaptureFlag}
                  mandatoryFieldRef={mandatoryFieldRef}
                />
              )}
            </>
          )}

          <View className="d-flex gap-3 flex-wrap" style={styles.imageSection}>
            <Text style={styles.label}>Additional Photos</Text>
            <Capture
              isView={isView}
              savedImages={basicFormData.additionalPhotos}
              onImagesChange={(images) =>
                handleImagesChange(images, "Additional")
              }
              reset={resetCaptureFlag}
              onImageDelete={(index) => handleDeleteImages(index, "Additional")}
              mandatoryFieldRef={mandatoryFieldRef}
              fieldValue={"additionalPhotos"}
              singleImageCapture={false} // Allow multiple images
            />
          </View>

{/* === Compliance Check (REPLACED) === */}
<Text style={styles.sectionTitle}>Compliance Check</Text>

{(() => {
  // We still render the "Door contains glazing" toggle to gate Pyro Glazing
  const items: { key: ComplianceKey; label: string; show?: boolean }[] = [
    { key: "intumescentStrips", label: "Are there intumescent strips?" },

    // Self Closing Device (no MiniCapture here)
    { key: "selfClosingDevice", label: "Self closing device?" },

    // Fire door Keep Locked sign (only show when SCD is OFF or via external flag)
    {
      key: "fireLockedSign",
      label: "Fire door Keep Locked sign?",
      show: complianceCheck.selfClosingDevice === false || isFireKeepLocked,
    },

    // Fire door Keep Shut sign (always rendered)
    { key: "fireShutSign", label: "Fire door Keep Shut sign?" },

    // (Optional switches you still want to keep without MiniCapture)
    { key: "holdOpenDevice", label: "Is there a hold open device?" },
    {
      key: "visibleCertification",
      label: "Is certification visible on fire door?",
    },

    // Gate for Pyro Glazing
    { key: "doorGlazing", label: "Does the door contain glazing?" },

    {
      key: "pyroGlazing",
      label: "Is glazing pyro glazing?",
      show: complianceCheck.doorGlazing === true,
    },
  ];

  return items
    .filter((i) => i.show === undefined || i.show) // respect visibility gates
    .map(({ key, label }) => {
      const showMini = showComplianceMini(key);

      return (
        <View key={key} style={{ marginBottom: 16 }}>
          <View style={styles.complianceItem}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.toggleText}>N</Text>
              <Switch
                value={!!complianceCheck[key]}
                onValueChange={(val) => {
                  // Special handling for Door Glazing:
                  if (key === "doorGlazing") {
                    if (val === false) {
                      // If glazing turned OFF, also turn OFF Pyro Glazing and clear its actions
                      handleComplianceToggle("pyroGlazing", false);
                      handleResetAction("pyroGlazing");
                    }
                    handleComplianceToggle("doorGlazing", val);
                    return;
                  }

                  handleComplianceToggle(key, val);
                }}
                disabled={isView}
              />
              <Text style={styles.toggleText}>Y</Text>
            </View>
          </View>

          {/* MiniCapture only for the 4 specified keys and only when false */}
          {showMini && (
            <MiniCapture
              key={`cc-mc-${key}-${String(complianceCheck[key] === false)}`}
              isView={isView}
              fieldValue={key}
              formData={complianceCheck}
              savedImages={getComplianceImagesFor(key)}
              onImagesChange={(imgs) => handleImagesChangeMini(imgs, key)}
              onImageDelete={(i) => handleDeleteImages(i, key)}
              onResetChange={() => handleResetAction(key)}
              onHandleActionFieldsChange={(val, type) =>
                handleComplianceActionFieldsChange(key, type, val)
              }
              reset={resetCaptureFlag}
              mandatoryFieldRef={mandatoryFieldRef}
              // if you want to surface missing MiniCapture fields visually:
              // showErrors={showMiniErrors}
            />
          )}
        </View>
      );
    });
})()}



          {/* Additional Comments */}
          <View
            style={{
              marginBottom: 24,
              padding: 16,
              backgroundColor: "#fff",
              borderRadius: 8,
              elevation: 2,
            }}
          >
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{ fontSize: 16, fontWeight: "600", marginBottom: 10 }}
              >
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
                placeholder="Additional comments"
                multiline
                numberOfLines={4}
                editable={!isView}
                value={formData.comments}
                onChangeText={(text) => handleFormDataChange("comments", text)}
              />
            </View>
          </View>
          {!isView && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                padding: 20,
                marginTop: 5,
              }}
            >
              {/* <TouchableOpacity
                style={{
                  backgroundColor: "#ccc",
                  paddingVertical: 12,
                  paddingHorizontal: 25,
                  borderRadius: 8,
                }}
                onPress={() => navigation.goBack()}
              >
                <Text style={{ color: "#000", fontWeight: "bold" }}>Back</Text>
              </TouchableOpacity> */}

              <TouchableOpacity
                style={{
                  backgroundColor: "#034694",
                  paddingVertical: 12,
                  paddingHorizontal: 25,
                  borderRadius: 8,
                }}
                onPress={() => {
                  const ok = validateRequired();
                  if (!ok) {
                    // if you want to let the parent know:
                    handleValidationOnSave?.("Invalid");
                    return;
                  }
                  handleSubmit("Compliant");
                }}
                disabled={submitting}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {submitting ? "Submitting..." : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Add additional compliance fields similarly */}
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[
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
          // onPress={handleSubmit}
        >
          <Text style={{ color: "#000000", fontSize: 16, fontWeight: "600" }}>
            Back
          </Text>
        </TouchableOpacity>
        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    padding: 1,
    paddingBottom: 40,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  errorInput: { borderColor: "red", borderWidth: 1 },
  errorText: { color: "red", marginTop: 4, fontSize: 12 },
  toggleText: {
    fontSize: 16,
    marginHorizontal: 4,
    color: "#333",
  },
  readOnlyValue: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f8f8f8",
    fontSize: 16,
    color: "#333",
  },

  imageSection: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#f0f4f8",
    marginBottom: 16,
    minHeight: 10,
    width: "100%",
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#e9f1fb",
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    backgroundColor: "#e9f1fb",
    color: "#034694",
    fontSize: 16,
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
    fontWeight: "400",
    marginBottom: 6,
    marginTop: 12,
    color: "#333",
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f8f8f8",
    fontSize: 16,
  },
  complianceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
});

export default FormComponent;
