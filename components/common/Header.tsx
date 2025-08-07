import React from "react";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../slices/userSlice";

interface RootState {
  user: {
    userObj: {
      userName: string;
      imageUrl?: string;
    } | null;
  };
}

interface HeaderProps {
  hideSidebar: boolean;
  setHideSidebar: (value: boolean) => void;
}

// ✅ Static images (use require for React Native)
const logo = require("../../assets/img/logo-Photoroom.png");
const userIcon = require("../../assets/img/UserImage.png");

const Header: React.FC<HeaderProps> = ({ hideSidebar, setHideSidebar }) => {
  const dispatch = useDispatch();
  const { userObj } = useSelector((state: RootState) => state.user);

  // Redirect fallback
  if (!userObj) {
    window.location.href = "/";
    return null;
  }

  const toggleSidebar = () => {
    setHideSidebar(!hideSidebar);
  };

  return (
    <View style={styles.navbar}>
      {/* ☰ Menu Toggle */}
      <TouchableOpacity 
      // onPress={toggleSidebar}
      >
        <Text style={styles.toggle}>☰</Text>
      </TouchableOpacity>

      {/* Logo */}
      <Image source={logo} style={styles.logo} />

      {/* User Section */}
      <View style={styles.rightSection}>
        <Image
          source={
            userObj.imageUrl ? { uri: userObj.imageUrl } : userIcon
          }
          style={styles.avatar}
        />
        <Text style={styles.userName}>{userObj.userName}</Text>
        <TouchableOpacity onPress={() => dispatch(clearUser())}>
          <Icon name="sign-out" size={22} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  toggle: {
    fontSize: 24,
    color: "#000",
  },
  logo: {
    width: 120,
    height: 40,
    resizeMode: "contain",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userName: {
    marginHorizontal: 8,
    fontSize: 16,
    color: "#333",
  },
});

export default Header;
