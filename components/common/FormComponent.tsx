import { Picker } from "@react-native-picker/picker";

import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
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
  handleValidationOnSave: (status: string) => void;
}

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
  handleValidationOnSave,
}) => {
  return (
    <SafeAreaView >
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

          <View style={{ marginBottom: 12 }}>
            <Text style={styles.label}>Door Type</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 6,
                backgroundColor: "#e9f1fb",
                overflow: "hidden",
              }}
            >
              <Picker
                selectedValue={String(formData?.doorType ?? "")} // ✅ Force string
                onValueChange={(value) =>
                  handleFormDataChange("doorType", value)
                }
                enabled={!isView}
                dropdownIconColor="#034694"
                style={{
                  width: "100%",
                  backgroundColor: "#e9f1fb",
                  color: "#034694",
                  fontSize: 16,
                }}
              >
                <Picker.Item label="Select" value="" color="#999" />
                {doorTypesOption.map((type) => (
                  <Picker.Item
                    key={type.doorTypeId}
                    label={type.doorTypeName}
                    value={String(type.doorTypeId)} // ✅ Value as string
                    color="#034694" // ✅ Set item color here
                  />
                ))}
              </Picker>
            </View>
          </View>

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
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.label}>Fire Rating and Certification*</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 6,
                backgroundColor: "#e9f1fb",
                overflow: "hidden",
              }}
            >
              <Picker
                selectedValue={String(formData?.fireResistance ?? "")} // ✅ force string
                onValueChange={(value) =>
                  handleFormDataChange("fireResistance", value)
                }
                enabled={!isView}
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

          <Text style={styles.sectionTitle}>Physical Measurements</Text>

          {/* 🧱 Head(mm) Field with MiniCapture */}
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.label}>
              Head(mm)
              <Text style={{ color: "red" }}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              editable={!isView}
              placeholder="Head(mm)"
              value={String(formData.head ?? "")} // ✅ Always safe
              onChangeText={(value) => handleFormDataChange("head", value)}
              ref={(el) => {
                if (mandatoryFieldRef?.current) {
                  mandatoryFieldRef.current.head = el;
                }
              }}
            />
          </View>

          {actionmenuFlag.head && (
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
          )}

          {/* Hinge Location */}
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.label}>Hinge Location</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 6,
                backgroundColor: "#e9f1fb", // Light blue
                // overflow: "hidden",
              }}
            >
              <Picker
                selectedValue={formData?.hingeLocation ?? ""}
                onValueChange={(value) =>
                  handleFormDataChange("hingeLocation", value)
                }
                enabled={!isView}
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
                value={String(formData[field] || "")}
                editable={!isView}
                onChangeText={(text) => handleFormDataChange(field, text)}
              />
              {actionmenuFlag[field] && (
                <MiniCapture
                  isView={isView}
                  mandatoryFieldRef={mandatoryFieldRef}
                  fieldValue={field}
                  savedImages={actionImages[field] ?? []}
                  formData={formData}
                  onImagesChange={(images) =>
                    handleImagesChangeMini(images, field)
                  }
                  onResetChange={() => handleResetAction(field, "PHYSICAL")}
                  onHandleActionFieldsChange={(e, fieldName) =>
                    handleActionFieldsChange(e, fieldName, "PHYSICAL")
                  }
                  onImageDelete={(index) => handleDeleteImages(index, field)}
                  reset={resetCaptureFlag}
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
  onImagesChange={(images) => handleImagesChange(images, "Additional")}
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

          {/* Add additional compliance fields similarly */}
        </View>
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
