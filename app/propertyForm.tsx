

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome";
import { useSelector } from "react-redux";
import {
  GET_CLINET_ID_API,
  PROPERTY_DASHBOARD_API,
} from "../components/api/apiPath";
import http from "../components/api/server";
import Footer from "../components/common/Footer";
import PropertyTile from "../components/common/PropertyTile";
import { RootState } from "../components/slices/store";

const PropertyForm = () => {
  const [propertyData, setPropertyData] = useState<any[]>([]);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");

  const [inspectionPropertyInfo, setInspectionPropertyInfo] =
    useState<any>(null);

  const userObj = useSelector((state: RootState) => state.user.userObj);
  const navigation = useNavigation<any>();

  const getSearchData = (value: string) => {
    const safeSearch = value?.toLowerCase?.() || "";

    const filteredResults = data?.propertyFields?.filter((item: any) => {
      const name = item?.propertyName;
      if (typeof name !== "string") return false;
      return name.toLowerCase().includes(safeSearch);
    });

    setPropertyData(filteredResults || []);
  };

  useEffect(() => {
    if (!searchText) {
      setPropertyData(data?.propertyFields || []);
      return;
    }

    const safeSearch = searchText.toLowerCase();
    const filteredResults = data?.propertyFields?.filter((item: any) => {
      const name = item?.propertyName;
      return (
        typeof name === "string" && name.toLowerCase().includes(safeSearch)
      );
    });

    setPropertyData(filteredResults || []);
  }, [searchText, data]);

  useEffect(() => {
    if (!userObj) return;

    const fetchData = async () => {
      try {
        const responseClient = await http.get(
          `${GET_CLINET_ID_API}/${userObj?.userId}`
        );
        setUserRole(responseClient?.data?.roleId);

        const response = await http.get(
          `${PROPERTY_DASHBOARD_API}clientId=${responseClient?.data?.clientId}&userId=${userObj.userId}`
        );

        const result = response.data;
        setData(result);
        setPropertyData(result?.propertyFields);
        setInspectionPropertyInfo(result?.InspectionPropertyInfo);
      } catch (err: any) {
        setError(err?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userObj]);

  const gotoDashboard = () => {
    navigation.navigate("Survey"); // Change this to your actual route
  };

  const handleScanDoor = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Camera permission is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
      base64: false,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const photo = result.assets[0];
      console.log("Scanned image URI:", photo.uri);
      // TODO: Use the photo (send to API, display preview, etc.)
    }
  };

  const headerMemo = useMemo(
    () => (
      <>
        <View style={styles.headerRow}>
  <TouchableOpacity style={styles.scanButton} onPress={handleScanDoor}>
    <MaterialCommunityIcons name="qrcode-scan" size={22} color="#fff" style={{ marginRight: 8 }} />
    <Text style={styles.scanButtonText}>Scan Door</Text>
  </TouchableOpacity>
</View>

        <View style={styles.summaryRow}>
          {data?.grandTotalDoors >= 0 && (
            <View style={styles.card}>
              <Text style={styles.cardIcon}>🚪</Text>
              <Text style={styles.cardValue}>{data?.grandTotalDoors}</Text>
              <Text style={styles.cardLabel}>Total Doors</Text>
            </View>
          )}
          {data?.grandTotalCompliant >= 0 && (
            <View style={styles.card}>
              <Icon name="check-circle" size={24} color="green" />
              <Text style={styles.cardValue}>{data?.grandTotalCompliant}</Text>
              <Text style={styles.cardLabel}>Compliant</Text>
            </View>
          )}
        </View>

        <View style={styles.summaryRow}>
          {data?.grandTotalNonCompliant >= 0 && (
            <View style={styles.card}>
              <Icon name="times-circle" size={24} color="orange" />
              <Text style={styles.cardValue}>
                {data?.grandTotalNonCompliant}
              </Text>
              <Text style={styles.cardLabel}>Non-Compliant</Text>
            </View>
          )}
          {data?.grandTotalCritical >= 0 && (
            <View style={styles.card}>
              <Icon name="exclamation-triangle" size={24} color="red" />
              <Text style={styles.cardValue}>{data?.grandTotalCritical}</Text>
              <Text style={styles.cardLabel}>Critical Issues</Text>
            </View>
          )}
        </View>
        <TextInput
          placeholder="Search properties"
          placeholderTextColor="#888"
          style={styles.searchInput}
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
        />
      </>
    ),
    [data, searchText]
  ); // Only re-render when data or searchText changes

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>Something went wrong!</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity onPress={() => navigation.navigate("index")}>
          <Text style={styles.link}>Go back to Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={propertyData}
        keyExtractor={(item, index) =>
          item.propertyId?.toString() || `property-${index}`
        }
        renderItem={({ item }) => (
          <PropertyTile
            data={item}
            userRole={userRole ?? 0}
            onViewProperty={(propertyId) => {
              router.push(`/propertyDetails/${propertyId}` as any);
            }}
            onStartSurvey={(propertyId) => {
              router.push(`/dashboard/${propertyId}` as any);
            }}
          />
        )}
        ListHeaderComponent={headerMemo}
        ListFooterComponent={<Footer />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
};

export default PropertyForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
   scanButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#034694",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 3,
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 10,
  },
  button: {
    flexDirection: "row", // ⬅ horizontal layout
    alignItems: "center", // ⬅ vertical alignment
    backgroundColor: "#034694",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  card: {
    width: "45%",
    padding: 12,
    backgroundColor: "#eef6ff",
    borderRadius: 10,
    alignItems: "center",
  },
  cardIcon: {
    fontSize: 22,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 4,
  },
  cardLabel: {
    fontSize: 14,
    color: "#555",
  },
  searchInput: {
    backgroundColor: "#f2f2f2",
    marginHorizontal: 0,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
    color: "#000",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 20,
    color: "red",
    fontWeight: "bold",
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
  },
  link: {
    color: "#007acc",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
