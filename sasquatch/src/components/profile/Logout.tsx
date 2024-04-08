import {useCallback, useContext} from 'react';
import {useAuth0} from 'react-native-auth0';
import {UserContext} from '../../context';

export const useLogout = () => {
  const {clearCredentials} = useAuth0();
  const {setUser: setBibliUser} = useContext(UserContext);

  return useCallback(async () => {
    setBibliUser(null);
    try {
      await clearCredentials();
    } catch (e) {
      console.log(e);
    }
  }, [clearCredentials, setBibliUser]);
};
