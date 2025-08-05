// screens/PropertyDetailsScreen.tsx
// import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import {
  DOOR_INSPECTION_API,
  GET_CLINET_ID_API,
  GET_PROPERTY_COMPLIANCE_SUMMARY,
  GET_PROPERTY_INFO_WITH_MASTER,
  GET_PROPERTY_USER_MAPPING,
  UPDATE_PROPERTY_USER_MAPPING_STATUS,
} from "../../components/api/apiPath";

import http from "../../components/api/server";
import DataGridTable from "../../components/common/DataGridTable"; // adjust path if needed
import Footer from "../../components/common/Footer";
import { Statuses, UserRoles } from "../../components/common/constants";

import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome"; // or Feather, MaterialIcons, etc.

const PropertyDetailsScreen = () => {
  const route = useRoute<any>();
  //   const route = useRoute();
  const { propertyId } = route.params;
  // const { propertyId } = useLocalSearchParams();
  const navigation = useNavigation();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  //   const { propertyId } = route.params as { propertyId: string };

  const { userObj } = useSelector((state: any) => state.user);
  const [loading, setLoading] = useState(true);
  const [complianceData, setComplianceData] = useState<any>(null);
  const [propertyInfo, setPropertyInfo] = useState<any>(null);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [inspectorInspectionStatus, setInspectorInspectionStatus] =
    useState(null);
  const [propertyUserRoleMappingId, setPropertyUserRoleMappingId] = useState<
    string | null
  >(null);
  const [showDownload, setShowDownload] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // console.log("Fetching client info...");
        const clientRes = await http.get(
          `${GET_CLINET_ID_API}/${userObj.userId}`
        );
        setUserRole(clientRes.data.roleId);

        // console.log("Fetching compliance summary...");
        const complianceRes = await http.get(
          `${GET_PROPERTY_COMPLIANCE_SUMMARY}?propertyMasterId=${propertyId}`
        );
        setComplianceData(complianceRes.data);

        // console.log("Fetching property info...");
        const infoRes = await http.get(
          `${GET_PROPERTY_INFO_WITH_MASTER}${propertyId}`
        );
        setPropertyInfo(infoRes.data.inspectionPropertyInfo);

        // console.log("Fetching user mapping...");
        const mappingRes = await http.get(
          `${GET_PROPERTY_USER_MAPPING}${propertyId}`
        );
        const mapping = mappingRes.data.find(
          (d: any) => String(d.userId) === String(userObj.userId)
        );
        if (!mapping) {
          Alert.alert(
            "Access Denied",
            "You are not assigned to this property.",
            [{ text: "OK", onPress: () => navigation.goBack() }]
          );
          return;
        }

        setInspectorInspectionStatus(mapping.status);
        setPropertyUserRoleMappingId(mapping.propertyUserRoleMappingId);

        // console.log("✅ All data fetched successfully");
      } catch (err) {
        console.error("❌ Error fetching details:", err);
        Alert.alert("Error", "Failed to load property details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, []);

  const paginatedDoorDetails = complianceData?.doorComplianceDetails
    ?.sort(
      (a: any, b: any) =>
        new Date(b.doorInspectionDate).getTime() -
        new Date(a.doorInspectionDate).getTime()
    )
    ?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [searchText, setSearchText] = useState("");

  const filteredDoors = complianceData?.doorComplianceDetails?.filter(
    (item: any) =>
      item.doorRefNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.doorType?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.comments?.toLowerCase().includes(searchText.toLowerCase())
  );

  const totalPages = Math.ceil((filteredDoors?.length || 0) / itemsPerPage);
  const paginatedDoors = filteredDoors?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // const totalPages = Math.ceil(
  //   complianceData?.doorComplianceDetails?.length / itemsPerPage
  // );

  const submitForApproval = async () => {
    try {
      await http.put(
        `${UPDATE_PROPERTY_USER_MAPPING_STATUS}${propertyUserRoleMappingId}`,
        {
          propertyUserRoleMappingId,
          status: Statuses.COMPLETED,
          propertyMasterId: propertyId,
        }
      );
      Alert.alert("Success", "Survey submitted for approval");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", "Submission failed");
    }
  };

  const handleDownload = async () => {
    try {
      const res = await http.get(DOOR_INSPECTION_API, {
        params: { propertyId },
        responseType: "blob",
      });

      const file = new Blob([res.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      Linking.openURL(fileURL);
    } catch (err) {
      Alert.alert("Error", "Failed to download PDF");
    }
  };

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScrollView>
          {/* {(userRole === UserRoles.ADMIN || userRole === UserRoles.APPROVER) &&
            propertyInfo?.status === Statuses.COMPLETED && (
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#ffff",
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 6,
                  marginTop: 10,
                  marginBottom: 10,
                }}
                onPress={handleDownload}
              >
                <Icon
                  name="download"
                  size={20}
                  color="black"
                  style={{ marginRight: 8 }}
                />
                <Text style={{ color: "black", fontSize: 16 }}>
                  Download Report
                </Text>
              </TouchableOpacity>
            )} */}

          <View style={styles.card}>
            <Text style={styles.headerText}>
              {complianceData?.propertyName || "Property Name"}
            </Text>
            <Text>
              <Text style={styles.bold}>Location:</Text>{" "}
              {complianceData?.propertyLocation}
            </Text>
            <Text>
              <Text style={styles.bold}>Inspectors:</Text>{" "}
              {complianceData?.inspectors}
            </Text>
            <Text>
              <Text style={styles.bold}>Status:</Text>{" "}
              {complianceData?.propertyStatus === Statuses.INREVIEW
                ? "In Progress"
                : complianceData?.propertyStatus}
            </Text>
            <Text>
              <Text style={styles.bold}>Submitted Date:</Text>{" "}
              {new Date(complianceData?.submittedDate).toLocaleDateString()}
            </Text>
            {/* {isCompleted && (
          <Text><Text style={styles.bold}>Approval Date:</Text> {new Date(complianceData?.approvalDate).toLocaleDateString()}</Text>
        )} */}

            {(userRole === UserRoles.ADMIN ||
              userRole === UserRoles.APPROVER) &&
              propertyInfo?.status === Statuses.COMPLETED && (
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    alignItems: "flex-end",
                    backgroundColor: "#ffffff",
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 6,
                    marginTop: 10,
                    marginBottom: 10,
                  }}
                  onPress={handleDownload}
                >
                  <Icon
                    name="download"
                    size={20}
                    color="blue"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{ color: "blue", fontSize: 16 }}>
                    Download Report
                  </Text>
                </TouchableOpacity>
              )}
          </View>
          <ScrollView style={styles.container}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Compliance Summary</Text>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>
                    {complianceData?.totalDoors}
                  </Text>
                  <Text style={styles.statLabel}>Total Doors</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={[styles.statNumber, { color: "green" }]}>
                    {complianceData?.compliantCount}
                  </Text>
                  <Text style={styles.statLabel}>Compliant</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={[styles.statNumber, { color: "red" }]}>
                    {complianceData?.nonCompliantCount}
                  </Text>
                  <Text style={styles.statLabel}>Non-Compliant</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>
                    {complianceData?.criticalNonComplianceCount}
                  </Text>
                  <Text style={styles.statLabel}>Critical Issues</Text>
                </View>
              </View>

              <View style={{ marginTop: 12 }}>
                <Text style={styles.smallLabel}>
                  Overall Compliance Rate :{" "}
                  {isNaN(complianceData?.complianceRate)
                    ? complianceData?.complianceRate
                    : Math.round(Number(complianceData?.complianceRate))}
                  %
                </Text>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${complianceData?.complianceRate ?? 0}%` },
                    ]}
                  />
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Door Surveys</Text>

              {/* <TextInput
                placeholder="Search by Ref, Type or Comments"
                value={searchText}
                onChangeText={(text) => {
                  setSearchText(text);
                  setCurrentPage(1); // reset to page 1 on search
                }}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  marginBottom: 10,
                }}
              /> */}

              {paginatedDoorDetails?.length > 0 ? (
                <>
                  {/* 🔄 Horizontal Scroll wrapper for table */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                    <View style={{ minWidth: 700 }}>
                      <DataGridTable
                        tableData={paginatedDoorDetails.map((item: any) => ({
                          doorRefNumber: item.doorRefNumber,
                          doorType: item.doorType,
                          fireRating: item.fireRating || "-",
                          compliance: item.isCompliant,
                          comments: item.comments,
                        }))}
                        userRole={userRole}
                        inspectorInspectionStatus={inspectorInspectionStatus}
                        propertyInfo={propertyInfo}
                      />
                    </View>
                  </ScrollView>

                  {/* 🔁 Pagination */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 12,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <Text
                        style={{
                          color: currentPage === 1 ? "#aaa" : "#007bff",
                        }}
                      >
                        ← Prev
                      </Text>
                    </TouchableOpacity>

                    <Text>
                      Page {currentPage} of {totalPages}
                    </Text>

                    <TouchableOpacity
                      onPress={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <Text
                        style={{
                          color:
                            currentPage === totalPages ? "#aaa" : "#007bff",
                        }}
                      >
                        Next →
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <Text style={{ marginTop: 10 }}>
                  No door survey data available.
                </Text>
              )}
            </View>

            {userRole === UserRoles.INSPECTOR &&
              inspectorInspectionStatus !== Statuses.COMPLETED && (
                <Button
                  title="Submit for Approval"
                  onPress={submitForApproval}
                />
              )}

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[
                styles.button,
                {
                  backgroundColor: "#ffffff", // white background
                  marginTop: 30,
                  marginBottom: 20,
                  paddingVertical: 14,
                  borderRadius: 8,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                  borderWidth: 1, // black border
                  borderColor: "#000000",
                },
              ]}
              // onPress={handleSubmit}
            >
              <Text
                style={{ color: "#000000", fontSize: 16, fontWeight: "600" }}
              >
                Back
              </Text>
            </TouchableOpacity>
          </ScrollView>
          {/* <View style={{ marginTop: 20 }}>
        <Button
          title="Back"
          onPress={() => navigation.goBack()}
        />
      </View> */}

          <Footer />
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    backgroundColor: "#f2f2f2",
    flex: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
    color: "#000",
  },
  bold: {
    fontWeight: "bold",
    color: "#000",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statBox: {
    width: "48%",
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111",
  },
  statLabel: {
    fontSize: 14,
    textAlign: "center",
    color: "#555",
  },
  smallLabel: {
    fontSize: 13,
    color: "#333",
    marginBottom: 6,
  },
  progressBarBackground: {
    height: 8,
    width: "100%",
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginTop: 4,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: "#4caf50",
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    color: "#fff",
    fontWeight: "bold",
    minWidth: 120,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  tableCell: {
    minWidth: 120,
    paddingHorizontal: 4,
  },
  iconCell: {
    width: 100,
    textAlign: "center",
    fontSize: 16,
  },
  button: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#fff",
  },
});

export default PropertyDetailsScreen;
