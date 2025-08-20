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
  FormData,
} from "../types";
import Capture from "./Capture";
import MiniCapture from "./MiniCapture";

interface FormProps {
  isView: boolean;
  basicFormData: BasicFormData;
  formData: FormData;
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

  mandatoryFieldRef: React.MutableRefObject<Record<string, TextInput | null>>;

  handleChange: (field: string, value: string) => void;
  handleComplianceActionFieldsChange: (
    field: string,
    type: string,
    value: string
  ) => void;

  handleFormDataChange: (field: string, value: string) => void;
  handleGapsChange: (field: string, value: string) => void;
  handleComplianceToggle: (
    field:
      | "intumescentStrips"
      | "coldSmokeSeals"
      | "selfClosingDevice"
      | "fireLockedSign"
      | "fireShutSign"
      | "holdOpenDevice"
      | "visibleCertification"
      | "doorGlazing"
      | "pyroGlazing",
    nextVal: boolean // 👈 IMPORTANT
  ) => void;
  handleImagesChange: (images: string[], field: string) => void;
  handleImagesChangeMini: (images: string[], field: string) => void;
  handleDeleteImages: (index: number, field: string) => void;
  handleResetAction: (field: string, type: "PHYSICAL" | "COMPLIANCE") => void;
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
  actionmenuFlag, // (not used here, but kept for prop compatibility)
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
  handleActionFieldsChange,
  handleFireResistanceChange,
  generateQRCode,
  setShowScanQRCode,
  handleCancel,
  handleSubmit,
  handleValidationOnSave,
  handleComplianceActionFieldsChange,
}) => {
  const navigation = useNavigation();
  const [submitting, setSubmitting] = useState(false);

  // ---------- PHYSICAL MiniCapture helpers ----------
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
        fdImgs.length > 0 ||
        actImgs.length > 0
    );
  };

  const ACTION_THRESHOLD = 3;
  const getNum = (v: any) => {
    if (v === null || v === undefined) return NaN;
    const n = Number(String(v).trim());
    return Number.isFinite(n) ? n : NaN;
  };

  const shouldShowMini = (field: string) => {
    // In view mode: show if any action data (severity/category/images/comments/etc.) exists
    if (isView) return hasActionDataFor(field);

    // In edit mode: show if value is strictly > 3 OR there is existing action data
    const val = getNum((formData as any)[field]);
    return (
      (Number.isFinite(val) && val > ACTION_THRESHOLD) ||
      hasActionDataFor(field)
    );
  };

  // ---------- COMPLIANCE MiniCapture helpers ----------
  const getComplianceImages = (
    key:
      | "intumescentStrips"
      | "coldSmokeSeals"
      | "selfClosingDevice"
      | "fireLockedSign"
      | "fireShutSign"
      | "holdOpenDevice"
      | "visibleCertification"
      | "doorGlazing"
      | "pyroGlazing"
  ) => {
    return isView
      ? mergeImages(
          (complianceCheck as any)[`${key}Images`] as string[] | undefined,
          actionImages?.[key] as string[] | undefined
        )
      : actionImages?.[key] ?? [];
  };

  const hasComplianceActionData = (
    key:
      | "intumescentStrips"
      | "coldSmokeSeals"
      | "selfClosingDevice"
      | "fireLockedSign"
      | "fireShutSign"
      | "holdOpenDevice"
      | "visibleCertification"
      | "doorGlazing"
      | "pyroGlazing"
  ) => {
    const cc = complianceCheck as any;
  const imgsSaved = (cc[`${key}Images`] as string[] | undefined) ?? [];
  const imgsSession = actionImages?.[key] ?? [];

  const isFilled = (v: any) => {
    if (v == null) return false;
    if (typeof v === "string") {
      const t = v.trim().toLowerCase();
      return t !== "" && t !== "select";
    }
    return true;
  };

  return Boolean(
    isFilled(cc[`${key}Severity`]) ||
    isFilled(cc[`${key}Category`]) ||
    isFilled(cc[`${key}Remediation`]) ||
    isFilled(cc[`${key}Comments`]) ||
    isFilled(cc[`${key}DueDate`]) ||
    imgsSaved.length > 0 ||
    imgsSession.length > 0
  );

  };

  // Edit mode: show whenever toggled NO, or if there’s existing action data
  // View mode: show only if there’s existing action data
  const shouldShowComplianceMini = (
    key:
      | "intumescentStrips"
      | "coldSmokeSeals"
      | "selfClosingDevice"
      | "fireLockedSign"
      | "fireShutSign"
      | "holdOpenDevice"
      | "visibleCertification"
      | "doorGlazing"
      | "pyroGlazing"
  ) => {
    // const value = !!(complianceCheck as any)[key]; // true = YES
    // return isView ? hasComplianceActionData(key) : (!value || hasComplianceActionData(key));
    const value = (complianceCheck as any)[key] === true; // only literal true is YES
    return isView
      ? hasComplianceActionData(key)
      : !value || hasComplianceActionData(key);
  };

  // ---------- One clean row ----------
  const ComplianceRow: React.FC<{
    keyName:
      | "intumescentStrips"
      | "coldSmokeSeals"
      | "selfClosingDevice"
      | "fireLockedSign"
      | "fireShutSign"
      | "holdOpenDevice"
      | "visibleCertification"
      | "doorGlazing"
      | "pyroGlazing";
    label: string;
    show?: boolean;
  }> = ({ keyName, label, show = true }) => {
    if (!show) return null;
    const currentVal = !!(complianceCheck as any)[keyName];

    const yes = (complianceCheck as any)[keyName] === true;
    const showMiniBecauseNo = !yes;
    const hasData = hasComplianceActionData(keyName);

    return (
      <>
        <View style={styles.complianceItem}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.switchContainer}>
            <Text style={styles.toggleText}>N</Text>
            <Switch
              value={currentVal}
              onValueChange={(next) => handleComplianceToggle(keyName, next)}
              disabled={isView}
            />
            <Text style={styles.toggleText}>Y</Text>
          </View>
        </View>

        {shouldShowComplianceMini(keyName) && (
          <MiniCapture
            key={`cc-${keyName}-${yes ? "Y" : "N"}`}
            isView={isView}
            fieldValue={keyName}
            formData={complianceCheck as any}
            savedImages={getComplianceImages(keyName)}
            onImagesChange={(images) => handleImagesChangeMini(images, keyName)}
            onImageDelete={(index) => handleDeleteImages(index, keyName)}
            onResetChange={() => handleResetAction(keyName, "COMPLIANCE")}
            onHandleActionFieldsChange={(val, type) =>
              handleComplianceActionFieldsChange(keyName, type, val)
            }
            reset={resetCaptureFlag}
            mandatoryFieldRef={mandatoryFieldRef}
            // 👇 this is the important part
            forceShow={!isView && (showMiniBecauseNo || hasData)}
          />
        )}
      </>
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
            style={styles.input}
            keyboardType="numeric"
            value={String(basicFormData.floor || 0)}
            editable={!isView}
            onChangeText={(text) => handleChange("floor", text)}
          />

          <View style={styles.imageSection}>
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
          </View>

          <Text style={styles.label}>Door Number</Text>
          <TextInput
            style={styles.input}
            value={formData.doorNumber || ""}
            editable={false}
          />

          <Text style={styles.label}>Door Type</Text>
          {isView ? (
            <Text style={styles.readOnlyValue}>
              {getDoorTypeName(formData?.doorType, doorTypesOption) || "—"}
            </Text>
          ) : (
            <View style={styles.pickerWrap}>
              <Picker
                key={`doorType-${isView ? "view" : "edit"}`} // force remount on mode switch
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

          <View style={styles.imageSection}>
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
          </View>

          <Text style={styles.label}>Fire Rating and Certification*</Text>
          {isView ? (
            <Text style={styles.readOnlyValue}>
              {fireRatingMap[String(formData?.fireResistance ?? "")] || "—"}
            </Text>
          ) : (
            <View style={styles.pickerWrap}>
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

          <Text style={styles.sectionTitle}>Physical Measurements</Text>

          {/* Head (mm) */}
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
          </View>

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
              onResetChange={() => handleResetAction("head", "PHYSICAL")}
              onHandleActionFieldsChange={(val, type) =>
                handleActionFieldsChange("head", type, val)
              }
              onImageDelete={(index) => handleDeleteImages(index, "head")}
              reset={resetCaptureFlag}
              mandatoryFieldRef={mandatoryFieldRef}
            />
          )}

          {/* Hinge Location */}
          <Text style={styles.label}>Hinge Location</Text>
          {isView ? (
            <Text style={styles.readOnlyValue}>
              {hingeMap[String(formData?.hingeLocation ?? "")] || "—"}
            </Text>
          ) : (
            <View style={styles.pickerWrap}>
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

          {[
            "hinge",
            "closing",
            "threshold",
            "doorThickness",
            "frameDepth",
            "doorSize",
            "fullDoorsetSize",
          ].map((field) => (
            <View key={field}>
              <Text style={styles.label}>
                {field.charAt(0).toUpperCase() + field.slice(1)} (mm)
              </Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={String((formData as any)[field] ?? "")}
                editable={!isView}
                onChangeText={(text) => handleFormDataChange(field, text)}
              />

              {shouldShowMini(field) && (
                <MiniCapture
                  key={`mc-${isView ? "view" : "edit"}-${field}`}
                  isView={isView}
                  fieldValue={field}
                  formData={formData}
                  savedImages={getImagesForField(field)}
                  onImagesChange={(images) =>
                    handleImagesChangeMini(images, field)
                  }
                  onResetChange={() => handleResetAction(field, "PHYSICAL")}
                  onHandleActionFieldsChange={(val, type) =>
                    handleActionFieldsChange(field, type, val)
                  }
                  onImageDelete={(index) => handleDeleteImages(index, field)}
                  reset={resetCaptureFlag}
                  mandatoryFieldRef={mandatoryFieldRef}
                />
              )}
            </View>
          ))}

          <Text style={styles.sectionTitle}>Compliance Check</Text>

          <ComplianceRow
            keyName="intumescentStrips"
            label="Intumescent Strips"
          />
          <ComplianceRow
            keyName="coldSmokeSeals"
            label="Cold Smoke Seals"
            show={isColdSeals}
          />
          <ComplianceRow
            keyName="selfClosingDevice"
            label="Self Closing Device"
          />
          <ComplianceRow
            keyName="fireLockedSign"
            label="Fire Door Keep Locked Sign"
            show={isFireKeepLocked}
          />
          <ComplianceRow
            keyName="fireShutSign"
            label="Fire Door Keep Shut Sign"
          />
          <ComplianceRow keyName="holdOpenDevice" label="Hold Open Device" />
          <ComplianceRow
            keyName="visibleCertification"
            label="Visible Certification on Fire Door"
          />
          <ComplianceRow keyName="doorGlazing" label="Door Contains Glazing" />
          <ComplianceRow
            keyName="pyroGlazing"
            label="Pyro Glazing"
            show={isGlazing}
          />

          {/* ------------------ Additional Photos & Comments ------------------ */}
          <View style={styles.imageSection}>
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
              singleImageCapture={false}
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
                justifyContent: "space-between",
                padding: 20,
                marginTop: 20,
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#ccc",
                  paddingVertical: 12,
                  paddingHorizontal: 25,
                  borderRadius: 8,
                }}
                onPress={() => navigation.goBack()}
              >
                <Text style={{ color: "#000", fontWeight: "bold" }}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: "#034694",
                  paddingVertical: 12,
                  paddingHorizontal: 25,
                  borderRadius: 8,
                }}
                onPress={() => {
                  setSubmitting(true);
                  handleSubmit("Compliant").finally(() => setSubmitting(false));
                }}
                disabled={submitting}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {submitting ? "Submitting..." : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[
            {
              backgroundColor: "#ffffff",
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
              borderWidth: 1,
              borderColor: "#000000",
            },
          ]}
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
