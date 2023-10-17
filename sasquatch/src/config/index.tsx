type Config = {
  jerichoApiHost: string;
  jerichoApiAuth0Audience: string;
  auth0ProviderDomain: string;
  auth0ProviderClientId: string;
};

const config: Config = {
  jerichoApiHost: 'http://localhost:8000',
  jerichoApiAuth0Audience: 'https://jericho.dev.com',
  auth0ProviderDomain: 'dev-xlrahc2qy1wqddf8.us.auth0.com',
  auth0ProviderClientId: 'bM3WrVIqXJmrBkEty0ofS8RyBvrM14Pl',
};

export default config;
