import React from 'react';
import {StyleSheet} from 'react-native';
import {Card, Avatar} from 'react-native-paper';
import {UserRead} from '../../generated/jericho';
import {LightTheme} from '../../styles/themes/LightTheme'; // Adjust the import path

interface UserItemProps {
  user: UserRead;
}

const UserItem = ({user}: UserItemProps) => {
  return (
    <Card
      mode={'contained'}
      style={styles.container}
      theme={{
        colors: {surfaceVariant: LightTheme.colors.surface},
      }}>
      <Card.Title
        title={user.name}
        subtitle={`@${user.tag}`}
        left={props => <Avatar.Icon {...props} icon="account-outline" />}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    marginHorizontal: 10,
    elevation: 2,
  },
});

export default UserItem;
