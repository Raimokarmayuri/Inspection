
// //
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Statuses, UserRoles } from "../../components/common/constants";

interface TableRowData {
  doorRefNumber: string;
  doorType: string;
  fireRating: string;
  compliance: string;
  comments?: string;
  id: number;
}

interface DataGridTableProps {
  tableData: TableRowData[];
  userRole: number | null;
  inspectorInspectionStatus: string | null;
  propertyInfo: {
    status: string;
  };
}

export default function DataGridTable({
  tableData,
  userRole,
  inspectorInspectionStatus,
  propertyInfo,
}: DataGridTableProps) {
  const router = useRouter();
  const [userList, setUserList] = useState<TableRowData[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const payload = tableData.map((item, index) => ({
      ...item,
      id: item.id ?? index + 1,
    }));
    setUserList(payload);
  }, [tableData]);

  // const gotoDashBoard = (drn: string, field: "view" | "edit") => {
  //   router.push(`/viewSurvey/${drn}` as any);
  // };
  const params = useLocalSearchParams();
const mode = params.mode?.toString(); // Can be "view" or "edit"

  const gotoDashBoard = (drn: string, mode: "view" | "edit") => {
  router.push({
    pathname: "/viewSurvey/[doorRefNumber]",
    params: {
      doorRefNumber: drn,
      mode,
    },
  });
};

console.log("Navigation Mode:", mode);

  const shouldShowEditColumn =
    userRole === UserRoles.INSPECTOR &&
    inspectorInspectionStatus !== Statuses.COMPLETED &&
    (propertyInfo?.status === Statuses.REJECTED ||
      propertyInfo?.status === Statuses.INREVIEW ||
      propertyInfo?.status === Statuses.INPROGRESS);

  const filteredList = userList.filter((item) =>
    item.doorRefNumber.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: TableRowData }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.doorRefNumber}</Text>
      <Text style={styles.cell}>{item.doorType}</Text>
      <Text style={styles.cell}>
        {item.fireRating === "Select" ? "-" : item.fireRating}
      </Text>
      <Text style={styles.cell}>
        <Text>
          <Text
            style={
              item.compliance === "Compliant"
                ? styles.greenDot
                : styles.orangeDot
            }
          >
            ●{" "}
          </Text>
          {item.compliance}
        </Text>
        {/* <Text>{item.compliance}</Text> */}
        {/* <Text>{item.compliance ? "Compliant" : "Non-Compliant"}</Text> */}
      </Text>
      <Text style={styles.cell}>{item.comments || "-"}</Text>
      <TouchableOpacity
        onPress={() => gotoDashBoard(item.doorRefNumber, "view")}
      >
        <MaterialIcons name="visibility" size={20} color="black" />
      </TouchableOpacity>
      {shouldShowEditColumn && (
        <TouchableOpacity
          onPress={() => gotoDashBoard(item.doorRefNumber, "edit")}
        >
          <MaterialIcons name="edit" size={20} color="black" />
        </TouchableOpacity>
        )} 
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search Door Reference..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />
      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListHeaderComponent={() => (
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.headerText]}>Door Ref</Text>
            <Text style={[styles.cell, styles.headerText]}>Type</Text>
            <Text style={[styles.cell, styles.headerText]}>Fire</Text>
            <Text style={[styles.cell, styles.headerText]}>Compliance</Text>
            <Text style={[styles.cell, styles.headerText]}>Comments</Text>
            <Text style={[styles.cell, styles.headerText]}>View</Text>
            {shouldShowEditColumn && (
              <Text style={[styles.cell, styles.headerText]}>Edit</Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingVertical: 8,
    alignItems: "center",
  },
  headerRow: {
    backgroundColor: "#f1f1f1",
    borderBottomWidth: 2,
  },
  cell: {
    flex: 1,
    paddingHorizontal: 4,
    fontSize: 14,
  },
  headerText: {
    fontWeight: "bold",
  },
  greenDot: {
    color: "green",
    fontSize: 16, // You can increase this if it's too small
    marginRight: 4,
  },

  orangeDot: {
    color: "orange",
    fontSize: 16,
    marginRight: 4,
  },
});
