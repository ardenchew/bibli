import * as React from 'react';
import {Avatar, Card, IconButton} from 'react-native-paper';
import {StyleProp, ViewStyle} from 'react-native';
import {CollectionRead} from '../../generated/jericho';

interface Props {
  style: StyleProp<ViewStyle>;
  collection: CollectionRead;
}

export const Title = ({style, collection}: Props) => {
  return (
    <Card.Title
      style={style}
      title={collection.name}
      titleVariant={'headlineMedium'}
      subtitle={`Owned by ${collection?.user_id}`}
      subtitleVariant={'labelLarge'}
      left={props => <Avatar.Icon {...props} icon="book" />}
      right={props => (
        <IconButton {...props} icon="dots-horizontal" onPress={() => {}} />
      )}
    />
  );
};
