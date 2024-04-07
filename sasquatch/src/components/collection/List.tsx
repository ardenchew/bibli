import React from 'react';
import {View} from 'react-native';
import Item from './Item';
import {CollectionRead, UsersApi} from '../../generated/jericho';
import {Divider} from 'react-native-paper';

interface Props {
  collections: CollectionRead[];
  usersApi: UsersApi;
}

const List = ({collections, usersApi}: Props) => {
  return (
    <View>
      {collections.map((item, index) => (
        <View key={item.id.toString()}>
          <Item collection={item} usersApi={usersApi} />
          {index !== collections.length - 1 && <Divider bold={true} />}
        </View>
      ))}
    </View>
  );
};

export default List;
