import React, {useContext} from 'react';
import {BottomNavigator} from './screens/primary';
import {BioScreen, LoginScreen, UsernameScreen} from './screens/setup';
import {useAuth0} from 'react-native-auth0';
import {useEffect, useState} from 'react';
import {UserRead} from './generated/jericho';
import {ApiContext, UserContext, UserContextInterface} from './context';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function Router() {
  const {user} = useAuth0();
  const {usersApi} = useContext(ApiContext);
  const [bibliUser, setBibliUser] = useState<UserRead | null>(null);

  const bibliUserContext: UserContextInterface = {
    user: bibliUser,
    setUser: setBibliUser,
  };

  // Use effect query and set user here.
  // should be dependent on the auth0 user so a stale user is not saved on re-login.
  useEffect(() => {
    if (user) {
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
    } else {
      setBibliUser(null);
    }
  }, [setBibliUser, usersApi, user]);

  const renderScreens = () => {
    if (!user || !bibliUser?.tag || !bibliUser?.name) {
      return (
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
            ) : (
              <>
                <Stack.Screen
                  options={{title: ''}}
                  name="Biography"
                  component={BioScreen}
                />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      );
    } else {
      return <BottomNavigator />;
    }
  };

  return (
    <UserContext.Provider value={bibliUserContext}>
      {renderScreens()}
    </UserContext.Provider>
  );
}
