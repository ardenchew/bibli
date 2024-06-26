import {useEffect, useState} from 'react';
import {
  BooksApi,
  CollectionsApi,
  Configuration,
  ReviewsApi,
  UsersApi,
} from '../generated/jericho';
import {useAuth0} from 'react-native-auth0';
import config from '../config';

// Setup instructions here -> https://auth0.com/docs/quickstart/spa/react/02-calling-an-api?_ga=2.183422190.932252088.1621856610-1595415333.1607347674&_gac=1.187692250.1620663261.Cj0KCQjws-OEBhCkARIsAPhOkIbhK13acrxZIWhKyPE4GlpGf7ZKmKpxtmuQbD_VcaLmyScFgvNZcmAaAntFEALw_wcB&_gl=1*3dk1lt*_gcl_au*MTYyMTQ0MzM1NS4xNzAyMDc2Mzk4*_ga*MjA2OTIwNTgyOS4xNzAyMDc2Mzk5*_ga_QKMSDV5369*MTcwMzIxOTQ4Ni4zLjEuMTcwMzIyMjU0Ni4yNS4wLjA.
// getAccessTokenSilently() renews access and id tokens using refresh tokens.

interface ReturnApis {
  usersApi: UsersApi;
  collectionsApi: CollectionsApi;
  booksApi: BooksApi;
  reviewsApi: ReviewsApi;
}

// TODO create an api context to replace this functional call.
export const useApi = (): ReturnApis => {
  const {getCredentials, user} = useAuth0();
  const defaultApiConfig = new Configuration({
    basePath: config.jerichoApiHost,
  });
  const [usersApi, setUsersApi] = useState<UsersApi>(
    new UsersApi(defaultApiConfig),
  );
  const [collectionsApi, setCollectionsApis] = useState<CollectionsApi>(
    new CollectionsApi(defaultApiConfig),
  );
  const [booksApi, setBooksApi] = useState<BooksApi>(
    new BooksApi(defaultApiConfig),
  );
  const [reviewsApi, setReviewsApi] = useState<ReviewsApi>(
    new ReviewsApi(defaultApiConfig),
  );

  useEffect(() => {
    const fetchCredentialsAndInitializeApi = async () => {
      try {
        const credentials = await getCredentials();
        const apiConfig = new Configuration({
          basePath: config.jerichoApiHost,
          accessToken: credentials?.accessToken ?? '',
        });
        console.log(apiConfig);
        setUsersApi(new UsersApi(apiConfig));
        setCollectionsApis(new CollectionsApi(apiConfig));
        setBooksApi(new BooksApi(apiConfig));
        setReviewsApi(new ReviewsApi(apiConfig));
      } catch (error) {
        console.error('Error fetching credentials:', error);
        // Handle the error as appropriate
      }
    };

    fetchCredentialsAndInitializeApi().catch(error => console.log(error));
  }, [user, getCredentials]);

  return {
    usersApi,
    collectionsApi,
    booksApi,
    reviewsApi,
  };
};
