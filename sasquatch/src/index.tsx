import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import React from 'react';
import {BioScreen, LoginScreen, ProfileScreen, UsernameScreen} from './screens';
import {useAuth0} from 'react-native-auth0';
import {useEffect, useState} from 'react';
import {UserRead} from './generated/jericho';
import {useUsersApi} from './api';
import {UserContext, UserContextInterface} from './context';

const Stack = createNativeStackNavigator();

/*
If not signed in go to login screen
If auth0 sign in exists fetch and store user? Go to user home page
If auth0 sign in exists but no user go to user creation page

TODO set NavigationContainer theme dynamically from paper provider theme.
 */
export default function Router() {
  const {user} = useAuth0();
  const usersApi = useUsersApi();
  const [bibliUser, setBibliUser] = useState<UserRead | null>(null);

  const bibliUserContext: UserContextInterface = {
    user: bibliUser,
    setUser: setBibliUser,
  };

  // Use effect query and set user here.
  // should be dependent on the auth0 user so a stale user is not saved on re-login.
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const response = await usersApi.getUserUserCurrentGet();
        setBibliUser(response.data);
      } catch (error) {
        // User does not exist, create a new user
        console.log('No user found:', error);
      }
    };
    initializeUser().catch(error => console.log(error));
  }, [setBibliUser, user, usersApi]);

  return (
    <UserContext.Provider value={bibliUserContext}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          {!user || !bibliUser ? (
            <>
              <Stack.Screen
                options={{headerShown: false}}
                name="Login"
                component={LoginScreen}
              />
            </>
          ) : !bibliUser?.tag ? (
            <>
              <Stack.Screen
                options={{title: ''}}
                name="Username"
                component={UsernameScreen}
              />
            </>
          ) : !bibliUser?.name ? (
            <>
              <Stack.Screen
                options={{title: ''}}
                name="Biography"
                component={BioScreen}
              />
            </>
          ) : (
            <>
              <Stack.Screen
                options={{title: ''}}
                name="Profile"
                component={ProfileScreen}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </UserContext.Provider>
  );
}
