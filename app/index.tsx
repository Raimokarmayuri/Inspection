

import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";
import {
  CHECK_EMAIL_API,
  RESET_PASSWORD_API,
  VERIFY_OTP_API,
} from "../components/api/apiPath";
import http from "../components/api/server";
import type { AppDispatch } from "../components/slices/store";
import { loginUser } from "../components/slices/userSlice";
import loginStyles from "../components/styles/loginStyles";

type Step = "checkEmail" | "resetPassword" | "verifyOTP" | "login";

const LoginScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();

  const [step, setStep] = useState<Step>("checkEmail");
  const [email, setEmail] = useState("");
  const [isEmailExist, setIsEmailExist] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleCheckEmail = async () => {
  setLoading(true);
  setLoginError("");
  try {
    const res = await http.post(CHECK_EMAIL_API, { email });
    const { passwordSet } = res.data;
    if (passwordSet) {
      setStep("login");
    } else {
      setStep("resetPassword");
    }
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Email not found or server error.";
    setIsEmailExist(false);
    setLoginError(message);
    Toast.show({ type: "error", text1: "Check Email", text2: message });
  } finally {
    setLoading(false);
  }
};


  const handleResetPassword = async () => {
    if (password.length < 8 || password !== confirmPassword) {
      setLoginError("Password must be at least 8 characters and match.");
      return;
    }

    setLoading(true);
    try {
      await http.post(RESET_PASSWORD_API, { email, password });
      Toast.show({ type: "success", text1: "Password reset. Enter OTP." });
      setStep("verifyOTP");
    } catch (err: any) {
      setLoginError(err?.response?.data?.message || "Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const enteredOTP = otp.join("").trim();

    if (enteredOTP.length !== 6 || !/^\d{6}$/.test(enteredOTP)) {
      setLoginError("Please enter a valid 6-digit OTP");
      return;
    }

    if (!email || !password) {
      setLoginError("Missing email or password");
      return;
    }

    setLoading(true);
    try {
      const response = await http.post(VERIFY_OTP_API, {
        email,
        otp: enteredOTP,
        password,
      });

      Toast.show({ type: "success", text1: "OTP verified successfully" });
      setStep("login");
    } catch (error: any) {
      const errMsg =
        error?.response?.data?.message || "OTP verification failed. Try again.";
      setLoginError(errMsg);
      setOtp(["", "", "", "", "", ""]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setLoginError("");
    dispatch(loginUser({ email, password }))
      .unwrap()
      .then(() => {
        Toast.show({ type: "success", text1: "Login Successful" });
        setEmail("");
        setPassword("");
        navigation.navigate("propertyForm");
      })
      .catch((err: any) => {
        setLoginError(err);
        Toast.show({ type: "error", text1: "Login Failed", text2: err });
      })
      .finally(() => setLoading(false));
  };

  const renderStepContent = () => {
    switch (step) {
      case "checkEmail":
        return (
          <>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setIsEmailExist(true);
              }}
              style={loginStyles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {!isEmailExist && (
              <Text style={loginStyles.error}>Email not found</Text>
            )}
            <TouchableOpacity
              onPress={handleCheckEmail}
              style={loginStyles.loginBtn}
            >
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text style={loginStyles.loginBtnText}>Next</Text>
              )}
            </TouchableOpacity>
          </>
        );

      case "resetPassword":
        return (
          <>
            <TextInput
              placeholder="New Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={loginStyles.input}
            />
            <TextInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              style={loginStyles.input}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
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
              onPress={handleResetPassword}
              style={loginStyles.loginBtn}
            >
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text style={loginStyles.loginBtnText}>Reset Password</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setStep("checkEmail")}
              style={{ marginTop: 16 }}
            >
              <Text style={loginStyles.forgot}>← Back to Email Check</Text>

            </TouchableOpacity>
          </>
        );

      case "verifyOTP":
        return (
          <>
            <Text style={{ textAlign: "center", marginBottom: 8 }}>
              Enter the 6-digit OTP sent to {email}
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <View style={loginStyles.otpBox}>
                {otp.map((value, idx) => (
                  <TextInput
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    style={loginStyles.otpInput}
                    maxLength={1}
                    keyboardType="numeric"
                    value={value}
                    placeholder="•"
                    placeholderTextColor="#888"
                    onChangeText={(text) => {
                      const newOtp = [...otp];
                      newOtp[idx] = text;
                      setOtp(newOtp);
                      if (text && idx < 5) {
                        inputRefs.current[idx + 1]?.focus();
                      }
                    }}
                  />
                ))}
              </View>
            </View>
            {loginError && (
              <Text style={[loginStyles.error, { textAlign: "center" }]}>
                {loginError}
              </Text>
            )}
            <TouchableOpacity
              onPress={handleVerifyOTP}
              style={loginStyles.loginBtn}
            >
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text style={loginStyles.loginBtnText}>Verify OTP</Text>
              )}
            </TouchableOpacity>
          </>
        );

      case "login":
        return (
          <>
          <SafeAreaProvider>
            <ScrollView>
            <TextInput
              placeholder="Email"
                placeholderTextColor="#888" 
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              style={loginStyles.input}
            />
            <TextInput
              placeholder="Password"
                placeholderTextColor="#888" 
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={loginStyles.input}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={loginStyles.forgot}
            >
              <Text style={loginStyles.forgot}>
                {showPassword ? "Hide" : "Show"} Password
              </Text>
            </TouchableOpacity>

            {loginError && <Text style={loginStyles.error}>{loginError}</Text>}

            <TouchableOpacity
              onPress={handleLogin}
              style={loginStyles.loginBtn}
            >
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text style={loginStyles.loginBtnText}>Log In</Text>
              )}
            </TouchableOpacity>

            {/* ✅ Add Reset + Switch account */}
            <View style={loginStyles.row}>
              <TouchableOpacity
                onPress={() => setStep("resetPassword")}
                style={{ marginTop: 16 }}
              >
                <Text style={loginStyles.forgot}>Reset your password</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setStep("checkEmail")}
                style={{ marginTop: 16 }}
              >
                <Text style={loginStyles.forgot}>
                  Sign in to a different account
                </Text>
              </TouchableOpacity>
            </View>
            </ScrollView>
          </SafeAreaProvider>
          </>
        );

      default:
        return null;
    }
  };

  return (
   <SafeAreaView style={loginStyles.safe} >
    <KeyboardAvoidingView
      style={loginStyles.kav}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
    >
      <ScrollView
        contentContainerStyle={loginStyles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={loginStyles.card}>
          <View style={loginStyles.logoContainer}>
            <Image
              source={require("../assets/img/Logo.png")}
              style={loginStyles.logo}
              contentFit="contain"
            />
            <Text style={loginStyles.loginHeading}>Inspectra</Text>
            <Text style={loginStyles.loginSub}>Sign in to continue</Text>
          </View>

          <View style={loginStyles.form}>
            {renderStepContent()}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    <Toast />
  </SafeAreaView>
);

};

export default LoginScreen;
