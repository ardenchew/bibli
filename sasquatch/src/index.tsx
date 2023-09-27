import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {BioScreen, LoginScreen, UsernameScreen} from './screens';
import {useAuth0} from 'react-native-auth0';

const Stack = createNativeStackNavigator();

/*
If not signed in go to login screen
If auth0 sign in exists fetch and store user? Go to user home page
If auth0 sign in exists but no user go to user creation page

TODO set NavigationContainer theme dynamically from paper provider theme.
 */
export default function Router() {
  const {user} = useAuth0();
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Username">
        {user ? (
          <>
            <Stack.Screen
              options={{title: ''}}
              name="Username"
              component={UsernameScreen}
            />
            <Stack.Screen
              options={{title: ''}}
              name="Biography"
              component={BioScreen}
            />
          </>
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
