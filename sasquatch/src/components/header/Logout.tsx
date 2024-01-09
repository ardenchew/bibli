import React, {memo} from 'react';
import {useAuth0} from 'react-native-auth0';
import {Button as NativeButton} from 'react-native';

const LogoutButton = () => {
  const {clearCredentials} = useAuth0();

  const onPress = async () => {
    try {
      await clearCredentials();
    } catch (e) {
      console.log(e);
    }
  };

  return <NativeButton title="Log out" onPress={onPress} />;
};

export default memo(LogoutButton);
