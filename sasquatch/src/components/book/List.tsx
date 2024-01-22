import React from 'react';
import {View} from 'react-native';
import Item from './Item';
import {BookRead} from '../../generated/jericho';
import {Divider} from 'react-native-paper';

interface Props {
  books: BookRead[];
}

const List = ({books}: Props) => {
  return (
    <View>
      {books.map((item, index) => (
        <View key={item.id.toString()}>
          <Item book={item} />
          {index !== books.length - 1 && <Divider bold={true} />}
        </View>
      ))}
    </View>
  );
};

export default List;
