import { Ionicons } from "@expo/vector-icons"; // or FontAwesome5
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Sidebar: React.FC = () => {
  return (
    <View style={styles.sidebar}>
      <TouchableOpacity style={styles.menuItem}>
        <Ionicons name="home" size={20} color="#333" />
        <Text style={styles.menuText}>Dashboard</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Account Pages</Text>

      <TouchableOpacity style={styles.menuItem}>
        <Ionicons name="person" size={20} color="#333" />
        <Text style={styles.menuText}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <Ionicons name="log-in" size={20} color="#333" />
        <Text style={styles.menuText}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <Ionicons name="rocket" size={20} color="#333" />
        <Text style={styles.menuText}>Sign Up</Text>
      </TouchableOpacity>

      <View style={styles.helpBox}>
        <Ionicons name="help-circle" size={24} color="#007acc" />
        <Text style={styles.helpTitle}>Need help?</Text>
        <Text style={styles.helpText}>Please check our docs</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>DOCUMENTATION</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
  sectionTitle: {
    fontWeight: "bold",
    marginVertical: 16,
    fontSize: 14,
    color: "#666",
  },
  helpBox: {
    marginTop: 30,
    padding: 16,
    backgroundColor: "#e8f0ff",
    borderRadius: 10,
  },
  helpTitle: {
    marginTop: 8,
    fontWeight: "600",
    fontSize: 16,
  },
  helpText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007acc",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default Sidebar;
