// // components/DataGridTable.tsx
// // import EditIcon from "@mui/icons-material/Edit";
// // import FilterListIcon from "@mui/icons-material/FilterList";
// // import ViewColumnIcon from "@mui/icons-material/ViewColumn";
// // import VisibilityIcon from "@mui/icons-material/Visibility";
// import { MaterialIcons } from "@expo/vector-icons";
// import Badge from "@mui/material/Badge";
// import Box from "@mui/material/Box";
// import Divider from "@mui/material/Divider";
// import { styled } from "@mui/material/styles";
// import Toolbar from "@mui/material/Toolbar";
// import Tooltip from "@mui/material/Tooltip";

// import { useRouter } from "expo-router";

// import * as React from "react";

// // import { useNavigate } from "react-router-dom";
// import {
//   DataGrid,
//   GridColDef,
//   GridRenderCellParams,
//   GridToolbarQuickFilter,
// } from "@mui/x-data-grid";
// import type { NavigationProp } from "@react-navigation/native";
// import { useNavigation } from "@react-navigation/native";
// import { Statuses, UserRoles } from "../../components/common/constants";

// interface TableRowData {
//   doorRefNumber: string;
//   doorType: string;
//   fireRating: string;
//   compliance: string;
//   comments?: string;
//   id: number;
// }

// interface DataGridTableProps {
//   tableData: TableRowData[];
//   userRole: number | null;
//   inspectorInspectionStatus: string | null;
//   propertyInfo: {
//     status: string;
//   };
// }

// const StyledQuickFilter = styled(GridToolbarQuickFilter)(() => ({
//   display: "grid",
//   alignItems: "center",
// }));

// function CustomToolbar() {
//   return (
//     <Toolbar variant="dense">
//       <Tooltip title="Columns">
//         <span>
//           <MaterialIcons name="visibility" fontSize="small" />
//         </span>
//       </Tooltip>
//       <Tooltip title="Filters">
//         <span>
//           <Badge badgeContent={0} color="primary" variant="dot">
//             <MaterialIcons name="edit" fontSize="small" />
//           </Badge>
//         </span>
//       </Tooltip>
//       <Divider
//         orientation="vertical"
//         variant="middle"
//         flexItem
//         sx={{ mx: 0.5 }}
//       />
//       <StyledQuickFilter
//         quickFilterParser={(searchInput: string) =>
//           searchInput.split(",").map((value) => value.trim())
//         }
//         debounceMs={500}
//         // placeholder="Search..."
//       />
//     </Toolbar>
//   );
// }

// const DataGridTable: React.FC<DataGridTableProps> = ({
//   tableData,
//   userRole,
//   inspectorInspectionStatus,
//   propertyInfo,
// }) => {
//   const [userList, setUserList] = React.useState<TableRowData[]>([]);
//   const navigation = useNavigation<NavigationProp<any>>();
//   const router = useRouter();
//   React.useEffect(() => {
//     const payload = tableData.map((item, index) => {
//       return {
//         ...item,
//         id: item.id ?? index + 1, // Use existing id if available, otherwise index + 1
//       };
//     });
//     setUserList(payload);
//   }, [tableData]);

//   const gotoDashBoard = (drn: string, field: "view" | "edit") => {
//     if (field === "view") {
//       router.push(`/viewSurvey/${drn}`);
//     } else {
//       router.push(`/viewSurvey/${drn}`);
//     }
//   };

//   const shouldShowEditColumn =
//     userRole === UserRoles.INSPECTOR &&
//     inspectorInspectionStatus !== Statuses.COMPLETED &&
//     (propertyInfo?.status === Statuses.REJECTED ||
//       propertyInfo?.status === Statuses.INREVIEW ||
//       propertyInfo?.status === Statuses.INPROGRESS);

//   const baseColumns: GridColDef[] = [
//     {
//       field: "doorRefNumber",
//       headerName: "Door Reference",
//       width: 220,
//       // height: 50,
//       headerClassName: "super-app-theme--header",
//       editable: false,
//       type: "string",
//       minWidth: 200,
//       flex: 1,
//     },
//     {
//       field: "doorType",
//       headerName: "Type",
//       width: 180,
//       // height: 50,
//       headerClassName: "super-app-theme--header",
//       editable: false,
//       type: "string",
//       minWidth: 180,
//       flex: 1,
//     },
//     {
//       field: "fireRating",
//       headerName: "Fire Rating",
//       flex: 1,
//       minWidth: 180,
//       renderCell: (params: GridRenderCellParams) =>
//         params.value === "Select" ? "-" : params.value,
//     },
//     {
//       field: "compliance",
//       width: 180,
//       // height: 50,
//       headerName: "Compliant",
//       headerClassName: "super-app-theme--header",
//       editable: false,
//       type: "string",
//       minWidth: 180,
//       flex: 1,
//       renderCell: (data: { row: { compliance: string; }; }) => {
//         return (
//           <>
//             <span className={data?.row?.compliance === "Compliant" ? "status-dot-green"
//               : "status-dot-orange"}></span>
//             {data?.row?.compliance}
//           </>
//         );
//       },
//     },
//     {
//       field: "comments",
//       headerName: "Comments",
//       flex: 1,
//       minWidth: 180,
//       renderCell: (params: GridRenderCellParams) => <>{params.value || "-"}</>,
//     },
//     {
//       field: "view",
//       headerName: "View",
//       sortable: false,
//       flex: 0.5,
//       minWidth: 70,
//       renderCell: (params: GridRenderCellParams) => (
//        <MaterialIcons name="visibility"
//           fontSize="small"
//           style={{ cursor: "pointer" }}
//           onClick={() => gotoDashBoard(params.row.doorRefNumber, "view")}
//         />
//       ),
//     },
//   ];

//   const editColumn: GridColDef = {
//     field: "edit",
//     headerName: "Edit",
//     sortable: false,
//     flex: 0.5,
//     minWidth: 70,
//     renderCell: (params: GridRenderCellParams) => (
//       <MaterialIcons name="edit"
//         fontSize="small"
//         style={{ cursor: "pointer" }}
//         onClick={() => gotoDashBoard(params.row.doorRefNumber, "edit")}
//       />
//     ),
//   };

//   const columns = shouldShowEditColumn
//     ? [...baseColumns, editColumn]
//     : baseColumns;

//   return (
//     <Box sx={{ width: "100%" }}>
//       <DataGrid
//         rows={userList}
//         columns={columns}
//         getRowId={(row: { id: any; }) => row.id}
//         rowHeight={45}
//         columnHeaderHeight={45}
//         slots={{ toolbar: CustomToolbar }}
//         pageSizeOptions={[5, 10, 20, { value: -1, label: "All" }]}
//         initialState={{
//           pagination: { paginationModel: { pageSize: 5 } },
//         }}
//         disableColumnMenu
//         sx={{ display: "grid", boxShadow: 2, width: "100%" }}
//       />
//     </Box>
//   );
// };

// export default DataGridTable;
// //
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Statuses, UserRoles } from '../../components/common/constants';

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
  const [search, setSearch] = useState('');

  useEffect(() => {
    const payload = tableData.map((item, index) => ({
      ...item,
      id: item.id ?? index + 1,
    }));
    setUserList(payload);
  }, [tableData]);

  const gotoDashBoard = (drn: string, field: 'view' | 'edit') => {
    router.push(`/viewSurvey/${drn}` as any);
  };

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
      <Text style={styles.cell}>{item.fireRating === 'Select' ? '-' : item.fireRating}</Text>
      <Text style={styles.cell}>
        <Text style={item.compliance === 'Compliant' ? styles.greenDot : styles.orangeDot}>● </Text>
         <Text>{item.compliance}</Text>
         {/* <Text>{item.compliance ? "Compliant" : "Non-Compliant"}</Text> */}
      </Text>
      <Text style={styles.cell}>{item.comments || '-'}</Text>
      <TouchableOpacity onPress={() => gotoDashBoard(item.doorRefNumber, 'view')}>
        <MaterialIcons name="visibility" size={20} color="black" />
      </TouchableOpacity>
      {shouldShowEditColumn && (
        <TouchableOpacity onPress={() => gotoDashBoard(item.doorRefNumber, 'edit')}>
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
            {shouldShowEditColumn && <Text style={[styles.cell, styles.headerText]}>Edit</Text>}
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
    borderColor: '#ccc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 8,
    alignItems: 'center',
  },
  headerRow: {
    backgroundColor: '#f1f1f1',
    borderBottomWidth: 2,
  },
  cell: {
    flex: 1,
    paddingHorizontal: 4,
    fontSize: 14,
  },
  headerText: {
    fontWeight: 'bold',
  },
 greenDot: {
  color: "green",
  fontSize: 16,
},
orangeDot: {
  color: "orange",
  fontSize: 16,
}
});
