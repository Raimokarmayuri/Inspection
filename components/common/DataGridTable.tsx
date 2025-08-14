import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Statuses, UserRoles } from "../../components/common/constants";

type SortDir = "asc" | "desc" | null;

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
  propertyInfo: { status: string } | null;
  initialPageSize?: number; // default 5
}

type ColKey = "doorRefNumber" | "doorType" | "fireRating" | "compliance" | "comments";
interface ColumnDef {
  key: ColKey;
  label: string;
  visible: boolean;
  width: number; // FIXED width
}

const ACTION_WIDTH = 72;
const ROW_MIN_HEIGHT = 44;

export default function DataGridTable({
  tableData,
  userRole,
  inspectorInspectionStatus,
  propertyInfo,
  initialPageSize = 5,
}: DataGridTableProps) {
  const router = useRouter();
  const params = useLocalSearchParams();

  // ----- data -----
  const [rows, setRows] = useState<TableRowData[]>([]);
  useEffect(() => {
    const payload = tableData.map((item, index) => ({
      ...item,
      id: item.id ?? index + 1,
    }));
    setRows(payload);
  }, [tableData]);

  // ----- columns (fixed widths) -----
  const [columns, setColumns] = useState<ColumnDef[]>([
    { key: "doorRefNumber", label: "Door Ref",   visible: true, width: 160 },
    { key: "doorType",      label: "Type",       visible: true, width: 120 },
    { key: "fireRating",    label: "Fire",       visible: true, width: 100 },
    { key: "compliance",    label: "Compliance", visible: true, width: 140 },
    { key: "comments",      label: "Comments",   visible: true, width: 220 },
  ]);
  const visibleColumns = columns.filter(c => c.visible);

  // ----- actions visibility -----
  const [showView, setShowView] = useState(true);
  const [showEdit, setShowEdit] = useState(true);
  const [deleteMode, setDeleteMode] = useState(false);

  const shouldShowEditColumn =
    userRole === UserRoles.INSPECTOR &&
    inspectorInspectionStatus !== Statuses.COMPLETED &&
    (propertyInfo?.status === Statuses.REJECTED ||
      propertyInfo?.status === Statuses.INREVIEW ||
      propertyInfo?.status === Statuses.INPROGRESS);

  // ----- search + search-in -----
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchIn, setSearchIn] = useState<ColKey | "all">("all");
  const [showSearchMenu, setShowSearchMenu] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDebouncedSearch(search.trim()), 200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [search]);

  const searchableCols = columns.map((c) => ({ key: c.key, label: c.label }));

  // ----- sorting -----
  const [sortBy, setSortBy] = useState<ColKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const toggleSort = (key: ColKey) => {
    if (sortBy !== key) {
      setSortBy(key);
      setSortDir("asc");
    } else {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") {
        setSortBy(null);
        setSortDir(null);
      } else setSortDir("asc");
    }
  };

  // ----- pagination -----
  const PAGE_SIZE_OPTIONS = [5, 10, 20, -1] as const; // -1 = All
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [page, setPage] = useState<number>(0);

  useEffect(() => setPage(0), [debouncedSearch, searchIn, pageSize, sortBy, sortDir, columns, showView, showEdit, deleteMode]);

  // ----- filter -> sort -> page -----
  const filtered = useMemo(() => {
    if (!debouncedSearch) return rows;
    const q = debouncedSearch.toLowerCase();
    const match = (r: TableRowData, key: ColKey) =>
      (String((r as any)[key] ?? "")).toLowerCase().includes(q);

    if (searchIn === "all") {
      return rows.filter((r) =>
        (["doorRefNumber", "doorType", "fireRating", "compliance", "comments"] as ColKey[])
          .some((k) => match(r, k))
      );
    } else {
      return rows.filter((r) => match(r, searchIn));
    }
  }, [rows, debouncedSearch, searchIn]);

  const sorted = useMemo(() => {
    if (!sortBy || !sortDir) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = (a as any)[sortBy];
      const bv = (b as any)[sortBy];
      const sa = String(av ?? "");
      const sb = String(b ?? "");
      const cmp = sa.localeCompare(sb, undefined, { sensitivity: "base", numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortBy, sortDir]);

  const paged = useMemo(() => {
    if (pageSize === -1) return sorted;
    const start = page * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  // ----- width math (single source of truth) -----
  const tableWidth =
    visibleColumns.reduce((sum, c) => sum + c.width, 0) +
    (showView ? ACTION_WIDTH : 0) +
    (showEdit && shouldShowEditColumn ? ACTION_WIDTH : 0) +
    (deleteMode ? ACTION_WIDTH : 0);

  // ----- actions -----
  const gotoDashBoard = (drn: string, mode: "view" | "edit") => {
    router.push({
      pathname: "/viewSurvey/[doorRefNumber]",
      params: { doorRefNumber: drn, mode },
    });
  };
  const deleteRow = (id: number) => setRows(prev => prev.filter(r => r.id !== id));

  // ----- header & row -----
  const HeaderRow = () => (
    <View style={[styles.row, styles.headerRow, { width: tableWidth, minHeight: ROW_MIN_HEIGHT }]}>
      {visibleColumns.map((col) => (
        <TouchableOpacity
          key={col.key}
          onPress={() => toggleSort(col.key)}
          style={[styles.headerCell, { width: col.width }]}
          activeOpacity={0.7}
        >
          <Text style={styles.headerText}>
            {col.label}
            {sortBy === col.key ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
          </Text>
        </TouchableOpacity>
      ))}
      {showView && (
        <View style={[styles.headerCell, styles.actionHeaderCell, { width: ACTION_WIDTH }]}>
          <Text style={styles.headerText}>View</Text>
        </View>
      )}
      {showEdit && shouldShowEditColumn && (
        <View style={[styles.headerCell, styles.actionHeaderCell, { width: ACTION_WIDTH }]}>
          <Text style={styles.headerText}>Edit</Text>
        </View>
      )}
      {deleteMode && (
        <View style={[styles.headerCell, styles.actionHeaderCell, { width: ACTION_WIDTH }]}>
          <Text style={styles.headerText}>Remove</Text>
        </View>
      )}
    </View>
  );

  const RowView = ({ item }: { item: TableRowData }) => (
    <View style={[styles.row, { width: tableWidth, minHeight: ROW_MIN_HEIGHT }]}>
      {visibleColumns.map((col) => {
        if (col.key === "compliance") {
          return (
            <View key={col.key} style={[styles.cellWrap, { width: col.width }, styles.compCell]}>
              <Text style={item.compliance === "Compliant" ? styles.greenDot : styles.orangeDot}>● </Text>
              <Text numberOfLines={1}>{item.compliance}</Text>
            </View>
          );
        }
        const value =
          col.key === "fireRating"
            ? (item.fireRating === "Select" ? "-" : item.fireRating)
            : col.key === "comments"
            ? (item.comments || "-")
            : String((item as any)[col.key] ?? "-");

        return (
          <View key={col.key} style={[styles.cellWrap, { width: col.width }]}>
            <Text numberOfLines={1} style={styles.cellText}>{value}</Text>
          </View>
        );
      })}

      {showView && (
        <TouchableOpacity
          onPress={() => gotoDashBoard(item.doorRefNumber, "view")}
          style={[styles.actionCell, { width: ACTION_WIDTH }]}
        >
          <MaterialIcons name="visibility" size={20} color="black" />
        </TouchableOpacity>
      )}
      {showEdit && shouldShowEditColumn && (
        <TouchableOpacity
          onPress={() => gotoDashBoard(item.doorRefNumber, "edit")}
          style={[styles.actionCell, { width: ACTION_WIDTH }]}
        >
          <MaterialIcons name="edit" size={20} color="black" />
        </TouchableOpacity>
      )}
      {deleteMode && (
        <TouchableOpacity onPress={() => deleteRow(item.id)} style={[styles.actionCell, { width: ACTION_WIDTH }]}>
          <MaterialIcons name="delete" size={20} color="crimson" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ---------- TOOLBAR (search visible here) ---------- */}
      <View style={styles.toolbar}>
        {/* Search box */}
        <View style={styles.searchRow}>
  {/* Search Input */}
  <View style={styles.searchWrap}>
    <MaterialIcons name="search" size={18} color="#666" />
    <TextInput
      placeholder={`Search${searchIn === "all" ? "" : ` in ${columns.find(c => c.key === searchIn)?.label}`}...`}
      value={search}
      onChangeText={setSearch}
      style={styles.searchInput}
      placeholderTextColor="#999"
    />
    {!!search && (
      <TouchableOpacity onPress={() => setSearch("")}>
        <MaterialIcons name="close" size={18} color="#666" />
      </TouchableOpacity>
    )}
  </View>

  {/* Dropdown */}
  <View style={styles.dropdownWrap}>
    <TouchableOpacity
      style={styles.dropdownButton}
      onPress={() => setShowSearchMenu(s => !s)}
    >
      <Text style={styles.dropdownText}>
        {searchIn === "all" ? "All Columns" : columns.find(c => c.key === searchIn)?.label}
      </Text>
      <MaterialIcons
        name={showSearchMenu ? "keyboard-arrow-up" : "keyboard-arrow-down"}
        size={18}
        color="#333"
      />
    </TouchableOpacity>
    {showSearchMenu && (
      <View style={styles.dropdownMenu}>
        <TouchableOpacity onPress={() => { setSearchIn("all"); setShowSearchMenu(false); }}>
          <Text style={styles.dropdownItem}>All</Text>
        </TouchableOpacity>
        {searchableCols.map(sc => (
          <TouchableOpacity
            key={sc.key}
            onPress={() => { setSearchIn(sc.key); setShowSearchMenu(false); }}
          >
            <Text style={styles.dropdownItem}>{sc.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    )}
  </View>
</View>


        {/* Columns toggle */}
        <View style={styles.columnsPanel}>
          <Text style={styles.toolbarLabel}>Columns:</Text>
          {columns.map((c, i) => (
            <TouchableOpacity
              key={c.key}
              style={[styles.colToggle, c.visible ? styles.colOn : styles.colOff]}
              onPress={() =>
                setColumns(prev => {
                  const copy = [...prev];
                  copy[i] = { ...copy[i], visible: !copy[i].visible };
                  return copy;
                })
              }
            >
              <Text style={styles.colToggleText}>{c.label}</Text>
            </TouchableOpacity>
          ))}

          {/* actions */}
          <TouchableOpacity
            style={[styles.colToggle, showView ? styles.colOn : styles.colOff]}
            onPress={() => setShowView(v => !v)}
          >
            <Text style={styles.colToggleText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.colToggle, showEdit ? styles.colOn : styles.colOff]}
            onPress={() => setShowEdit(v => !v)}
          >
            <Text style={styles.colToggleText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Delete mode + Clear all */}
        {/* <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.modeBtn, deleteMode ? styles.modeBtnOn : styles.modeBtnOff]}
            onPress={() => setDeleteMode(m => !m)}
          >
            <MaterialIcons name="delete" size={16} color={deleteMode ? "#fff" : "#333"} />
            <Text style={[styles.modeBtnText, deleteMode && { color: "#fff" }]}> Delete mode</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearBtn} onPress={() => setRows([])}>
            <Text style={styles.clearBtnText}>Clear all</Text>
          </TouchableOpacity>
        </View> */}

        {/* Page size */}
        {/* <View style={styles.pageSizes}>
          <Text style={styles.toolbarLabel}>Rows:</Text>
          {PAGE_SIZE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.sizePill,
                pageSize === (opt === -1 ? -1 : opt) && styles.sizePillActive,
              ]}
              onPress={() => setPageSize(opt === -1 ? -1 : opt)}
            >
              <Text style={styles.sizePillText}>{opt === -1 ? "All" : opt}</Text>
            </TouchableOpacity>
          ))}
        </View> */}
      </View>

      {/* ---------- TABLE (aligned) ---------- */}
      <ScrollView horizontal bounces={false} showsHorizontalScrollIndicator>
        <View>
          <HeaderRow />
          <FlatList
            data={paged}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <RowView item={item} />}
            ListEmptyComponent={
              <View style={{ width: tableWidth, paddingVertical: 20, alignItems: "center" }}>
                <Text style={{ color: "#777" }}>No records found</Text>
              </View>
            }
            getItemLayout={(_, index) => ({
              length: ROW_MIN_HEIGHT,
              offset: ROW_MIN_HEIGHT * index,
              index,
            })}
          />
        </View>
      </ScrollView>

      {/* Pagination controls */}
      {pageSize !== -1 && (
        <View style={styles.paginationBar}>
          <TouchableOpacity
            onPress={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            style={[styles.pageBtn, page === 0 && styles.pageBtnDisabled]}
          >
            <Text style={styles.pageBtnText}>Prev</Text>
          </TouchableOpacity>

          <Text style={styles.pageInfo}>
            Page {page + 1} of {Math.max(1, Math.ceil(sorted.length / pageSize))}
          </Text>

          <TouchableOpacity
            onPress={() => {
              const last = Math.max(0, Math.ceil(sorted.length / pageSize) - 1);
              setPage(p => Math.min(last, p + 1));
            }}
            disabled={page >= Math.ceil(sorted.length / pageSize) - 1}
            style={[
              styles.pageBtn,
              page >= Math.ceil(sorted.length / pageSize) - 1 && styles.pageBtnDisabled,
            ]}
          >
            <Text style={styles.pageBtnText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 10, paddingTop: 10 },

  // Toolbar
  toolbar: { gap: 10, marginBottom: 10 },
 
 
  // dropdownText: { fontSize: 12, color: "#333" },

  // dropdownItem: { paddingHorizontal: 12, paddingVertical: 8, fontSize: 13 },

  columnsPanel: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  toolbarLabel: { fontSize: 12, color: "#333" },
  colToggle: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  colOn: { borderColor: "#4caf50", backgroundColor: "#e8f5e9" },
  colOff: { borderColor: "#ccc", backgroundColor: "#f6f6f6" },
  colToggleText: { fontSize: 12 },

  actionsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  modeBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  modeBtnOn: { backgroundColor: "#d32f2f", borderColor: "#d32f2f" },
  modeBtnOff: { backgroundColor: "#f6f6f6", borderColor: "#ccc" },
  modeBtnText: { color: "#333", fontSize: 12 },
  clearBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#f6f6f6",
  },
  clearBtnText: { fontSize: 12 },

  pageSizes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    marginTop: 6,
  },
  sizePill: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#f6f6f6",
  },
  sizePillActive: { borderColor: "#1976d2", backgroundColor: "#e3f2fd" },
  sizePillText: { fontSize: 12 },


  searchRow: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 10,
},
searchWrap: {
  width: "20%", // Fixed to 30% of the row width
  flexDirection: "row",
  alignItems: "center",
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 5,
  paddingHorizontal: 8,
  marginRight: 8,
},
// searchWrap: {
//   width: "20%", // Fixed to 30% of the row width
//   flexDirection: "row"
//   alignItems: "center",
//   borderWidth: 1,
//   borderColor: "#ccc",
//   borderRadius: 5,
//   paddingHorizontal: 8,
//   marginRight: 8,
// },
searchInput: {
  flex: 1,
  paddingVertical: 4,
  color: "#000",
},
dropdownWrap: {
  width: 150,
},
dropdownButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 8,
  paddingVertical: 6,
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 5,
},
dropdownMenu: {
  marginTop: 2,
  backgroundColor: "#fff",
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 5,
  zIndex: 999,
  position: "absolute",
  top: 38,
  width: "100%",
},
dropdownItem: {
  padding: 8,
  borderBottomWidth: 1,
  borderBottomColor: "#eee",
},
dropdownText: {
  color: "#333",
},


  // Table
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  headerRow: {
    backgroundColor: "#f1f1f1",
    borderBottomWidth: 2,
  },

  headerCell: {
    paddingHorizontal: 8,
    justifyContent: "center",
    minHeight: ROW_MIN_HEIGHT,
  },
  headerText: { fontWeight: "bold" },

  cellWrap: {
    paddingHorizontal: 8,
    justifyContent: "center",
    minHeight: ROW_MIN_HEIGHT,
  },
  cellText: { fontSize: 14 },

  compCell: { flexDirection: "row", alignItems: "center" },
  greenDot: { color: "green", fontSize: 16, marginRight: 4 },
  orangeDot: { color: "orange", fontSize: 16, marginRight: 4 },

  actionHeaderCell: { alignItems: "center" },
  actionCell: { alignItems: "center", justifyContent: "center" },

  // Empty & pagination
  paginationBar: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
  },
  pageBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f6f6f6",
  },
  pageBtnDisabled: { opacity: 0.5 },
  pageBtnText: { fontSize: 13, fontWeight: "500" },
  pageInfo: { fontSize: 13 },
});
