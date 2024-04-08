import React from 'react';
import {View} from 'react-native';
import {Item} from './Item';
import {
  BooksApi,
  CollectionRead,
  CollectionsApi,
  ReviewsApi,
  UserBookRead,
} from '../../generated/jericho';
import {Divider} from 'react-native-paper';

interface Props {
  userBooks: UserBookRead[];
  booksApi: BooksApi;
  collectionsApi: CollectionsApi;
  reviewsApi: ReviewsApi;
  currentOwnedCollection?: CollectionRead;
}

export const List = ({
  userBooks,
  booksApi,
  collectionsApi,
  reviewsApi,
  currentOwnedCollection,
}: Props) => {
  return (
    <View>
      {userBooks.map((item, index) => (
        <View key={item.book.id.toString()}>
          <Item
            userBook={item}
            booksApi={booksApi}
            collectionsApi={collectionsApi}
            reviewsApi={reviewsApi}
            currentOwnedCollection={currentOwnedCollection}
          />
          {index !== userBooks.length - 1 && <Divider bold={true} />}
        </View>
      ))}
    </View>
  );
};
