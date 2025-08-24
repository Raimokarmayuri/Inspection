// import * as ImagePicker from "expo-image-picker";
// import React, { ChangeEvent, useEffect, useState } from "react";
// import {
//   Alert,
//   Image,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import FontAwesome from "react-native-vector-icons/FontAwesome";
// import { hostName } from "../config/config";

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
// const ImageProxyBaseUrl = `${hostName}api/Inspection/api/image?blobUrl=`;
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
//   const [capturedImages, setCapturedImages] = useState<string[]>([]);

//     const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       const base64 = reader.result as string; // data:image/...
//       const next = singleImageCapture ? [base64] : [...capturedImages, base64];
//       updateImages(next);
//     };
//     reader.readAsDataURL(file);
//   };

//   useEffect(() => {
//     if (reset) {
//       setCapturedImages([]);
//       onImagesChange([]);
//       // optionally clear any input refs the parent keeps
//       mandatoryFieldRef?.current?.[fieldValue]?.clear?.();
//     } else if (Array.isArray(savedImages) && savedImages.length > 0) {
//       setCapturedImages(savedImages);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [reset, savedImages]);

//    // ----- helpers -----
//  const toDisplayUri = (u?: string) => {
//   if (!u) return "";
//   if (/^https?:\/\//i.test(u)) return `${ImageProxyBaseUrl}${encodeURIComponent(u)}`;
//   // data:, file://, content://, blob: should be used directly
//   return u;
// };

//   const updateImages = (images: string[]) => {
//     const clean = (images ?? []).filter(
//       (s): s is string => typeof s === "string" && s.length > 0
//     );
//     setCapturedImages(clean);
//     onImagesChange(clean);
//   };

  

//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       base64: true, // ok to keep for preview
//       quality: 0.9,
//     });

//     if (!result.canceled && result.assets?.length > 0) {
//       const a = result.assets[0];
//       // Prefer file URI for upload; keep dataURL for web preview if you want
//       const chosen =
//         Platform.OS === "web" && a.base64
//           ? `data:image/jpeg;base64,${a.base64}`
//           : a.uri;

//       const newImages = singleImageCapture
//         ? [chosen]
//         : [...capturedImages, chosen];
//       updateImages(newImages);
//     }
//   };

//   const captureImage = async () => {
//     const permission = await ImagePicker.requestCameraPermissionsAsync();
//     if (!permission.granted) {
//       Alert.alert(
//         "Camera Permission Denied",
//         "Please allow camera access to take photos."
//       );
//       return;
//     }

//     const result = await ImagePicker.launchCameraAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       base64: true,
//       quality: 0.9,
//     });

//     if (!result.canceled && result.assets?.length > 0) {
//       const a = result.assets[0];
//       const taken =
//         Platform.OS === "web" && a.base64
//           ? `data:image/jpeg;base64,${a.base64}`
//           : a.uri;

//       const newImages = singleImageCapture
//         ? [taken]
//         : [...capturedImages, taken];
//       updateImages(newImages);
//     }
//   };

//   const removeImage = (index: number) => {
//     const newImages = capturedImages.filter((_, i) => i !== index);
//     updateImages(newImages);
//     onImageDelete(index);
//   };

//   return (
//     <View style={styles.container}>
//       {!isView && (
//         <View style={styles.controls}>
//           {allowGallery &&
//             (!singleImageCapture || capturedImages.length < 1) && (
//               <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
//                 <FontAwesome name="image" size={28} color="#007bff" />
//                 <Text style={styles.label}>Gallery</Text>
//               </TouchableOpacity>
//             )}

//           {!singleImageCapture || capturedImages.length < 1 ? (
//             <TouchableOpacity onPress={captureImage} style={styles.iconButton}>
//               <FontAwesome name="camera" size={28} color="#28a745" />
//               <Text style={styles.label}>Camera</Text>
//             </TouchableOpacity>
//           ) : null}
//         </View>
//       )}

//       {/* {capturedImages.length > 0 && (
//         <ScrollView contentContainerStyle={styles.imageList}>
//           {capturedImages.map((img, index) => {
//             const uri =
//               typeof img === "string" && img.startsWith("data:image")
//                 ? img
//                 : `${ImageProxyBaseUrl}${encodeURIComponent(img || "")}`;

//             return (
//               <View key={index} style={styles.imageWrapper}>
//                 <Image
//                   source={{ uri }}
//                   style={styles.image}
//                   resizeMode="cover"
//                   onError={() => console.log("❌ image failed:", uri)}
//                 />

//                 {!isView && (
//                   <TouchableOpacity
//                     style={styles.removeButton}
//                     onPress={() => removeImage(index)}
//                   >
//                     <Text style={styles.removeText}>×</Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//             );
//           })}
//         </ScrollView>
//       )} */}

//       <ScrollView contentContainerStyle={styles.imagePreviewContainer}>
//         {capturedImages.length > 0 && (
//           <ScrollView contentContainerStyle={styles.imageList}>
//             {capturedImages.map((img, index) => {
//               const uri = toDisplayUri(img);
//               return (
//                 <View key={`${index}-${uri}`} style={styles.imageWrapper}>
//                   <Image
//                     source={{ uri }}
//                     style={styles.image}
//                     resizeMode="cover"
//                     onError={() => console.log("❌ image failed:", uri)}
//                   />
//                   {!isView && (
//                     <TouchableOpacity
//                       style={styles.removeButton}
//                       onPress={() => removeImage(index)}
//                     >
//                       <Text style={styles.removeText}>×</Text>
//                     </TouchableOpacity>
//                   )}
//                 </View>
//               );
//             })}
//           </ScrollView>
//         )}
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   imageList: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 12,
//     padding: 10,
//   },
//   controls: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     paddingVertical: 12,
//   },
//   iconButton: {
//     alignItems: "center",
//     marginHorizontal: 10,
//   },
//   label: {
//     fontSize: 14,
//     marginTop: 4,
//     color: "#333",
//   },
//   imagePreviewContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     padding: 10,
//     justifyContent: "flex-start",
//   },
//   imageWrapper: {
//     position: "relative",
//     margin: 5,
//     width: 150,
//     height: 150,
//   },
//   image: {
//     width: "100%",
//     height: "100%",
//     borderWidth: 2,
//     borderColor: "#000",
//     borderRadius: 8,
//   },
//   removeButton: {
//     position: "absolute",
//     top: -10,
//     right: -10,
//     backgroundColor: "#fff",
//     borderColor: "#ff0000",
//     borderWidth: 2,
//     borderRadius: 12,
//     width: 24,
//     height: 24,
//     alignItems: "center",
//     justifyContent: "center",
//     zIndex: 10,
//   },
//   removeText: {
//     color: "#ff0000",
//     fontSize: 14,
//     fontWeight: "bold",
//   },
// });

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
  onImagesChange: (images: string[]) => void;  // parent supplies field in the callback
  reset: boolean;
  onImageDelete: (index: number) => void;      // optional, keep for MiniCapture parity
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

  // ---- helpers ----
  // const toDisplayUri = (u?: string) => {
  //   if (!u) return "";
  //   if (/^https?:\/\//i.test(u)) {
  //     // server image → go through your proxy
  //     return `${ImageProxyBaseUrl}${encodeURIComponent(u)}`;
  //   }
  //   // data:, file://, content://, blob: → show directly
  //   return u;
  // };

  // const updateImages = (images: string[]) => {
  //   const clean = (images ?? []).filter(
  //     (s): s is string => typeof s === "string" && s.length > 0
  //   );
  //   setCapturedImages(clean);
  //   onImagesChange(clean); // parent knows which field in the callback it binds
  // };

  // Web file input (if you keep a hidden input somewhere)
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string; // data:image/...
      const next = singleImageCapture ? [base64] : [...capturedImages, base64];
      updateImages(next);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (reset) {
      setCapturedImages([]);
      onImagesChange([]);
      mandatoryFieldRef?.current?.[fieldValue]?.clear?.();
      return;
    }
    // sync from parent (edit mode loads server URLs here)
    if (Array.isArray(savedImages)) {
      setCapturedImages(savedImages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset, savedImages]);

  // Build mediaTypes without deprecated API
  const mediaTypes =
    (ImagePicker as any).MediaType
      ? { mediaTypes: [(ImagePicker as any).MediaType.Image] } // new API
      : { mediaTypes: (ImagePicker as any).MediaTypeOptions?.Images ?? undefined }; // fallback

  const wantBase64 = Platform.OS === "web"; // only needed on web for previews

// Works with both the NEW (MediaType) and OLD (MediaTypeOptions) Expo APIs
const getMediaTypesProp = () => {
  const EP: any = ImagePicker as any;
  return EP?.MediaType
    ? { mediaTypes: [EP.MediaType.Image] }      // ✅ new API
    : { mediaTypes: EP?.MediaTypeOptions?.Images }; // ✅ fallback
};

const toDisplayUri = (u?: string) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) {
    const proxied = `${ImageProxyBaseUrl}${encodeURIComponent(u)}`;
    console.log("[Capture] toDisplayUri -> proxied", { original: u, proxied });
    return proxied;
  }
  console.log("[Capture] toDisplayUri -> local", u.slice(0, 60));
  return u;
};

const updateImages = (images: string[]) => {
  const clean = (images ?? []).filter(
    (s): s is string => typeof s === "string" && s.length > 0
  );
  console.log("[Capture] updateImages()", {
    fieldValue,
    count: clean.length,
    samples: clean.map((x) => x.slice(0, 60)),
  });
  setCapturedImages(clean);
  onImagesChange(clean);
};

useEffect(() => {
  console.log("[Capture] useEffect(reset,savedImages)", {
    fieldValue,
    reset,
    savedCount: savedImages?.length || 0,
  });
  if (reset) {
    setCapturedImages([]);
    onImagesChange([]);
    mandatoryFieldRef?.current?.[fieldValue]?.clear?.();
    return;
  }
  if (Array.isArray(savedImages)) {
    setCapturedImages(savedImages);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [reset, savedImages]);

const pickImage = async () => {
  console.log("[Capture] pickImage start", { fieldValue, singleImageCapture });
  const mediaTypes = getMediaTypesProp();

  const result = await ImagePicker.launchImageLibraryAsync({
    ...mediaTypes,
    base64: Platform.OS === "web",
    quality: 0.9,
  });

  console.log("[Capture] pickImage result", {
    canceled: result.canceled,
    assetsLen: result.assets?.length,
    asset0: result.assets?.[0]
      ? {
          uri: result.assets[0].uri,
          hasBase64: !!result.assets[0].base64,
          type: result.assets[0].type,
        }
      : null,
  });

  if (!result.canceled && result.assets?.length > 0) {
    const a = result.assets[0];
    const chosen =
      Platform.OS === "web" && a.base64
        ? `data:image/jpeg;base64,${a.base64}`
        : a.uri;

    const next = singleImageCapture ? [chosen] : [...capturedImages, chosen];
    console.log("[Capture] pickImage chosen", {
      chosen: chosen?.slice(0, 60),
      nextCount: next.length,
    });
    updateImages(next);
  }
};

const captureImage = async () => {
  console.log("[Capture] captureImage start", { fieldValue, singleImageCapture });
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert("Camera Permission Denied", "Please allow camera access to take photos.");
    return;
  }

  const mediaTypes = getMediaTypesProp();
  const result = await ImagePicker.launchCameraAsync({
    ...mediaTypes,
    base64: Platform.OS === "web",
    quality: 0.9,
  });

  console.log("[Capture] captureImage result", {
    canceled: result.canceled,
    assetsLen: result.assets?.length,
  });

  if (!result.canceled && result.assets?.length > 0) {
    const a = result.assets[0];
    const taken =
      Platform.OS === "web" && a.base64
        ? `data:image/jpeg;base64,${a.base64}`
        : a.uri;

    const next = singleImageCapture ? [taken] : [...capturedImages, taken];
    console.log("[Capture] captureImage taken", {
      taken: taken?.slice(0, 60),
      nextCount: next.length,
    });
    updateImages(next);
  }
};

// const removeImage = (index: number) => {
//   const next = capturedImages.filter((_, i) => i !== index);
//   console.log("[Capture] removeImage()", {
//     fieldValue,
//     removeIndex: index,
//     before: capturedImages.length,
//     after: next.length,
//   });
//   // IMPORTANT: keep local state in sync…
//   setCapturedImages(next);
//   // …and let the parent do the authoritative removal:
//   onImageDelete(index);
// };

const removeImage = (index: number) => {
  // Do NOT change local state here.
  // Ask parent to confirm; parent will either:
  //  - cancel → leave images untouched, or
  //  - confirm → update its state, which will flow back via `savedImages`.
  onImageDelete(index);
};

  return (
    <View style={styles.container}>
      {!isView && (
        <View style={styles.controls}>
          {allowGallery && (!singleImageCapture || capturedImages.length < 1) && (
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

      <ScrollView contentContainerStyle={styles.imagePreviewContainer}>
        {capturedImages.length > 0 && (
          <ScrollView contentContainerStyle={styles.imageList}>
            {capturedImages.map((img, index) => {
              const uri = toDisplayUri(img);
              return (
                <View key={`${index}-${uri}`} style={styles.imageWrapper}>
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
  container: { flex: 1 },
  controls: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 12 },
  iconButton: { alignItems: "center", marginHorizontal: 10 },
  label: { fontSize: 14, marginTop: 4, color: "#333" },
  imagePreviewContainer: { flexDirection: "row", flexWrap: "wrap", padding: 10, justifyContent: "flex-start" },
  imageList: { flexDirection: "row", flexWrap: "wrap", gap: 12, padding: 10 },
  imageWrapper: { position: "relative", margin: 5, width: 150, height: 150 },
  image: { width: "100%", height: "100%", borderWidth: 2, borderColor: "#000", borderRadius: 8 },
  removeButton: {
    position: "absolute", top: -10, right: -10, backgroundColor: "#fff",
    borderColor: "#ff0000", borderWidth: 2, borderRadius: 12, width: 24, height: 24,
    alignItems: "center", justifyContent: "center", zIndex: 10,
  },
  removeText: { color: "#ff0000", fontSize: 14, fontWeight: "bold" },
});

export default Capture;
