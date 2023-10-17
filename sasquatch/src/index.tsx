import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {BioScreen, LoginScreen, UsernameScreen} from './screens';
import {useAuth0} from 'react-native-auth0';
import {useEffect, useState} from 'react';
import {UserPut, UserRead} from './generated/jericho';
import {usersApi} from './api';

const Stack = createNativeStackNavigator();

/*
If not signed in go to login screen
If auth0 sign in exists fetch and store user? Go to user home page
If auth0 sign in exists but no user go to user creation page

TODO set NavigationContainer theme dynamically from paper provider theme.
 */
export default function Router() {
  const {user} = useAuth0();
  const [bibliUser, setBibliUser] = useState<UserRead | null>(null);

  // Function to fetch a user by ID
  const fetchUser = async (userTag: string) => {
    try {
      const response = await usersApi.getUserUserTagGet(userTag);
      setBibliUser(response.data);
    } catch (error) {
      // User does not exist, create a new user
      console.log('User not found:', error);

      const newUser: UserPut = {
        // Define the properties for the new user
        name: 'Arden Chew',
        // Add other properties as needed
        tag: userTag,
      };

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

  useEffect(() => {
    const userTagToGet = 'ardenchew';

    // Try to fetch the user with ID 2
    fetchUser(userTagToGet).catch(error => console.log(error));
  }, [user]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Username">
        {user ? (
          !bibliUser?.tag ? (
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
          )
        ) : (
          <>
            <Stack.Screen
              options={{headerShown: false}}
              name="Login"
              component={LoginScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
