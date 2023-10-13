import React from 'react';
import {PaperProvider} from 'react-native-paper';
import {Auth0Provider} from 'react-native-auth0';
import Router from './src';
import {LightTheme} from './src/styles/themes/LightTheme';

export default function App() {
  return (
    <Auth0Provider
      domain={'dev-xlrahc2qy1wqddf8.us.auth0.com'}
      clientId={'bM3WrVIqXJmrBkEty0ofS8RyBvrM14Pl'}>
      <PaperProvider theme={LightTheme}>
        <Router />
      </PaperProvider>
    </Auth0Provider>
  );
}
