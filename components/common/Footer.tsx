import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Footer: React.FC = () => {
  return (
    <View style={styles.footer}>
      <Text style={styles.logo}>[a]cache</Text>
      <Text style={styles.copy}>
        Copyright © 2025 Acache Technologies Private Limited. All rights reserved.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: "#121416",
    paddingVertical: 32, // roughly 2rem
    paddingHorizontal: 16,
    alignItems: "center",
  },
  logo: {
    color: "#a8ff60",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 4,
  },
  copy: {
    fontSize: 14,
    color: "#ffffff",
    textAlign: "center",
  },
});

export default Footer;
