import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  InputAccessoryView, Keyboard,
  KeyboardAvoidingView,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {ActivityCommentRead, ActivityRead} from '../../generated/jericho';
import ActivityItem from './Item';
import {ApiContext, UserContext} from '../../context';
import {Card, Divider, IconButton, TextInput} from 'react-native-paper';
import {ActivityComment} from './Comment';


interface ActivityItemProps {
  activity_id: number;
}

const ActivityItemScreen = ({activity_id}: ActivityItemProps) => {
  const {user: bibliUser} = useContext(UserContext);
  const {activityApi} = useContext(ApiContext);
  const [activity, setActivity] = useState<ActivityRead>();
  const [comment, setComment] = useState<string>('');
  const [comments, setComments] = useState<ActivityCommentRead[]>();
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const initActivity = useCallback(async () => {
    try {
      const response = await activityApi.getActivityActivityActivityIdGet(activity_id);
      setActivity(response.data);
    } catch (e) {
      console.log(e);
    }
  }, [activityApi, activity_id]);

  useEffect(() => {
    initActivity().catch(e => console.error(e));
  }, [initActivity]);

  const onRefresh = () => {
    setRefreshing(true);
    initActivity().finally(() => setRefreshing(false));
  };

  useEffect(() => {
    setComments(activity?.comments);
  }, [activity?.comments]);

  const onSubmit = async () => {
    if (activity && bibliUser && comment !== '') {
      try {
        const response = await activityApi.putActivityCommentActivityCommentPut(
          {
            activity_id: activity.id,
            user_id: bibliUser.id,
            comment: comment,
          },
        );
        setComment('');
        if (comments) {
          setComments([...comments, response.data]);
        } else {
          setComments([response.data]);
        }
      } catch (e) {
        console.log(e);
      }
      Keyboard.dismiss();
      initActivity().catch(e => console.error(e));
    }
  };

  return activity ? (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        automaticallyAdjustKeyboardInsets={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <ActivityItem
          activity={activity}
          refresh={initActivity}
          disableComment={true}
        />
        <Divider bold={true} />
        {comments && (
          <View>
            {comments.map(item => (
              <View key={item.id}>
                <ActivityComment activity={activity} comment={item} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <KeyboardAvoidingView
        style={{
          bottom: 0,
        }}
        behavior={'position'}
        keyboardVerticalOffset={98} // must match the bottom tab height
      >
        <TextInput
          right={
            <TextInput.Icon
              icon={'send'}
              disabled={comment === ''}
              onPress={onSubmit}
            />
          }
          defaultValue={comment}
          onChangeText={setComment}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  ) : null;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  container: {
    gap: 10,
  },
  submitButton: {
    alignSelf: 'center',
  },
});

export default ActivityItemScreen;
