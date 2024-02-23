import * as React from 'react';
import {Avatar, Card, IconButton} from 'react-native-paper';
import {StyleProp, ViewStyle} from 'react-native';
import {CollectionRead, UserRead} from '../../generated/jericho';

interface Props {
  style: StyleProp<ViewStyle>;
  collection: CollectionRead;
  owner?: UserRead;
}

export const Title = ({style, collection, owner}: Props) => {
  // TODO replace owner tagline with clickable profile picture
  return (
    <Card.Title
      style={style}
      title={collection.name}
      titleVariant={'headlineMedium'}
      subtitle={owner ? `Owned by @${owner.tag}` : null}
      subtitleVariant={'labelLarge'}
      left={props => <Avatar.Icon {...props} icon="book" />}
      right={props => (
        <IconButton {...props} icon="dots-horizontal" onPress={() => {}} />
      )}
    />
  );
};
