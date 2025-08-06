import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { hostName } from "../config/config";

interface MiniCaptureProps {
  isView: boolean;
  savedImages: string[];
  fieldValue: string;
  formData: Record<string, any>;
  onImagesChange: (images: string[], file?: string) => void;
  onResetChange: () => void;
  onHandleActionFieldsChange: (value: string, type: string) => void;
  onImageDelete: (index: number) => void;
  reset: boolean;
  mandatoryFieldRef: React.MutableRefObject<
    Record<string, TextInput | null>
  >;
}

function MiniCapture({
  isView,
  savedImages,
  fieldValue,
  formData,
  onImagesChange,
  onResetChange,
  onHandleActionFieldsChange,
  onImageDelete,
  reset,
  mandatoryFieldRef,
}: MiniCaptureProps) {
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [hideRemediation, setHideRemediation] = useState(false);

  const fieldComm = fieldValue + "Comments";
  const fieldSev = fieldValue + "Severity";
  const fieldCat = fieldValue + "Category";
  const fieldDue = fieldValue + "DueDate";
  const fieldRemed = fieldValue + "Remediation";

  const ImageProxyBaseUrl = hostName + "api/Inspection/api/image?blobUrl=";

  useEffect(() => {
    if (reset) {
      setCapturedImages([]);
      onImagesChange([], "");
    }
    if (savedImages?.length > 0) {
      setCapturedImages(savedImages);
    }
    setHideRemediation(formData[fieldCat] === "5");
  }, [reset]);

  const removeImage = (indexToRemove: number) => {
    const newImages = capturedImages.filter(
      (_, index) => index !== indexToRemove
    );
    setCapturedImages(newImages);
    onImageDelete(indexToRemove);
  };

  const handleReset = () => {
    setCapturedImages([]);
    onImagesChange([], "");
    onResetChange();
  };

  const resetIndividualField = (field: string) => {
    // This is a placeholder: TextInput in React Native doesn't support direct styling like web
    // You can use error state to highlight fields conditionally instead
    // mandatoryFieldRef.current[field]?.setNativeProps({ style: { borderColor: 'red' } });
  };

  return (
    <ScrollView style={styles.card}>
      <Text style={styles.label}>Severity *</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={formData[fieldSev]}
          enabled={!isView}
          onValueChange={(value) => {
            resetIndividualField(fieldSev);
            onHandleActionFieldsChange(value, "Severity");
          }}
        >
          <Picker.Item label="Select" value="" />
          <Picker.Item label="Critical" value="1" />
          <Picker.Item label="High" value="2" />
          <Picker.Item label="Medium" value="3" />
          <Picker.Item label="Low" value="4" />
        </Picker>
      </View>

      <Text style={styles.label}>Category *</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={formData[fieldCat]}
          enabled={!isView}
          onValueChange={(value) => {
            setHideRemediation(value === "5");
            onHandleActionFieldsChange(value, "Category");
          }}
        >
          <Picker.Item label="Select" value="" />
          <Picker.Item label="Fire door Repair" value="1" />
          <Picker.Item label="Signage repair" value="2" />
          <Picker.Item label="Fire door Replacement" value="3" />
          <Picker.Item label="Testing, Records, Log Book" value="4" />
          <Picker.Item label="Door Replacement required" value="5" />
        </Picker>
      </View>

      <Text style={styles.label}>Due Date *</Text>
      <TextInput
        style={styles.input}
        editable={false}
        value={formData[fieldDue]}
      />

      {!hideRemediation && (
        <View>
          <Text style={styles.label}>Remedial/Action Required *</Text>
          <TextInput
            style={styles.input}
            editable={!isView}
            value={formData[fieldRemed]}
            onChangeText={(text) => {
              resetIndividualField(fieldRemed);
              onHandleActionFieldsChange(text, "Remediation");
            }}
          />
        </View>
      )}

      <Text style={styles.label}>Comments</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        multiline
        editable={!isView}
        value={formData[fieldComm]}
        onChangeText={(text) => onHandleActionFieldsChange(text, "Comments")}
      />

      {capturedImages.length > 0 && (
        <View style={styles.imageRow}>
          {capturedImages.map((img, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri: img }} style={styles.image} />
              {!isView && (
                <TouchableOpacity onPress={() => removeImage(index)}>
                  <Text style={styles.removeText}>X</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

export default MiniCapture;
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    margin: 16,
    elevation: 3,
  },
  label: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f8f8f8",
    marginBottom: 12,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 12,
  },
  imageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  imageWrapper: {
    position: "relative",
    margin: 5,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 6,
  },
  removeText: {
    position: "absolute",
    top: 0,
    right: 5,
    color: "red",
    fontWeight: "bold",
    backgroundColor: "white",
    paddingHorizontal: 4,
    borderRadius: 10,
  },
});
