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

  // mandatoryFieldRef: React.MutableRefObject<
  //   Record<string, TextInput | Picker | null>
  // >;

  mandatoryFieldRef: React.MutableRefObject<Record<string, TextInput | null>>;

  handleChange: (field: string, value: string) => void;
  handleFormDataChange: (field: string, value: string) => void;
  handleGapsChange: (field: string, value: string) => void;
  handleComplianceToggle: (field: string) => void;
  handleImagesChange: (images: string[], field: string) => void;
  handleImagesChangeMini: (images: string[], field: string) => void;
  handleDeleteImages: (index: number, field: string) => void;
  handleResetAction: (field: string, type: string) => void;
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
const severityMap: Record<string, string> = {
  "1": "Critical",
  "2": "High",
  "3": "Medium",
  "4": "Low",
};
const categoryMap: Record<string, string> = {
  "1": "Fire door Repair",
  "2": "Signage repair",
  "3": "Fire door Replacement",
  "4": "Testing, Records, Log Book",
  "5": "Door Replacement required",
};
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
  const getNum = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  };

  const hasActionDataFor = (field: string) => {
    const fd = formData as any;
    return Boolean(
      fd[`${field}Severity`] ||
        fd[`${field}Category`] ||
        fd[`${field}Remediation`] ||
        fd[`${field}Comments`] ||
        fd[`${field}DueDate`]
      // (actionImages?.[field]?.length > 0)
    );
  };

  const shouldShowMini = (field: string) => {
    if (isView) return hasActionDataFor(field);
    const val = getNum((formData as any)[field]);
    return (Number.isFinite(val) && val >= 4) || hasActionDataFor(field);
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
                key={`doorType-${isView ? "view" : "edit"}`} // 👈 forces remount on mode change
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
          </View>
          {/* 🔥 Fire Rating and Certification */}
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
          </View>

          {/* ✅ ALWAYS show MiniCapture */}
          {shouldShowMini("head") && (
            <MiniCapture
              key={`mc-${isView ? "view" : "edit"}-head`}
              isView={isView}
              fieldValue="head"
              formData={formData}
              savedImages={actionImages["head"] ?? []}
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
                  savedImages={actionImages[field] ?? []}
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

          {/* Intumescent Strips */}
          <View style={styles.complianceItem}>
            <Text style={styles.label}>Intumescent Strips</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.toggleText}>N</Text>
              <Switch
                value={complianceCheck.intumescentStrips || false}
                onValueChange={() =>
                  handleComplianceToggle("intumescentStrips")
                }
                disabled={isView}
              />
              <Text style={styles.toggleText}>Y</Text>
            </View>
          </View>

          {/* Cold Smoke Seals (optional section toggle by isColdSeals) */}
          {isColdSeals && (
            <View style={styles.complianceItem}>
              <Text style={styles.label}>Cold Smoke Seals</Text>
              <View style={styles.switchContainer}>
                <Text style={styles.toggleText}>N</Text>
                <Switch
                  value={complianceCheck.coldSmokeSeals || false}
                  onValueChange={() => handleComplianceToggle("coldSmokeSeals")}
                  disabled={isView}
                />
                <Text style={styles.toggleText}>Y</Text>
              </View>
            </View>
          )}

          {/* Self Closing Device */}
          <View style={styles.complianceItem}>
            <Text style={styles.label}>Self Closing Device</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.toggleText}>N</Text>
              <Switch
                value={complianceCheck.selfClosingDevice || false}
                onValueChange={() =>
                  handleComplianceToggle("selfClosingDevice")
                }
                disabled={isView}
              />
              <Text style={styles.toggleText}>Y</Text>
            </View>
          </View>

          {/* Fire Door Keep Locked Sign */}
          {isFireKeepLocked && (
            <View style={styles.complianceItem}>
              <Text style={styles.label}>Fire Door Keep Locked Sign</Text>
              <View style={styles.switchContainer}>
                <Text style={styles.toggleText}>N</Text>
                <Switch
                  value={complianceCheck.fireLockedSign || false}
                  onValueChange={() => handleComplianceToggle("fireLockedSign")}
                  disabled={isView}
                />
                <Text style={styles.toggleText}>Y</Text>
              </View>
            </View>
          )}

          {/* Fire Door Keep Shut Sign */}
          <View style={styles.complianceItem}>
            <Text style={styles.label}>Fire Door Keep Shut Sign</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.toggleText}>N</Text>
              <Switch
                value={complianceCheck.fireShutSign || false}
                onValueChange={() => handleComplianceToggle("fireShutSign")}
                disabled={isView}
              />
              <Text style={styles.toggleText}>Y</Text>
            </View>
          </View>

          {/* Hold Open Device */}
          <View style={styles.complianceItem}>
            <Text style={styles.label}>Hold Open Device</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.toggleText}>N</Text>
              <Switch
                value={complianceCheck.holdOpenDevice || false}
                onValueChange={() => handleComplianceToggle("holdOpenDevice")}
                disabled={isView}
              />
              <Text style={styles.toggleText}>Y</Text>
            </View>
          </View>

          {/* Visible Certification */}
          <View style={styles.complianceItem}>
            <Text style={styles.label}>Visible Certification on Fire Door</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.toggleText}>N</Text>
              <Switch
                value={complianceCheck.visibleCertification || false}
                onValueChange={() =>
                  handleComplianceToggle("visibleCertification")
                }
                disabled={isView}
              />
              <Text style={styles.toggleText}>Y</Text>
            </View>
          </View>

          {/* Door Glazing */}
          <View style={styles.complianceItem}>
            <Text style={styles.label}>Door Contains Glazing</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.toggleText}>N</Text>
              <Switch
                value={complianceCheck.doorGlazing || false}
                onValueChange={() => handleComplianceToggle("doorGlazing")}
                disabled={isView}
              />
              <Text style={styles.toggleText}>Y</Text>
            </View>
          </View>

          {/* Pyro Glazing (only if glazing is present) */}
          {isGlazing && (
            <View style={styles.complianceItem}>
              <Text style={styles.label}>Pyro Glazing</Text>
              <View style={styles.switchContainer}>
                <Text style={styles.toggleText}>N</Text>
                <Switch
                  value={complianceCheck.pyroGlazing || false}
                  onValueChange={() => handleComplianceToggle("pyroGlazing")}
                  disabled={isView}
                />
                <Text style={styles.toggleText}>Y</Text>
              </View>
            </View>
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
                  console.log("🟢 Submit Clicked");
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
