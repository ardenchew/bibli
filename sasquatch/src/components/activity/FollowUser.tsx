import React, {ReactNode, useContext, useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Card, Avatar} from 'react-native-paper';
import {LightTheme} from '../../styles/themes/LightTheme';
import {
  ActivityRead,
  FollowUserActivityRead,
} from '../../generated/jericho';
import {UserPress} from './Navigation';
import {ActivityBottomBar} from './BottomBar';
import {UserAvatarCallback} from '../profile/Avatar';

interface FollowUserTitleProps {
  subActivity: FollowUserActivityRead;
}

const FollowUserTitle = ({subActivity}: FollowUserTitleProps) => {
  return (
    <Text style={{fontSize: 15, lineHeight: 22}}>
      <Text
        onPress={UserPress(subActivity.follower)}
        style={{fontWeight: 'bold'}}>
        {subActivity.follower.name}
      </Text>
      <Text> started following </Text>
      <Text
        onPress={UserPress(subActivity.following)}
        style={{fontWeight: 'bold'}}>
        {subActivity.following.name}
      </Text>
    </Text>
  );
};

interface FollowUserCardProps {
  activity: ActivityRead;
  subActivity: FollowUserActivityRead;
  refresh?: () => void;
  disableComment?: boolean;
}

export const FollowUserCard = ({
  activity,
  subActivity,
  refresh,
  disableComment,
}: FollowUserCardProps) => {
  // const {user: bibliUser} = useContext(UserContext);
  const [title, setTitle] = useState<ReactNode>(
    <FollowUserTitle subActivity={subActivity} />,
  );

  useEffect(() => {
    setTitle(<FollowUserTitle subActivity={subActivity} />);
  }, [subActivity]);

  return activity.follow_user ? (
    <Card
      mode={'contained'}
      style={styles.container}
      theme={{
        colors: {surfaceVariant: LightTheme.colors.surface},
      }}>
      <Card.Title
        style={{marginVertical: -5}}
        title={title}
        titleNumberOfLines={3}
        left={UserAvatarCallback({user: subActivity.follower, pressable: true})}
      />
      <Card.Content
        style={{
          width: '100%',
          paddingHorizontal: 0,
          paddingBottom: 0,
          justifyContent: 'space-between',
        }}>
        <ActivityBottomBar activity={activity} refresh={refresh} disableComment={disableComment} />
      </Card.Content>
    </Card>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    marginHorizontal: 10,
    elevation: 2,
  },
});
