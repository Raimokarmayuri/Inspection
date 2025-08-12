import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Sidebar: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Dashboard */}
      <TouchableOpacity style={styles.navItem}>
        <FontAwesome5 name="home" size={18} style={styles.icon} />
        <Text style={styles.navText}>Dashboard</Text>
      </TouchableOpacity>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>ACCOUNT PAGES</Text>

      {/* Profile */}
      <TouchableOpacity style={styles.navItem}>
        <FontAwesome5 name="user" size={18} style={styles.icon} />
        <Text style={styles.navText}>Profile</Text>
      </TouchableOpacity>

      {/* My Bookings */}
      <TouchableOpacity style={styles.navItem}>
        <FontAwesome5 name="calendar" size={18} style={styles.icon} />
        <Text style={styles.navText}>My Bookings</Text>
      </TouchableOpacity>

      {/* Sign In */}
      <TouchableOpacity style={styles.navItem}>
        <FontAwesome5 name="file" size={18} style={styles.icon} />
        <Text style={styles.navText}>Sign In</Text>
      </TouchableOpacity>

      {/* Sign Up */}
      <TouchableOpacity style={styles.navItem}>
        <FontAwesome5 name="rocket" size={18} style={styles.icon} />
        <Text style={styles.navText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Help Section */}
      <View style={styles.helpCard}>
        <FontAwesome5 name="question-circle" size={22} style={styles.helpIcon} />
        <Text style={styles.helpTitle}>Need help?</Text>
        <Text style={styles.helpSubtitle}>Please check our docs</Text>

        <TouchableOpacity style={styles.docButton}>
          <Text style={styles.docButtonText}>DOCUMENTATION</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  icon: {
    marginRight: 10,
  },
  navText: {
    fontSize: 16,
    fontWeight: "500",
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  helpCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  helpIcon: {
    marginBottom: 8,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  helpSubtitle: {
    fontSize: 12,
    color: "#777",
    marginBottom: 12,
  },
  docButton: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  docButtonText: {
    fontWeight: "600",
  },
});

export default Sidebar;
