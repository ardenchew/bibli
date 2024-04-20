import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Screen as ProfileScreen} from '../../components/profile';
import {Screen as CollectionScreen} from '../../components/collection';
import {Screen as BookScreen} from '../../components/book';
import EditScreen from '../../components/profile/EditScreen';
import FeedbackScreen from '../../components/profile/FeedbackScreen';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {CollectionRead, UserBookRead, UserRead} from '../../generated/jericho';
import {NavigationLightTheme} from '../../styles/themes/NavigationLightTheme';
import {NavigationContainer} from '@react-navigation/native';
import ActivityItemScreen from '../../components/activity/ItemScreen';

export type RootStackParamList = {
  Home: undefined;
  Profile: {
    profile: UserRead;
  };
  Collection: {
    collection: CollectionRead;
  };
  Book: {
    userBook: UserBookRead;
  };
  EditProfile: {
    user: UserRead;
  };
  SubmitFeedback: undefined;
  Activity: {
    activity_id: number;
  };
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

const EditProfile = ({
  route,
}: NativeStackScreenProps<RootStackParamList, 'EditProfile'>) => {
  return <EditScreen user={route.params.user} />;
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

const Book = ({route}: NativeStackScreenProps<RootStackParamList, 'Book'>) => {
  return (
    <View style={styles.container}>
      <BookScreen userBook={route.params.userBook} />
    </View>
  );
};

const Activity = ({
  route,
}: NativeStackScreenProps<RootStackParamList, 'Activity'>) => {
  return (
    <View style={styles.container}>
      <ActivityItemScreen activity_id={route.params.activity_id} />
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
            component={EditProfile}
            options={defaultStackScreenOptions}
          />
          <Stack.Screen
            name="SubmitFeedback"
            component={FeedbackScreen}
            options={defaultStackScreenOptions}
          />
          <Stack.Screen
            name="Activity"
            component={Activity}
            options={defaultStackScreenOptions}
          />
          <Stack.Screen
            name="Book"
            component={Book}
            options={{
              ...defaultStackScreenOptions,
              headerTransparent: true,
            }}
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
