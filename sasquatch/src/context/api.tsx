import {createContext} from 'react';
import {
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
}

const defaultApiConfig = new Configuration({
  basePath: config.jerichoApiHost,
});

export const DefaultApiContext: ApiContextInterface = {
  usersApi: new UsersApi(defaultApiConfig),
  collectionsApi: new CollectionsApi(defaultApiConfig),
  booksApi: new BooksApi(defaultApiConfig),
  reviewsApi: new ReviewsApi(defaultApiConfig),
};

export const ApiContext = createContext<ApiContextInterface>(DefaultApiContext);
