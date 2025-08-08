
// // import { Stack } from 'expo-router';
// // import { Provider } from 'react-redux';
// // import { store } from '../components/slices/store'; // adjust path as needed

// // export default function Layout() {
// //   return (
// //     <Provider store={store}>
// //       <Stack />
// //          {/* <Stack screenOptions={{ headerShown: false }} /> */}
// //     </Provider>
// //   );
// // }
// // app/_layout.tsx
// import Sidebar from "@/components/Sidebar";
// import { Stack } from "expo-router";
// import React, { useState } from "react";
// import { SafeAreaView, StyleSheet, View } from "react-native";
// import { Provider } from "react-redux";
// import Header from "../components/common/Header";
// import { store } from "../components/slices/store"; // adjust path

// export default function Layout() {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const toggleSidebar = () => setIsSidebarOpen((s) => !s);
//   const closeSidebar = () => setIsSidebarOpen(false);

//   return (
//     <Provider store={store}>
//       <SafeAreaView style={styles.safe}>
//         {/* Custom header */}
//         <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />

//         {/* Content area */}
//         <View style={styles.content}>
//           {/* Routed screens */}
//           <Stack screenOptions={{ headerShown: false }} />

//           {/* Sidebar overlays on top of screens */}
//           <Sidebar open={isSidebarOpen} onClose={closeSidebar} />
//         </View>
//       </SafeAreaView>
//     </Provider>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: "#fff" },
//   content: { flex: 1, position: "relative" },
// });
// app/_layout.tsx
import Header from "@/components/common/Header";
import Sidebar from "@/components/Sidebar";
import { store } from "@/components/slices/store";
import { router, Stack, usePathname } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { Provider, useSelector } from "react-redux";

function LayoutInner() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((s) => !s);
  const closeSidebar = () => setIsSidebarOpen(false);

 const { userObj } = useSelector((s: any) => s.user);
const pathname = usePathname();

  const isAuthed = !!userObj;

  useEffect(() => {
  if (!userObj && pathname !== "/") {
    router.replace("/"); // or "/(auth)"
  }
}, [userObj, pathname]);

  return (
    <SafeAreaView style={styles.safe}>
      {isAuthed && (
        <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
      )}

      <View style={styles.content}>
        {/* All routes render here (login is app/index.tsx) */}
        <Stack screenOptions={{ headerShown: false }} />

        {/* Sidebar only when logged in */}
        {isAuthed && <Sidebar open={isSidebarOpen} onClose={closeSidebar} />}
      </View>
    </SafeAreaView>
  );
}

export default function Layout() {
  return (
    <Provider store={store}>
      <LayoutInner />
    </Provider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, position: "relative" },
});
