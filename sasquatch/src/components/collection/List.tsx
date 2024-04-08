import React from 'react';
import {View} from 'react-native';
import Item from './Item';
import {CollectionRead} from '../../generated/jericho';
import {Divider} from 'react-native-paper';

interface Props {
  collections: CollectionRead[];
}

const List = ({collections}: Props) => {
  return (
    <View>
      {collections.map((item, index) => (
        <View key={item.id.toString()}>
          <Item collection={item} />
          {index !== collections.length - 1 && <Divider bold={true} />}
        </View>
      ))}
    </View>
  );
};

export default List;
