import React from 'react';
import {View} from 'react-native';
import {Divider} from 'react-native-paper';
import ActivityItem from './Item';

const ActivityList = ({activities}: {activities: string[]}) => {
  return (
    <View>
      {activities.map((item, index) => (
        <View key={item}>
          <ActivityItem activity={item} />
          {index !== activities.length - 1 && <Divider bold={true} />}
        </View>
      ))}
    </View>
  );
};

export default ActivityList;
