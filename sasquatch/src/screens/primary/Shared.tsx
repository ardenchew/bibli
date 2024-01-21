import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Screen} from '../../components/profile';
import EditScreen from '../../components/profile/EditScreen';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {UserRead} from '../../generated/jericho';
import {NavigationLightTheme} from '../../styles/themes/NavigationLightTheme';
import {NavigationContainer} from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  Profile: {
    profile: UserRead;
  };
  EditProfile: undefined;
};

const defaultStackScreenOptions = {
  title: '',
  headerBackTitleVisible: false,
};

const ProfileScreen = ({
  route,
}: NativeStackScreenProps<RootStackParamList, 'Profile'>) => {
  return (
    <View style={styles.container}>
      <Screen user={route.params.profile} />
    </View>
  );
};

export const SharedNavigator = (home: any) => {
  const Stack = createNativeStackNavigator<RootStackParamList>();

  return () => {
    return (
      <NavigationContainer theme={NavigationLightTheme}>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={home}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={defaultStackScreenOptions}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditScreen}
            options={defaultStackScreenOptions}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
