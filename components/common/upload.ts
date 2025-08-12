import * as FileSystem from "expo-file-system";

/** Guess MIME from file extension */
const guessMimeFromName = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
};

/** Convert base64 data URL into a temp file URI RN can upload */
async function base64DataUrlToFileUri(dataUrl: string): Promise<{ uri: string; name: string; type: string }> {
  const match = dataUrl.match(/^data:(.+?);base64,(.*)$/);
  const type = match?.[1] || "image/jpeg";
  const base64 = match?.[2] || dataUrl.replace(/^data:.+;base64,/, "");
  const name = `Upload_${Date.now()}.${type.includes("png") ? "png" : "jpg"}`;
  const path = FileSystem.cacheDirectory + name;
  await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
  return { uri: path, name, type };
}

/** Works for both base64 and file:// paths */
async function normaliseForUpload(src: string, field: string): Promise<{ uri: string; name: string; type: string }> {
  if (src.startsWith("data:image/")) {
    return base64DataUrlToFileUri(src);
  }
  // It's already a file URI
  const name = `${field}_Image_${Date.now()}.jpg`;
  return { uri: src, name, type: guessMimeFromName(name) };
}
