import * as React from 'react';
import {Avatar, Card, IconButton} from 'react-native-paper';
import {StyleProp, ViewStyle} from 'react-native';

interface Props {
  style: StyleProp<ViewStyle>;
  name: string;
  tag: string;
  id: number;
  isCurrentUser: boolean;
}

const Title = ({style, name, tag}: Props) => {
  return (
    <Card.Title
      style={style}
      title={name}
      titleVariant={'headlineMedium'}
      subtitle={tag}
      subtitleVariant={'labelLarge'}
      left={props => <Avatar.Icon {...props} icon="account" />}
      right={props => (
        <IconButton {...props} icon="dots-horizontal" onPress={() => {}} />
      )}
    />
  );
};

export default Title;
