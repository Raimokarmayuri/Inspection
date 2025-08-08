
// import { CameraView, useCameraPermissions } from "expo-camera";
// import React, { useEffect, useState } from "react";
// import { Button, StyleSheet, Text, View } from "react-native";

// const QrScanner = () => {
//   const [permission, requestPermission] = useCameraPermissions();
//   const [scanned, setScanned] = useState(false);
//   const [scannedData, setScannedData] = useState("");

//   useEffect(() => {
//     if (!permission) {
//       requestPermission();
//     }
//   }, [permission]);

//   const handleBarcodeScanned = (result: { data: string; type: string }) => {
//     if (!scanned) {
//       setScanned(true);
//       setScannedData(result.data);
//       console.log("Scanned data:", result.data);
//     }
//   };

//   if (!permission) return <Text>Requesting camera permission...</Text>;
//   if (!permission.granted) return <Text>No access to camera</Text>;

//   return (
//     <View style={{ flex: 1 }}>
//       <CameraView
//         style={StyleSheet.absoluteFill}
//         onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
//       />
//       {scanned && (
//         <View style={styles.overlay}>
//           <Text style={{ color: "#fff" }}>Scanned: {scannedData}</Text>
//           <Button title="Scan Again" onPress={() => setScanned(false)} />
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     position: "absolute",
//     bottom: 30,
//     left: 20,
//     right: 20,
//     backgroundColor: "#000000aa",
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//   },
// });

// export default QrScanner;
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Linking, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function QRScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        const res = await requestPermission();
        if (!res.granted) setError("Camera permission denied");
      }
    })();
  }, [permission?.granted]);

  const onBarcodeScanned = useCallback(({ data }: { data: string }) => {
  if (scanned) return;
  setScanned(true);

  console.log("Scanned QR:", data);

  if (data.startsWith("http://") || data.startsWith("https://")) {
    Linking.openURL(data).catch(err => {
      console.error("Failed to open URL:", err);
      alert(`Could not open: ${data}`);
    });
  } else {
    alert(`Scanned: ${data}`);
    // Or navigate somewhere: router.push(`/dashboard/${encodeURIComponent(data)}`)
  }
}, [scanned]);


  if (!permission) {
    return <SafeAreaView style={styles.center}><Text>Requesting camera permission…</Text></SafeAreaView>;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ marginBottom: 12 }}>We need your permission to use the camera.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
        {error ? <Text style={{ marginTop: 8, color: "red" }}>{error}</Text> : null}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        // Start broad: let it detect all formats; restrict to ["qr"] once you confirm it works.
barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={onBarcodeScanned}
        // Optional: uncomment if you want continuous autofocus
        // enableZoomGesture
      />

      {/* Simple aiming guide */}
      <View pointerEvents="none" style={styles.reticle}>
        <View style={styles.box} />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.btnText}>Close</Text>
        </TouchableOpacity>

        {scanned && (
          <TouchableOpacity style={[styles.button, { marginLeft: 10 }]} onPress={() => setScanned(false)}>
            <Text style={styles.btnText}>Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { flex: 1, backgroundColor: "#000" },
  controls: {
    position: "absolute",
    bottom: 40,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#034694",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnText: { color: "#fff", fontWeight: "600" },
  reticle: {
    position: "absolute",
    top: "25%",
    left: "10%",
    right: "10%",
    height: "30%",
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    width: "80%",
    height: "70%",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
    borderRadius: 12,
  },
});
