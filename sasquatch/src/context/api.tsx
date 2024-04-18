import {createContext} from 'react';
import {
  ActivityApi,
  BooksApi,
  CollectionsApi,
  Configuration,
  ReviewsApi,
  UsersApi,
} from '../generated/jericho';
import config from '../config';

export interface ApiContextInterface {
  usersApi: UsersApi;
  collectionsApi: CollectionsApi;
  booksApi: BooksApi;
  reviewsApi: ReviewsApi;
  activityApi: ActivityApi;
}

const defaultApiConfig = new Configuration({
  basePath: config.jerichoApiHost,
});

export const DefaultApiContext: ApiContextInterface = {
  usersApi: new UsersApi(defaultApiConfig),
  collectionsApi: new CollectionsApi(defaultApiConfig),
  booksApi: new BooksApi(defaultApiConfig),
  reviewsApi: new ReviewsApi(defaultApiConfig),
  activityApi: new ActivityApi(defaultApiConfig),
};

export const ApiContext = createContext<ApiContextInterface>(DefaultApiContext);
