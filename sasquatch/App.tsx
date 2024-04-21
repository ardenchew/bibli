import 'react-native-url-polyfill/auto';
import React, {useEffect, useState} from 'react';
import {PaperProvider} from 'react-native-paper';
import {Auth0Provider, useAuth0} from 'react-native-auth0';
import Router from './src';
import {LightTheme} from './src/styles/themes/LightTheme';
import config from './src/config';
import {
  ActivityApi,
  BooksApi,
  CollectionsApi,
  Configuration,
  ReviewsApi,
  UsersApi,
} from './src/generated/jericho';
import {
  ApiContext,
  ApiContextInterface,
  DefaultApiContext,
} from './src/context';
import Toast, {BaseToast, ToastConfig} from 'react-native-toast-message';

// const auth0 = new Auth0({
//   domain: config.auth0ProviderDomain,
//   clientId: config.auth0ProviderClientId,
// });

export type Props = {
  children: React.ReactNode;
};

const ApiProvider = ({children}: Props) => {
  const {getCredentials, user} = useAuth0();
  const [apiContext, setApiContext] =
    useState<ApiContextInterface>(DefaultApiContext);

  useEffect(() => {
    const fetchCredentialsAndInitializeApi = async () => {
      try {
        const credentials = await getCredentials();
        const apiConfig = new Configuration({
          basePath: config.jerichoApiHost,
          accessToken: credentials?.accessToken ?? '',
        });
        console.log(apiConfig);
        const newApiContext: ApiContextInterface = {
          usersApi: new UsersApi(apiConfig),
          collectionsApi: new CollectionsApi(apiConfig),
          booksApi: new BooksApi(apiConfig),
          reviewsApi: new ReviewsApi(apiConfig),
          activityApi: new ActivityApi(apiConfig),
        };
        setApiContext(newApiContext);
      } catch (error) {
        console.error('Error fetching credentials:', error);
        // Handle the error as appropriate
      }
    };

    fetchCredentialsAndInitializeApi().catch(error => console.log(error));
  }, [user, getCredentials]);

  return (
    <ApiContext.Provider value={apiContext}>{children}</ApiContext.Provider>
  );
};

export default function App() {
  return (
    <Auth0Provider
      domain={config.auth0ProviderDomain}
      clientId={config.auth0ProviderClientId}>
      <ApiProvider>
        <PaperProvider theme={LightTheme}>
          <Router />
        </PaperProvider>
      </ApiProvider>
    </Auth0Provider>
  );
}
