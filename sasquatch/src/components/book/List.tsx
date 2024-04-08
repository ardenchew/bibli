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
  currentOwnedCollection?: CollectionRead;
}

export const List = ({
  userBooks,
  currentOwnedCollection,
}: Props) => {
  return (
    <View>
      {userBooks.map((item, index) => (
        <View key={item.book.id.toString()}>
          <Item
            userBook={item}
            currentOwnedCollection={currentOwnedCollection}
          />
          {index !== userBooks.length - 1 && <Divider bold={true} />}
        </View>
      ))}
    </View>
  );
};
