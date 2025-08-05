// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import React from 'react';

// import Dashboard from '../../src/screens/Dashboard';
// import LoginScreen from '../../src/screens/LoginScreen';
// import PropertyDetails from '../../src/screens/PropertyDetails';

// const Stack = createNativeStackNavigator();

// export default function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="Login">
//         <Stack.Screen name="Login" component={LoginScreen} />
//         <Stack.Screen name="Dashboard" component={Dashboard} />
//         <Stack.Screen name="PropertyDetails" component={PropertyDetails} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }
// import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
