import { Picker } from "@react-native-picker/picker";
import React, { useMemo } from "react";
import { Platform, StyleSheet, Text, TextInput, View } from "react-native";
import Capture from "./Capture";

interface MiniCaptureProps {
  isView: boolean;
  savedImages: string[];
  fieldValue: string;
  formData: Record<string, any>;
  onImagesChange: (images: string[], file?: string) => void;
  onResetChange: () => void;
  onHandleActionFieldsChange: (
    value: string,
    type: "Severity" | "Category" | "Remediation" | "Comments" | "DueDate"
  ) => void;
  onImageDelete: (index: number) => void;
  reset: boolean;
  mandatoryFieldRef: React.MutableRefObject<Record<string, TextInput | null>>;
  /** Parent can force visibility (e.g., when value > 3.0) */
  forceShow?: boolean;
  showErrors?: boolean;
}

const severityMap: Record<string, string> = {
  "": "Select",
  "1": "Critical",
  "2": "High",
  "3": "Medium",
  "4": "Low",
};
const categoryMap: Record<string, string> = {
  "": "Select",
  "1": "Fire door Repair",
  "2": "Signage repair",
  "3": "Fire door Replacement",
  "4": "Testing, Records, Log Book",
  "5": "Door Replacement required",
};

const getSeverityDate = (severityValue: string) => {
  const today = new Date();
  const ymd = (d: Date) => d.toISOString().split("T")[0];

  switch (severityValue) {
    case "1": // Critical -> today
      return ymd(today);
    case "2": // High -> +30 days
      return ymd(
        new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30)
      );
    case "3": // Medium -> +90 days
      return ymd(
        new Date(today.getFullYear(), today.getMonth(), today.getDate() + 90)
      );
    case "4": // Low -> +180 days
      return ymd(
        new Date(today.getFullYear(), today.getMonth(), today.getDate() + 180)
      );
    default:
      return "";
  }
};

const ACTION_THRESHOLD = 3;

const MiniCapture = ({
  isView,
  savedImages = [],
  fieldValue,
  formData,
  onImagesChange,
  onResetChange,
  onHandleActionFieldsChange,
  onImageDelete,
  reset,
  mandatoryFieldRef,
  forceShow,
  showErrors,
}: MiniCaptureProps) => {
  const editable = !isView;

  const isBlank = (v: string) => !v || v === "Select";


  // dynamic keys
  const fieldSev = `${fieldValue}Severity`;
  const fieldCat = `${fieldValue}Category`;
  const fieldRem = `${fieldValue}Remediation`;
  const fieldCom = `${fieldValue}Comments`;
  const fieldDue = `${fieldValue}DueDate`;

  // current values
  const sev = String(formData?.[fieldSev] ?? "");
  const cat = String(formData?.[fieldCat] ?? "");
  const rem = String(formData?.[fieldRem] ?? "");
  const com = String(formData?.[fieldCom] ?? "");
  const due = String(formData?.[fieldDue] ?? "");

  // robust numeric parse for the measurement value of this field
  const measurementVal = useMemo(() => {
    const raw = formData?.[fieldValue];
    if (raw == null) return NaN;
    const num = parseFloat(String(raw).replace(/,/g, "").trim());
    return Number.isFinite(num) ? num : NaN;
  }, [formData, fieldValue]);

  const hasSavedSeverity = !!sev && sev !== "Select";
  const hasImages = (savedImages?.length ?? 0) > 0;

  // ✅ NEW: allow the component to decide visibility on its own in edit mode
  // Show when:
  // - view mode: there is saved severity or images
  // - edit mode: over threshold (>3) OR forceShow is true OR any saved severity/images already exist
  const overThreshold =
    Number.isFinite(measurementVal) && measurementVal > ACTION_THRESHOLD;

  const shouldShow = isView
    ? hasSavedSeverity || hasImages
    : (forceShow ?? false) || overThreshold || hasSavedSeverity || hasImages;

  // 🔎 Inline validation flags (shown only when showErrors && !isView)
  const mustShowErrors = showErrors && !isView && shouldShow;
const sevError = mustShowErrors && isBlank(sev) ? "Severity is required" : "";
const catError = mustShowErrors && isBlank(cat) ? "Category is required" : "";
const dueError = mustShowErrors && !due ? "Due date is required" : "";
const remError =
  mustShowErrors && cat !== "5" && !rem.trim() ? "Remediation is required" : "";


  if (!shouldShow) return null;

  return (
    <View style={styles.card} pointerEvents="auto">
      {/* Severity */}

      <Text style={styles.label}>
        Severity <Text style={{ color: "red" }}>*</Text>
      </Text>
      {isView ? (
        <Text style={styles.readOnly}>{severityMap[sev] || "—"}</Text>
      ) : (
        <>
          <View
            style={[
              styles.pickerWrap,
              styles.touchFix,
              !!sevError && styles.errorBorder,
            ]}
          >
            <Picker
              key={`sev-${fieldValue}-edit`}
              selectedValue={sev}
              onValueChange={(v) => {
                const val = String(v);
                onHandleActionFieldsChange(val, "Severity");
                const due = getSeverityDate(val);
                onHandleActionFieldsChange(due, "DueDate");
              }}
              enabled
              mode={Platform.OS === "android" ? "dropdown" : "dialog"}
              dropdownIconColor="#034694"
              style={styles.picker}
            >
              <Picker.Item label="Select" value="" color="#999" />
              <Picker.Item label="Critical" value="1" color="#034694" />
              <Picker.Item label="High" value="2" color="#034694" />
              <Picker.Item label="Medium" value="3" color="#034694" />
              <Picker.Item label="Low" value="4" color="#034694" />
            </Picker>
          </View>
          {!!sevError && <Text style={styles.errorText}>{sevError}</Text>}
        </>
      )}

      {/* Category + Due Date */}
      <View>
        <View style={{ flex: 2 }}>
          <Text style={styles.smallLabel}>
            Category <Text style={{ color: "red" }}>*</Text>
          </Text>
          {isView ? (
            <Text style={styles.readOnly}>{categoryMap[cat] || "—"}</Text>
          ) : (
            <>
              <View
                style={[
                  styles.pickerWrap,
                  styles.touchFix,
                  !!catError && styles.errorBorder,
                ]}
              >
                <Picker
                  key={`cat-${fieldValue}-edit`}
                  selectedValue={cat}
                  onValueChange={(v) =>
                    onHandleActionFieldsChange(String(v), "Category")
                  }
                  enabled
                  mode={Platform.OS === "android" ? "dropdown" : "dialog"}
                  dropdownIconColor="#034694"
                  style={styles.picker}
                >
                  <Picker.Item label="Select" value="" color="#999" />
                  <Picker.Item
                    label="Fire door Repair"
                    value="1"
                    color="#034694"
                  />
                  <Picker.Item
                    label="Signage repair"
                    value="2"
                    color="#034694"
                  />
                  <Picker.Item
                    label="Fire door Replacement"
                    value="3"
                    color="#034694"
                  />
                  <Picker.Item
                    label="Testing, Records, Log Book"
                    value="4"
                    color="#034694"
                  />
                  <Picker.Item
                    label="Door Replacement required"
                    value="5"
                    color="#034694"
                  />
                </Picker>
              </View>
              {!!catError && <Text style={styles.errorText}>{catError}</Text>}
            </>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.smallLabel}>
            Due Date <Text style={{ color: "red" }}>*</Text>
          </Text>
          <Text style={styles.readOnly}>{due || "—"}</Text>
          {!!dueError && !isView && (
            <Text style={styles.errorText}>{dueError}</Text>
          )}
        </View>
      </View>

      {/* Remediation (hidden when Category = 5) */}
      {cat !== "5" && (
        <View style={{ flex: 1 }}>
          <Text  style={styles.smallLabel}  >
            Remedial/Action required <Text style={{ color: "red" }}>*</Text>
          </Text>
          {isView ? (
            <Text style={styles.readOnly}>{rem || "—"}</Text>
          ) : (
            <>
              <TextInput
                style={[styles.input, !!remError && styles.errorBorder]}
                value={rem}
                onChangeText={(t) =>
                  onHandleActionFieldsChange(t, "Remediation")
                }
                editable={editable}
              />
              {!!remError && <Text style={styles.errorText}>{remError}</Text>}
            </>
          )}
        </View>
      )}

      {/* Comments */}
      <Text style={styles.label}>Comments</Text>
      {isView ? (
        <Text style={styles.readOnly}>{com || "—"}</Text>
      ) : (
        <TextInput
          style={[styles.input, { height: 100 }]}
          multiline
          value={com}
          onChangeText={(t) => onHandleActionFieldsChange(t, "Comments")}
          editable={editable}
        />
      )}

      {/* Photo evidence */}
      <View style={{ marginTop: 8 }}>
        <Text style={styles.label}>Photo </Text>
        <Capture
          isView={isView}
          savedImages={savedImages || []}
          onImagesChange={(images) => onImagesChange(images, fieldValue)}
          reset={reset}
          onImageDelete={(index) => onImageDelete(index)}
          mandatoryFieldRef={mandatoryFieldRef}
          fieldValue={fieldValue}
          singleImageCapture={false}
          allowGallery
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: "#d32f2f",
  },
  label: { marginTop: 8, marginBottom: 4, fontWeight: "600", color: "#034694" },
  smallLabel: {
    marginBottom: 4,
    fontWeight: "600",
    color: "#034694",
    fontSize: 12,
  },
  readOnly: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#f0f4f8",
    color: "#333",
  },
  errorBorder: { borderColor: "#d32f2f" },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#e9f1fb",
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#e9f1fb",
  },
  picker: {
    width: "100%",
    backgroundColor: "#e9f1fb",
    color: "#034694",
    fontSize: 16,
  },
  touchFix: { zIndex: 999, elevation: 12, overflow: "visible" },
});

export default MiniCapture;
