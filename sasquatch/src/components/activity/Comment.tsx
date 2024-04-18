import React, {useContext, useEffect, useState} from 'react';
import {ActivityCommentRead, ActivityRead, UserRead} from '../../generated/jericho';
import {Text, View} from 'react-native';
import TimeAgo from '../timeago/timeago';
import {ApiContext} from '../../context';
import {UserPress} from './Navigation';
import {Divider} from 'react-native-paper';
import {LightTheme} from '../../styles/themes/LightTheme';

interface ActivityCommentProps {
  activity: ActivityRead;
  comment: ActivityCommentRead;
}

export const ActivityComment = ({activity, comment}: ActivityCommentProps) => {
  const {usersApi} = useContext(ApiContext);
  const [user, setUser] = useState<UserRead>();

  useEffect(() => {
    const initUser = async () => {
      try {
        const response = await usersApi.getUserByIdUserUserIdGet(
          comment.user_id,
        );
        setUser(response.data);
      } catch (e) {
        console.log(e);
      }
    };
    initUser().catch(e => console.error(e));
  }, [comment.user_id, usersApi]);

  return user ? (
    <View style={{marginBottom: 10, marginHorizontal: 20}}>
      <Text>
        <Text onPress={UserPress(user)} style={{fontWeight: 'bold'}}>
          {user.name}
        </Text>
        <Text> </Text>
        <Text>{comment.comment}</Text>
      </Text>
      <TimeAgo
        datetime={comment.created_at}
        style={{alignSelf: 'flex-end', color: LightTheme.colors.outline}}
      />
      <Divider />
    </View>
  ) : null;
};
