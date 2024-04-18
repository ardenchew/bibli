import {
  ActivityCommentRead,
  ActivityReactionRead,
  ActivityRead,
} from '../../generated/jericho';
import React, {useContext, useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {ApiContext, UserContext} from '../../context';
import {IconButton} from 'react-native-paper';
import TimeAgo from '../timeago/timeago';
import {LightTheme} from '../../styles/themes/LightTheme';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

const hasReaction = (
  reactions?: ActivityReactionRead[],
  user_id?: number,
): boolean => {
  return reactions && user_id
    ? reactions.some(reaction => reaction.user_id === user_id)
    : false;
};

const hasComment = (
  comments?: ActivityCommentRead[],
  user_id?: number,
): boolean => {
  return comments && user_id
    ? comments.some(comment => comment.user_id === user_id)
    : false;
};

const ActivityIconString = ({activity}: {activity: ActivityRead}) => {
  const [likes, setLikes] = useState<number>(0);
  const [comments, setComments] = useState<number>(0);

  useEffect(() => {
    setLikes(activity.reactions?.length || 0);
    setComments(activity.comments?.length || 0);
  }, [activity.reactions, activity.comments]);

  return (
    <Text>
      {likes > 0 && (
        <Text>
          {likes} {likes === 1 ? 'like' : 'likes'}{' '}
        </Text>
      )}
      {likes > 0 && comments > 0 && <Text> • </Text>}
      {comments > 0 && <Text>{comments} comments </Text>}
    </Text>
  );
};

interface ActivityBottomBarProps {
  activity: ActivityRead;
  refresh?: () => void;
  disableComment?: boolean;
}

export const ActivityBottomBar = ({
  activity,
  refresh,
  disableComment,
}: ActivityBottomBarProps) => {
  const {user: bibliUser} = useContext(UserContext);
  const {activityApi} = useContext(ApiContext);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [heartPressed, setHeartPressed] = useState<boolean>(
    hasReaction(activity.reactions, bibliUser?.id),
  );
  const [commentPressed, setCommentPressed] = useState<boolean>(
    hasComment(activity.comments, bibliUser?.id),
  );

  useEffect(() => {
    setHeartPressed(hasReaction(activity.reactions, bibliUser?.id));
  }, [activity.reactions, bibliUser?.id]);

  useEffect(() => {
    setCommentPressed(hasComment(activity.comments, bibliUser?.id));
  }, [activity.comments, bibliUser?.id]);

  const onHeartPress = async () => {
    if (bibliUser) {
      try {
        if (heartPressed) {
          setHeartPressed(!heartPressed);
          await activityApi.deleteActivityReactionActivityReactionDelete({
            activity_id: activity.id,
            user_id: bibliUser?.id,
          });
        } else {
          setHeartPressed(!heartPressed);
          await activityApi.insertActivityReactionActivityReactionPost({
            activity_id: activity.id,
            user_id: bibliUser?.id,
          });
        }
      } catch (e) {
        console.log(e);
      } finally {
        if (refresh) {
          refresh();
        }
      }
    }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: -5}}>
          <IconButton
            style={{margin: 0}}
            // size={10}
            icon={heartPressed ? 'heart' : 'heart-outline'}
            onPress={onHeartPress}
            iconColor={heartPressed ? 'crimson' : undefined}
          />
          <IconButton
            style={{margin: 0}}
            // size={10}
            icon={commentPressed ? 'chat' : 'chat-outline'}
            onPress={
              disableComment ? undefined : (
                  () => navigation.push('Activity', {activity_id: activity.id})
                )
            }
          />
        </View>
        <ActivityIconString activity={activity} />
      </View>
      <View style={{alignSelf: 'flex-end'}}>
        <TimeAgo
          datetime={activity.created_at}
          style={{color: LightTheme.colors.onSurfaceVariant}}
        />
      </View>
    </View>
  );
};
