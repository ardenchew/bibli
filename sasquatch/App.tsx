import React from 'react';
import {Button, Text, View} from 'react-native';
import {useAuth0, Auth0Provider} from 'react-native-auth0';

const LoginButton = () => {
  const {authorize} = useAuth0();

  const onPress = async () => {
    try {
      console.log('LoginButton hello what the fuck');
      await authorize();
    } catch (e) {
      console.log('LoginButton hello what the fuck');
      console.log(e);
    }
  };

  return <Button onPress={onPress} title="Log in" />;
};

const LogoutButton = () => {
  const {clearSession} = useAuth0();

  const onPress = async () => {
    console.log('LogoutButton hello what the fuck');
    try {
      await clearSession();
    } catch (e) {
      console.log('LogoutButton hello what the fuck');
      console.log(e);
    }
  };

  return <Button onPress={onPress} title="Log out" />;
};

const Profile = () => {
  const {user} = useAuth0();

  return (
    <>
      {user && <Text>Logged in as {user.name}</Text>}
      {!user && <Text>Not logged in</Text>}
    </>
  );
};

const App = () => {
  return (
    <Auth0Provider
      domain={'dev-xlrahc2qy1wqddf8.us.auth0.com'}
      clientId={'bM3WrVIqXJmrBkEty0ofS8RyBvrM14Pl'}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <LoginButton />
        <LogoutButton />
        <Profile />
      </View>
    </Auth0Provider>
  );
};

export default App;
