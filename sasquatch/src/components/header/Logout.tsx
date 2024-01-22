import React, {memo, useContext} from 'react';
import {useAuth0} from 'react-native-auth0';
import {Button as NativeButton} from 'react-native';
import {UserContext} from '../../context';

const LogoutButton = () => {
  const {clearCredentials} = useAuth0();
  const {setUser: setBibliUser} = useContext(UserContext);

  const onPress = async () => {
    setBibliUser(null);
    try {
      await clearCredentials();
    } catch (e) {
      console.log(e);
    }
  };

  return <NativeButton title="Log out" onPress={onPress} />;
};

export default memo(LogoutButton);
