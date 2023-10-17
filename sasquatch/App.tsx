import 'react-native-url-polyfill/auto';
import React from 'react';
import {PaperProvider} from 'react-native-paper';
import {Auth0Provider} from 'react-native-auth0';
import Router from './src';
import {LightTheme} from './src/styles/themes/LightTheme';
import config from './src/config';

// const auth0 = new Auth0({
//   domain: config.auth0ProviderDomain,
//   clientId: config.auth0ProviderClientId,
// });

export default function App() {
  return (
    <Auth0Provider
      domain={config.auth0ProviderDomain}
      clientId={config.auth0ProviderClientId}>
      <PaperProvider theme={LightTheme}>
        <Router />
      </PaperProvider>
    </Auth0Provider>
  );
}
