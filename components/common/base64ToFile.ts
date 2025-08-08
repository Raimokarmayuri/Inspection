import { Platform } from "react-native";

export const base64ToFile = (base64: string, filename: string): any => {
  const arr = base64.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  if (Platform.OS === "web") {
    return new File([u8arr], filename, { type: mime });
  } else {
    // For React Native FormData
    return {
      uri: base64,
      name: filename,
      type: mime,
    };
  }
};
