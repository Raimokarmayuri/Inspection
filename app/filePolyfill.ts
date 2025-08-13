// filePolyfill.ts
import { Platform } from "react-native";

export const ensureWebFileCtor = () => {
  // Only ever run in web
  if (Platform.OS !== "web") return;

  const g: any = globalThis as any;
  if (typeof g.File === "undefined") {
    // Guard Blob first; older environments may not have it
    const BlobCtor = g.Blob;
    if (typeof BlobCtor === "undefined") {
      // If even Blob is missing, we can’t create a proper File.
      // Fetch->blob will still return a Blob; we’ll pass that directly.
      return;
    }
    // Define a minimal File that extends Blob
    const RNFile = function (bits: BlobPart[], name: string, options: any = {}) {
      const blob = new BlobCtor(bits, options);
      (blob as any).name = name;
      (blob as any).lastModified = options?.lastModified ?? Date.now();
      return blob as any;
    } as any;

    // Make it look like a File
    RNFile.prototype = BlobCtor.prototype;
    g.File = RNFile;
  }
};
