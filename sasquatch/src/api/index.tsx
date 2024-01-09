import {useEffect, useState} from 'react';
import {Configuration, UsersApi} from '../generated/jericho';
import {useAuth0} from 'react-native-auth0';
import config from '../config';

// Setup instructions here -> https://auth0.com/docs/quickstart/spa/react/02-calling-an-api?_ga=2.183422190.932252088.1621856610-1595415333.1607347674&_gac=1.187692250.1620663261.Cj0KCQjws-OEBhCkARIsAPhOkIbhK13acrxZIWhKyPE4GlpGf7ZKmKpxtmuQbD_VcaLmyScFgvNZcmAaAntFEALw_wcB&_gl=1*3dk1lt*_gcl_au*MTYyMTQ0MzM1NS4xNzAyMDc2Mzk4*_ga*MjA2OTIwNTgyOS4xNzAyMDc2Mzk5*_ga_QKMSDV5369*MTcwMzIxOTQ4Ni4zLjEuMTcwMzIyMjU0Ni4yNS4wLjA.
// getAccessTokenSilently() renews access and id tokens using refresh tokens.

// TODO create an api context to replace this functional call.
export const useUsersApi = () => {
  const {getCredentials} = useAuth0();
  const defaultApiConfig = new Configuration({
    basePath: config.jerichoApiHost,
  });
  const [usersApi, setUsersApi] = useState<UsersApi>(
    new UsersApi(defaultApiConfig),
  );

  useEffect(() => {
    const fetchCredentialsAndInitializeApi = async () => {
      try {
        const credentials = await getCredentials();
        const apiConfig = new Configuration({
          basePath: config.jerichoApiHost,
          accessToken: credentials ? credentials.accessToken : '',
        });
        // console.log(apiConfig);
        setUsersApi(new UsersApi(apiConfig));
      } catch (error) {
        console.error('Error fetching credentials:', error);
        // Handle the error as appropriate
      }
    };

    fetchCredentialsAndInitializeApi();
  }, [getCredentials]);

  return usersApi;
};
