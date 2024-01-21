import React from 'react';
import {View} from 'react-native';
import CollectionItem from './Item';
import {CollectionRead} from '../../generated/jericho';
import {Divider} from 'react-native-paper';

// Example usage in a component
const CollectionsList = ({collections}: {collections: CollectionRead[]}) => {
  return (
    <View>
      {collections.map((item, index) => (
        <View key={item.id.toString()}>
          <CollectionItem collection={item} />
          {index !== collections.length - 1 && <Divider bold={true} />}
        </View>
      ))}
    </View>
  );
};

export default CollectionsList;
