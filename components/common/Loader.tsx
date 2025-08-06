import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

interface LoaderProps {
  active?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ active = true }) => {
  if (!active) return null;

  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color="#007acc" />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
});

export default Loader;
