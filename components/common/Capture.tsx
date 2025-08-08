// import React, { ChangeEvent, useEffect, useRef, useState } from "react";
// import Webcam from "react-webcam";
// import { hostName } from "../../config/config";

// interface CaptureProps {
//   onImagesChange: (images: string[]) => void;
//   reset: boolean;
//   onImageDelete: (index: number) => void;
//   fieldValue: string;
//   singleImageCapture?: boolean;
//   isView: boolean;
//   savedImages: string[];
//   mandatoryFieldRef: React.RefObject<Record<string, any>>;
//   allowGallery?: boolean;
// }

// const Capture: React.FC<CaptureProps> = ({
//   onImagesChange,
//   reset,
//   onImageDelete,
//   fieldValue,
//   singleImageCapture = false,
//   isView,
//   savedImages,
//   mandatoryFieldRef,
//   allowGallery = true,
// }) => {
//   const [showCamera, setShowCamera] = useState<boolean>(false);
//   const [capturedImages, setCapturedImages] = useState<string[]>([]);
//   const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
//   const webcamRef = useRef<Webcam>(null);

//   const ImageProxyBaseUrl = `${hostName}api/Inspection/api/image?blobUrl=`;

//   useEffect(() => {
//     if (reset) {
//       setCapturedImages([]);
//       onImagesChange([]);
//       mandatoryFieldRef?.current?.[fieldValue]?.clear?.();
//     }

//     if (savedImages?.length > 0) {
//       setCapturedImages(savedImages);
//     }
//   }, [reset, savedImages]);

//   const updateImages = (newImages: string[]) => {
//     setCapturedImages(newImages);
//     onImagesChange(newImages);
//   };

//   const capturePhoto = () => {
//     const imageSrc = webcamRef.current?.getScreenshot();
//     if (imageSrc) {
//       const newImages = singleImageCapture
//         ? [imageSrc]
//         : [...capturedImages, imageSrc];
//       updateImages(newImages);
//       setShowCamera(false);
//     }
//   };

//   const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         const base64 = reader.result as string;
//         const newImages = singleImageCapture
//           ? [base64]
//           : [...capturedImages, base64];
//         updateImages(newImages);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const removeImage = (indexToRemove: number) => {
//     const newImages = capturedImages.filter(
//       (_, index) => index !== indexToRemove
//     );
//     setCapturedImages(newImages);
//     onImageDelete(indexToRemove);
//   };

//   const switchCamera = () => {
//     setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
//   };

//   const closeCamera = () => {
//     setShowCamera(false);
//   };

//   return (
//     <div className="d-flex flex-column">
//       {!isView && (
//         <div className="d-flex gap-3 pb-3 align-items-center">
//           {allowGallery && (
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleFileChange}
//               className="form-control"
//               disabled={singleImageCapture && capturedImages.length >= 1}
//             />
//           )}

//           {!showCamera && (
//             <i
//               className="fa-solid fa-camera fa-xl mainCamera"
//               onClick={() => {
//                 if (!(singleImageCapture && capturedImages.length >= 1)) {
//                   setShowCamera(true);
//                 }
//               }}
//               title="Open Camera"
//               style={{
//                 cursor:
//                   singleImageCapture && capturedImages.length >= 1
//                     ? "not-allowed"
//                     : "pointer",
//                 opacity:
//                   singleImageCapture && capturedImages.length >= 1 ? 0.5 : 1,
//               }}
//             ></i>
//           )}
//         </div>
//       )}

//       {showCamera && (
//         <div className="text-center mb-3">
//           <Webcam
//             audio={false}
//             ref={webcamRef}
//             height={280}
//             screenshotFormat="image/jpeg"
//             width={290}
//             videoConstraints={{ width: 640, height: 480, facingMode }}
//           />
//           <div className="d-flex justify-content-center gap-4 mt-2">
//             <i
//               className="fa-solid fa-camera fa-xl"
//               onClick={capturePhoto}
//               style={{ cursor: "pointer" }}
//               title="Capture Photo"
//             ></i>
//             <i
//               className="fa-solid fa-camera-rotate fa-xl"
//               onClick={switchCamera}
//               style={{ cursor: "pointer" }}
//               title="Switch Camera"
//             ></i>
//             <i
//               className="fa-solid fa-xmark fa-xl"
//               onClick={closeCamera}
//               style={{ cursor: "pointer" }}
//               title="Close Camera"
//             ></i>
//           </div>
//         </div>
//       )}

//       {capturedImages.length > 0 && (
//         <div className="mt-3">
//           <div className="d-flex flex-wrap gap-3">
//             {capturedImages.map((img, index) => (
//               <div
//                 key={index}
//                 style={{
//                   position: "relative",
//                   display: "inline-block",
//                   width: "200px",
//                   border: "2px solid #000",
//                 }}
//               >
//                 <img
//                   src={
//                     typeof img === "string" && img.startsWith("data:image")
//                       ? img
//                       : ImageProxyBaseUrl + encodeURIComponent(img || "")
//                   }
//                   onError={() => console.log("❌ image failed:", img)}
//                   alt={`Captured ${index + 1}`}
//                 />

//                 <i
//                   className="fa-solid fa-xmark"
//                   onClick={() => removeImage(index)}
//                   style={{
//                     position: "absolute",
//                     top: "-8px",
//                     right: "-8px",
//                     backgroundColor: "#fff",
//                     color: "#ff0000",
//                     border: "2px solid #ff0000",
//                     borderRadius: "50%",
//                     width: "24px",
//                     height: "24px",
//                     cursor: "pointer",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     fontSize: "14px",
//                     zIndex: 10,
//                   }}
//                   title="Remove Image"
//                 />
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Capture;

import * as ImagePicker from "expo-image-picker";
import React, { ChangeEvent, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { hostName } from "../config/config";

interface CaptureProps {
  onImagesChange: (images: string[]) => void;
  reset: boolean;
  onImageDelete: (index: number) => void;
  fieldValue: string;
  singleImageCapture?: boolean;
  isView: boolean;
  savedImages: string[];
  mandatoryFieldRef: React.RefObject<Record<string, any>>;
  allowGallery?: boolean;
}
const ImageProxyBaseUrl = `${hostName}api/Inspection/api/image?blobUrl=`;
const Capture: React.FC<CaptureProps> = ({
  onImagesChange,
  reset,
  onImageDelete,
  fieldValue,
  singleImageCapture = false,
  isView,
  savedImages,
  mandatoryFieldRef,
  allowGallery = true,
}) => {
  const [capturedImages, setCapturedImages] = useState<string[]>([]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const newImages = singleImageCapture
          ? [base64]
          : [...capturedImages, base64];
        updateImages(newImages);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (reset) {
      setCapturedImages([]);
      onImagesChange([]);
      mandatoryFieldRef?.current?.[fieldValue]?.clear?.();
    } else if (savedImages?.length > 0) {
      setCapturedImages(savedImages);
    }
  }, [reset, savedImages]);

  const updateImages = (images: string[]) => {
    setCapturedImages(images);
    onImagesChange(images);
  };

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    base64: true,    // ok to keep for preview
    quality: 0.9,
  });

  if (!result.canceled && result.assets?.length > 0) {
    const a = result.assets[0];
    // Prefer file URI for upload; keep dataURL for web preview if you want
    const chosen = Platform.OS === "web" && a.base64
      ? `data:image/jpeg;base64,${a.base64}`
      : a.uri;

    const newImages = singleImageCapture ? [chosen] : [...capturedImages, chosen];
    updateImages(newImages);
  }
};

const captureImage = async () => {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert("Camera Permission Denied", "Please allow camera access to take photos.");
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    base64: true,
    quality: 0.9,
  });

  if (!result.canceled && result.assets?.length > 0) {
    const a = result.assets[0];
    const taken = Platform.OS === "web" && a.base64
      ? `data:image/jpeg;base64,${a.base64}`
      : a.uri;

    const newImages = singleImageCapture ? [taken] : [...capturedImages, taken];
    updateImages(newImages);
  }
};


  const removeImage = (index: number) => {
    const newImages = capturedImages.filter((_, i) => i !== index);
    updateImages(newImages);
    onImageDelete(index);
  };

  return (
    <View style={styles.container}>
      {!isView && (
        <View style={styles.controls}>
          {allowGallery &&
            (!singleImageCapture || capturedImages.length < 1) && (
              <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
                <FontAwesome name="image" size={28} color="#007bff" />
                <Text style={styles.label}>Gallery</Text>
              </TouchableOpacity>
            )}

          {!singleImageCapture || capturedImages.length < 1 ? (
            <TouchableOpacity onPress={captureImage} style={styles.iconButton}>
              <FontAwesome name="camera" size={28} color="#28a745" />
              <Text style={styles.label}>Camera</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {/* {capturedImages.length > 0 && (
        <ScrollView contentContainerStyle={styles.imageList}>
          {capturedImages.map((img, index) => {
            const uri =
              typeof img === "string" && img.startsWith("data:image")
                ? img
                : `${ImageProxyBaseUrl}${encodeURIComponent(img || "")}`;

            return (
              <View key={index} style={styles.imageWrapper}>
                <Image
                  source={{ uri }}
                  style={styles.image}
                  resizeMode="cover"
                  onError={() => console.log("❌ image failed:", uri)}
                />

                {!isView && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.removeText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </ScrollView>
      )} */}

      <ScrollView contentContainerStyle={styles.imagePreviewContainer}>
         {capturedImages.length > 0 && (
        <ScrollView contentContainerStyle={styles.imageList}>
          {capturedImages.map((img, index) => {
            const uri =
              typeof img === "string" && img.startsWith("data:image")
                ? img
                : `${ImageProxyBaseUrl}${encodeURIComponent(img || "")}`;

            return (
              <View key={index} style={styles.imageWrapper}>
                <Image
                  source={{ uri }}
                  style={styles.image}
                  resizeMode="cover"
                  onError={() => console.log("❌ image failed:", uri)}
                />

                {!isView && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.removeText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    padding: 10,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
  },
  iconButton: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  label: {
    fontSize: 14,
    marginTop: 4,
    color: "#333",
  },
  imagePreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    justifyContent: "flex-start",
  },
  imageWrapper: {
    position: "relative",
    margin: 5,
    width: 150,
    height: 150,
  },
  image: {
    width: "100%",
    height: "100%",
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "#fff",
    borderColor: "#ff0000",
    borderWidth: 2,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  removeText: {
    color: "#ff0000",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default Capture;
