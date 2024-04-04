import React from 'react';
import {View} from 'react-native';
import {Item} from './Item';
import {BooksApi, CollectionsApi, UserBookRead} from '../../generated/jericho';
import {Divider} from 'react-native-paper';

interface Props {
  userBooks: UserBookRead[];
  booksApi: BooksApi;
  collectionsApi: CollectionsApi;
}

export const List = ({userBooks, booksApi, collectionsApi}: Props) => {
  return (
    <View>
      {userBooks.map((item, index) => (
        <View key={item.book.id.toString()}>
          <Item
            userBook={item}
            booksApi={booksApi}
            collectionsApi={collectionsApi}
          />
          {index !== userBooks.length - 1 && <Divider bold={true} />}
        </View>
      ))}
    </View>
  );
};
