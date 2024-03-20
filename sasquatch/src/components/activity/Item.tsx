import React from 'react';
import {StyleSheet} from 'react-native';
import {Card, Avatar} from 'react-native-paper';
import {LightTheme} from '../../styles/themes/LightTheme';

interface Props {
  activity: string;
}

const CardPress = () => {};

const ActivityItem = ({activity}: Props) => {
  return (
    <Card
      mode={'contained'}
      style={styles.container}
      onPress={CardPress}
      theme={{
        colors: {surfaceVariant: LightTheme.colors.surface},
      }}>
      <Card.Title
        title={activity}
        subtitle={'SUBTITLE'}
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

export default ActivityItem;
