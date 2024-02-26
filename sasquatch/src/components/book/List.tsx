import React from 'react';
import {View} from 'react-native';
import {Item} from './Item';
import {UserBookRead} from '../../generated/jericho';
import {Divider} from 'react-native-paper';

interface Props {
  userBooks: UserBookRead[];
}

export const List = ({userBooks}: Props) => {
  return (
    <View>
      {userBooks.map((item, index) => (
        <View key={item.book.id.toString()}>
          <Item userBook={item} />
          {index !== userBooks.length - 1 && <Divider bold={true} />}
        </View>
      ))}
    </View>
  );
};
