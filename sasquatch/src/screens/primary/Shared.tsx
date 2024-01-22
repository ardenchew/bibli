import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Screen as ProfileScreen} from '../../components/profile';
import {Screen as CollectionScreen} from '../../components/collection';
import EditScreen from '../../components/profile/EditScreen';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {CollectionRead, UserRead} from '../../generated/jericho';
import {NavigationLightTheme} from '../../styles/themes/NavigationLightTheme';
import {NavigationContainer} from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  Profile: {
    profile: UserRead;
  };
  Collection: {
    collection: CollectionRead;
  };
  EditProfile: undefined;
};

const defaultStackScreenOptions = {
  headerTitleStyle: {color: 'transparent'},
  headerBackTitleVisible: false,
};

const Profile = ({
  route,
}: NativeStackScreenProps<RootStackParamList, 'Profile'>) => {
  return (
    <View style={styles.container}>
      <ProfileScreen user={route.params.profile} />
    </View>
  );
};

const Collection = ({
  route,
}: NativeStackScreenProps<RootStackParamList, 'Collection'>) => {
  return (
    <View style={styles.container}>
      <CollectionScreen collection={route.params.collection} />
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
            component={Profile}
            options={defaultStackScreenOptions}
          />
          <Stack.Screen
            name="Collection"
            component={Collection}
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
