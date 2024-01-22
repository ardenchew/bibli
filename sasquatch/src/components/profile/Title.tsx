import * as React from 'react';
import {Avatar, Card, IconButton} from 'react-native-paper';
import {StyleProp, ViewStyle} from 'react-native';
import {UserRead} from '../../generated/jericho';

interface Props {
  style: StyleProp<ViewStyle>;
  user: UserRead;
  isCurrentUser: boolean;
}

export const Title = ({style, user}: Props) => {
  return (
    <Card.Title
      style={style}
      title={user?.name}
      titleVariant={'headlineMedium'}
      subtitle={user?.tag}
      subtitleVariant={'labelLarge'}
      left={props => <Avatar.Icon {...props} icon="account" />}
      right={props => (
        <IconButton {...props} icon="dots-horizontal" onPress={() => {}} />
      )}
    />
  );
};
