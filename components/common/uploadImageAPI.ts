import { hostName } from "../config/config"; // adjust path as needed
import { base64ToFile } from "./base64ToFile"; // adjust import path as needed

export const uploadImageAPI = async (
  newImages: string[],
  field: string,
  token: string
): Promise<string> => {
  try {
    const latestImage = newImages[newImages.length - 1];

    const file = base64ToFile(
      latestImage,
      `${field}_Image_${Date.now()}.jpg`
    );

    const formData = new FormData();
    formData.append("File", file as any); // ✅ React Native needs `as any` for FormData
    formData.append("Client", "ABC");
    formData.append("Property", "Candor");
    formData.append("InspectionDate", new Date().toISOString());

    const response = await fetch(`${hostName}api/Inspection/upload`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
        // Do NOT set Content-Type manually for FormData in React Native
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data?.result?.blobUrl || "";
  } catch (error) {
    console.error("❌ uploadImageAPI error:", error);
    return "";
  }
};
