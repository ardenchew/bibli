import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {BioScreen, LoginScreen, UsernameScreen} from './screens';
import {useAuth0} from 'react-native-auth0';
import {useContext, useEffect, useState} from 'react';
import {UserPut, UserRead} from './generated/jericho';
import {usersApi} from './api';
import {UserContext, UserContextInterface} from './context';

const Stack = createNativeStackNavigator();

function LoggedInRouter() {
  const {user} = useAuth0();
  const {user: bibliUser, setUser: setBibliUser} = useContext(UserContext);

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

        const newUser: UserPut = {};

        usersApi
          .putUserUserPut(newUser)
          .then(response => {
            const createdUser: UserRead = response.data;
            setBibliUser(createdUser);
            console.log('User created:', createdUser);
          })
          .catch(createError => {
            console.error('Error creating user:', createError);
          });
      }
    };
    initializeUser().catch(error => console.log(error));
  }, [setBibliUser, user]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Username">
        {!bibliUser?.tag ? (
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
}

/*
If not signed in go to login screen
If auth0 sign in exists fetch and store user? Go to user home page
If auth0 sign in exists but no user go to user creation page

TODO set NavigationContainer theme dynamically from paper provider theme.
 */
export default function Router() {
  const {user} = useAuth0();
  const [bibliUser, setBibliUser] = useState<UserRead | null>(null);

  const bibliUserContext: UserContextInterface = {
    user: bibliUser,
    setUser: setBibliUser,
  };

  // TODO removing navigation container causes abrupt transition when logging in.
  return user ? (
    // TODO fix provider and logged in router to fit navigation mechanism.
    <UserContext.Provider value={bibliUserContext}>
      <LoggedInRouter />
    </UserContext.Provider>
  ) : (
    <LoginScreen />
  );
}
