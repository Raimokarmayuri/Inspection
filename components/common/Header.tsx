// // components/Header.tsx
// import { CommonActions, useNavigation } from "@react-navigation/native";
// import React, { useEffect } from "react";
// import {
//   Alert,
//   Image,
//   Platform,
//   StyleSheet,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { Text } from "react-native-paper";
// import Icon from "react-native-vector-icons/FontAwesome";
// import { useDispatch, useSelector } from "react-redux";
// import { clearUser } from "../../components/slices/userSlice";

// type HeaderProps = {
//   isSidebarOpen: boolean;
//   onToggleSidebar: () => void;
// };

// const Header: React.FC<HeaderProps> = ({ isSidebarOpen, onToggleSidebar }) => {
//   const dispatch = useDispatch();
//   const navigation = useNavigation<any>();
//   const { userObj } = useSelector((s: any) => s.user);

//   useEffect(() => {
//     if (!userObj) {
//       if (Platform.OS === "web") {
//         window.location.assign("/");
//       } else {
//         navigation.dispatch(
//           CommonActions.reset({
//             index: 0,
//             routes: [{ name: "index" }],
//           })
//         );
//       }
//     }
//   }, [userObj, navigation]);

//   const handleConfirmLogout = () => {
//     dispatch(clearUser());
//   };

//   const handleLogout = () => {
//     Alert.alert("Log out", "Are you sure you want to log out?", [
//       { text: "Cancel", style: "cancel" },
//       { text: "Log out", style: "destructive", onPress: handleConfirmLogout },
//     ]);
//   };

//   if (!userObj) return null;

//   return (
//     <View style={styles.navbar}>
//       {/* Menu toggle */}
//       <TouchableOpacity
//         onPress={onToggleSidebar}
//         accessibilityRole="button"
//         accessibilityLabel="Toggle menu"
//         hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
//       >
//         <Text style={styles.toggle}>{isSidebarOpen ? "✕" : "☰"}</Text>
//       </TouchableOpacity>

//       {/* Logo */}
//       <Image
//         source={require("../../assets/img/logo-Photoroom.png")}
//         style={styles.logo}
//       />

//       {/* Right section */}
//       <View style={styles.rightSection}>
//         <Image
//           source={
//             userObj.imageUrl
//               ? { uri: userObj.imageUrl }
//               : require("../../assets/img/UserImage.png")
//           }
//           style={styles.avatar}
//         />
//         <Text style={styles.userName} numberOfLines={1}>
//           {userObj.userName}
//         </Text>
//         <TouchableOpacity
//           onPress={handleLogout}
//           hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
//         >
//           <Icon name="sign-out" size={22} color="red" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   navbar: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     backgroundColor: "#fff",
//     borderBottomWidth: 1,
//     borderColor: "#eee",
//     zIndex: 10,
//   },
//   toggle: {
//     fontSize: 26,
//     color: "#000",
//     width: 36,
//     textAlign: "center",
//     fontWeight: "bold",
//   },
//   logo: { width: 120, height: 40, resizeMode: "contain" },
//   rightSection: {
//     flexDirection: "row",
//     alignItems: "center",
//     columnGap: 10,
//   },
//   avatar: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   userName: {
//     marginHorizontal: 8,
//     fontSize: 16,
//     color: "#333",
//     maxWidth: 140,
//     fontWeight: "500",
//   },
// });

// export default Header;
// components/common/Header.tsx
import { clearUser } from "@/components/slices/userSlice";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { Alert, Image, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import { useDispatch, useSelector } from "react-redux";

type HeaderProps = { isSidebarOpen: boolean; onToggleSidebar: () => void };

const Header: React.FC<HeaderProps> = ({ isSidebarOpen, onToggleSidebar }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const { userObj } = useSelector((s: any) => s.user);

  useEffect(() => {
    if (!userObj) {
      if (Platform.OS === "web") window.location.assign("/");
      else {
        navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "index" }] }));
      }
    }
  }, [userObj, navigation]);

const handleLogout = () => {
  Alert.alert("Log out", "Are you sure you want to log out?", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Log out",
      style: "destructive",
      onPress: () => {
        dispatch(clearUser());
        // Send them to the login screen and clear history
        router.replace("/"); // assumes app/index.tsx is your login
        // If your login is in a group, e.g. app/(auth)/index.tsx:
        // router.replace("/(auth)");
        // or router.replace("/(auth)/index");
      },
    },
  ]);
};



  if (!userObj) return null;

  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={onToggleSidebar} accessibilityRole="button" accessibilityLabel="Toggle menu">
        <Text style={styles.toggle}>{isSidebarOpen ? "✕" : "☰"}</Text>
      </TouchableOpacity>

      <Image source={require("@/assets/img/logo-Photoroom.png")} style={styles.logo} />

      <View style={styles.rightSection}>
        <Image
          source={userObj.imageUrl ? { uri: userObj.imageUrl } : require("@/assets/img/UserImage.png")}
          style={styles.avatar}
        />
        <Text style={styles.userName} numberOfLines={1}>{userObj.userName}</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Icon name="sign-out" size={22} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: "#fff", borderBottomWidth: 1, borderColor: "#eee", zIndex: 10,
  },
  toggle: { fontSize: 26, color: "#000", width: 36, textAlign: "center", fontWeight: "bold" },
  logo: { width: 120, height: 40, resizeMode: "contain" },
  rightSection: { flexDirection: "row", alignItems: "center", columnGap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: "#ddd" },
  userName: { marginHorizontal: 8, fontSize: 16, color: "#333", maxWidth: 140, fontWeight: "500" },
});

export default Header;
