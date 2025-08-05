import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../components/slices/store";
import { loginUser } from "../../components/slices/userSlice";
import loginStyles from "../../components/styles/loginStyles";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const navigation = useNavigation<any>();

  const handleLogin = async () => {
    setLoading(true);
    setLoginError("");

    dispatch(loginUser({ email, password }))
      .unwrap()
      .then((res) => {
        console.log("Login Success Payload:", res); // ⬅️ Add this
  Toast.show({
    type: "success",
    text1: "Login Successful",
  });
  alert("login successfull")
        setEmail("");
        setPassword("");
        // console.log("Login Response:", res);
        navigation.navigate("PropertyForm")
      })
      .catch((err: any) => {
        setLoginError(err);
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: err,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    // <ImageBackground
    //   source={require("../assets/img/bg.jpg")}
    //   style={loginStyles.background}
    //   resizeMode="cover"
    // >
    <SafeAreaView style={loginStyles.background}>
      <View style={loginStyles.overlay} />
      <KeyboardAvoidingView
        style={loginStyles.content}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={loginStyles.logoContainer}>
          <Image
            source={require("../../assets/img/Logo.png")}
            style={loginStyles.logo}
            resizeMode="contain"
          />
          <Text style={loginStyles.loginHeading}>Inspectra</Text>
          {/* <Text style={loginStyles.loginSub}>Welcome back! Please login to continue</Text> */}
        </View>

        <View style={loginStyles.form}>
          <TextInput
            placeholder="UserName"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={loginStyles.input}
            placeholderTextColor="#666666"
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={loginStyles.input}
            placeholderTextColor="#666666"
          />

          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            style={loginStyles.forgot}
          >
            <Text style={loginStyles.forgot}>
              {showPassword ? "Hide" : "Show"} Password
            </Text>
          </TouchableOpacity>

          {loginError !== "" && (
            <Text style={loginStyles.error}>{loginError}</Text>
          )}

          <TouchableOpacity
            onPress={handleLogin}
            style={loginStyles.loginBtn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={loginStyles.loginBtnText}>Log In </Text>
            )}
          </TouchableOpacity>

          <View style={loginStyles.row}>
            <TouchableOpacity
              onPress={() => setRememberMe(!rememberMe)}
              style={loginStyles.checkboxContainer}
            >
              <Ionicons
                name={rememberMe ? "checkbox" : "square-outline"}
                size={24}
                color="#F8B133"
              />
              <Text style={loginStyles.checkboxLabel}>Remember me</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              onPress={() => navigation.navigate("ResetPassword")}
              style={{ marginTop: 16 }}
            >
              <Text style={loginStyles.forgot}>Forgot Password?</Text>
            </TouchableOpacity> */}
             <TouchableOpacity
              onPress={() => navigation.navigate("signin")}
              style={{ marginTop: 16 }}
            >
              <Text style={loginStyles.forgot}>Sign</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
    // </ImageBackground>
  );
};

export default LoginScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fdfdfd',
//   },
//   inner: {
//     flex: 1,
//     padding: 20,
//     justifyContent: 'center',
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: '600',
//     marginBottom: 30,
//     color: '#1b4f72',
//   },
//   input: {
//     height: 50,
//     borderColor: '#007acc',
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 15,
//     marginBottom: 15,
//     backgroundColor: '#fff',
//   },
//   togglePass: {
//     alignSelf: 'flex-end',
//     marginBottom: 20,
//   },
//   togglePassText: {
//     color: '#007acc',
//     fontWeight: '500',
//   },
//   button: {
//     backgroundColor: '#007acc',
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   error: {
//     color: 'red',
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   footer: {
//     marginTop: 25,
//     alignItems: 'center',
//   },
//   footerText: {
//     color: '#007acc',
//   },
// });
