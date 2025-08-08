// import { Ionicons } from "@expo/vector-icons"; // or FontAwesome5
// import React from "react";
// import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// const Sidebar: React.FC = () => {
//   return (
//     <View style={styles.sidebar}>
//       <TouchableOpacity style={styles.menuItem}>
//         <Ionicons name="home" size={20} color="#333" />
//         <Text style={styles.menuText}>Dashboard</Text>
//       </TouchableOpacity>

//       <Text style={styles.sectionTitle}>Account Pages</Text>

//       <TouchableOpacity style={styles.menuItem}>
//         <Ionicons name="person" size={20} color="#333" />
//         <Text style={styles.menuText}>Profile</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.menuItem}>
//         <Ionicons name="log-in" size={20} color="#333" />
//         <Text style={styles.menuText}>Sign In</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.menuItem}>
//         <Ionicons name="rocket" size={20} color="#333" />
//         <Text style={styles.menuText}>Sign Up</Text>
//       </TouchableOpacity>

//       <View style={styles.helpBox}>
//         <Ionicons name="help-circle" size={24} color="#007acc" />
//         <Text style={styles.helpTitle}>Need help?</Text>
//         <Text style={styles.helpText}>Please check our docs</Text>
//         <TouchableOpacity style={styles.button}>
//           <Text style={styles.buttonText}>DOCUMENTATION</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   sidebar: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//     padding: 16,
//   },
//   menuItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   menuText: {
//     marginLeft: 12,
//     fontSize: 16,
//     color: "#333",
//   },
//   sectionTitle: {
//     fontWeight: "bold",
//     marginVertical: 16,
//     fontSize: 14,
//     color: "#666",
//   },
//   helpBox: {
//     marginTop: 30,
//     padding: 16,
//     backgroundColor: "#e8f0ff",
//     borderRadius: 10,
//   },
//   helpTitle: {
//     marginTop: 8,
//     fontWeight: "600",
//     fontSize: 16,
//   },
//   helpText: {
//     fontSize: 14,
//     color: "#444",
//     marginBottom: 10,
//   },
//   button: {
//     backgroundColor: "#007acc",
//     paddingVertical: 8,
//     borderRadius: 6,
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
// });

// export default Sidebar;
// components/Sidebar.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";

export type SidebarProps = { open: boolean; onClose: () => void };

const WIDTH = 280;

export default function Sidebar({ open, onClose }: SidebarProps) {
  const tx = useRef(new Animated.Value(-WIDTH)).current;
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(tx, { toValue: open ? 0 : -WIDTH, duration: 220, useNativeDriver: true }),
      Animated.timing(op, { toValue: open ? 1 : 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [open, tx, op]);

  return (
    <>
      {/* Backdrop */}
      <Pressable
        onPress={onClose}
        pointerEvents={open ? "auto" : "none"}
        style={StyleSheet.absoluteFill}
      >
        <Animated.View style={[styles.backdrop, { opacity: op }]} />
      </Pressable>

      {/* Panel */}
      <Animated.View style={[styles.panel, { transform: [{ translateX: tx }] }]}>
        <View style={styles.sidebar}>
          <MenuItem icon="home" label="Dashboard" />

          <SectionTitle>Account Pages</SectionTitle>

          <MenuItem icon="person" label="Profile" />
          <MenuItem icon="log-in" label="Sign In" />
          <MenuItem icon="rocket" label="Sign Up" />

          <View style={styles.helpBox}>
            <Ionicons name="help-circle" size={24} color="#007acc" />
            <TextSemi style={styles.helpTitle}>Need help?</TextSemi>
            <TextReg style={styles.helpText}>Please check our docs</TextReg>
            <Pressable style={styles.button}>
              <TextSemi style={styles.buttonText}>DOCUMENTATION</TextSemi>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </>
  );
}

const MenuItem = ({ icon, label }: { icon: React.ComponentProps<typeof Ionicons>["name"]; label: string }) => (
  <View style={styles.menuItem}>
    <Ionicons name={icon} size={20} color="#333" />
    <TextReg style={styles.menuText}>{label}</TextReg>
  </View>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <TextSemi style={styles.sectionTitle}>{children}</TextSemi>
);

const TextReg = ({ style, children }: any) => <Animated.Text style={[{ fontSize: 16, color: "#333" }, style]}>{children}</Animated.Text>;
const TextSemi = ({ style, children }: any) => <Animated.Text style={[{ fontSize: 16, color: "#111", fontWeight: "600" }, style]}>{children}</Animated.Text>;

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "#000" },
  panel: {
    position: "absolute",
    left: 0, top: 0, bottom: 0,
    width: WIDTH,
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#eee",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    zIndex: 9,
  },
  sidebar: { flex: 1, padding: 16, paddingTop: 24 },
  menuItem: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  menuText: { marginLeft: 12 },
  sectionTitle: { marginVertical: 16, fontSize: 14, color: "#666" },
  helpBox: { marginTop: 30, padding: 16, backgroundColor: "#e8f0ff", borderRadius: 10 },
  helpTitle: { marginTop: 8 },
  helpText: { fontSize: 14, color: "#444", marginBottom: 10 },
  button: { backgroundColor: "#007acc", paddingVertical: 8, borderRadius: 6, alignItems: "center" },
  buttonText: { color: "#fff" },
});
