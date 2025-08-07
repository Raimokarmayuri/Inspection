
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

const QrScanner = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState("");

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const handleBarcodeScanned = (result: { data: string; type: string }) => {
    if (!scanned) {
      setScanned(true);
      setScannedData(result.data);
      console.log("Scanned data:", result.data);
    }
  };

  if (!permission) return <Text>Requesting camera permission...</Text>;
  if (!permission.granted) return <Text>No access to camera</Text>;

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={StyleSheet.absoluteFill}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />
      {scanned && (
        <View style={styles.overlay}>
          <Text style={{ color: "#fff" }}>Scanned: {scannedData}</Text>
          <Button title="Scan Again" onPress={() => setScanned(false)} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#000000aa",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});

export default QrScanner;
