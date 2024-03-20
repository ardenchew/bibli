import React from 'react';
import {View} from 'react-native';
import {Item} from './Item';
import {CollectionsApi, UserBookRead} from '../../generated/jericho';
import {Divider} from 'react-native-paper';
import {GestureResponderEvent} from 'react-native/Libraries/Types/CoreEventTypes';

interface Props {
  userBooks: UserBookRead[];
  // reviewPress?: ((event: GestureResponderEvent) => void) | undefined;
  collectionsApi: CollectionsApi;
}

export const List = ({userBooks, collectionsApi}: Props) => {
  return (
    <View>
      {userBooks.map((item, index) => (
        <View key={item.book.id.toString()}>
          <Item
            userBook={item}
            // reviewPress={reviewPress}
            collectionsApi={collectionsApi}
          />
          {index !== userBooks.length - 1 && <Divider bold={true} />}
        </View>
      ))}
    </View>
  );
};
