import React, {useCallback, useContext, useEffect, useLayoutEffect, useState} from 'react';
import {
  Dimensions, FlatList,
  Image, RefreshControl,
  SafeAreaView, StyleProp,
  StyleSheet,
  View, ViewStyle,
} from 'react-native';
import {Divider, IconButton, Text} from 'react-native-paper';
import {SharedNavigator} from './Shared';
import {useNavigation} from '@react-navigation/native';
import {ActivityCursor, ActivityRead} from '../../generated/jericho';
import {ApiContext, UserContext} from '../../context';
import ActivityItem from '../../components/activity/Item';
import {LightTheme} from '../../styles/themes/LightTheme';
import Toast from 'react-native-simple-toast';

const {width} = Dimensions.get('window');

const HeaderLeft = ({style}: {style?: StyleProp<ViewStyle>}) => {
  const {user: bibliUser} = useContext(UserContext);
  const [modifiedName, setModifiedName] = useState<string>('');

  useEffect(() => {
    if (bibliUser?.name) {
      const nameParts = bibliUser.name.trim().split(/\s+/);
      if (nameParts.length > 1) {
        // If there's more than one word, take the first word and the initial of the last word
        const truncatedName = `${nameParts[0]} ${nameParts[
          nameParts.length - 1
        ].charAt(0)}.`;
        setModifiedName(truncatedName);
      } else {
        setModifiedName(bibliUser.name);
      }
    }
  }, [bibliUser?.name]);

  return modifiedName !== '' ? (
    <View style={style}>
      {modifiedName !== '' && (
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{
            fontWeight: '400',
            fontSize: 20,
            color: LightTheme.colors.surface,
          }}>
          {modifiedName}
        </Text>
      )}
    </View>
  ) : null;
};

const HeaderTitle = ({style}: {style?: StyleProp<ViewStyle>}) => {
  return (
    <View style={style}>
      <Image
        source={require('../../../assets/logo-whited.png')}
        resizeMode={'contain'}
        style={styles.logo}
      />
    </View>
  );
};

const HeaderRight = ({style}: {style?: StyleProp<ViewStyle>}) => {
  return (
    <View style={style}>
      <IconButton
        icon={'bell-outline'}
        iconColor={LightTheme.colors.outlineVariant}
        // containerColor={LightTheme.colors.surface}
        // underlayColor={LightTheme.colors.surface}
        onPress={() => {
          Toast.showWithGravityAndOffset(
            'BING BONG',
            Toast.SHORT,
            Toast.BOTTOM,
            0,
            -70,
          );
        }}
        // disabled={true}
      />
    </View>
  );
};

const Header = () => {
  return (
    <SafeAreaView style={styles.headerContainer}>
      <HeaderLeft style={styles.headerLeft} />
      <HeaderTitle style={styles.headerTitle} />
      <HeaderRight style={styles.headerRight} />
    </SafeAreaView>
  );
};

const FEED_PAGE_SIZE = 15;

const FeedScreen = () => {
  const navigation = useNavigation();
  const {user: bibliUser} = useContext(UserContext);
  const {activityApi} = useContext(ApiContext);

  const [activities, setActivities] = useState<ActivityRead[]>([]);
  const [cursor, setCursor] = useState<ActivityCursor>();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: Header,
    });
  }, [bibliUser, navigation]);

  const initActivities = useCallback(async () => {
    try {
      const response = await activityApi.getActivitiesActivitiesPost({
        limit: FEED_PAGE_SIZE,
        following_user_id: bibliUser?.id,
      });
      setActivities(response.data.activities);
      setCursor(response.data.next_cursor);
    } catch (error) {
      console.error(
        `Error fetching activity page for user ${bibliUser?.tag}:`,
        error,
      );
    }
  }, [activityApi, bibliUser?.id, bibliUser?.tag]);

  useEffect(() => {
    initActivities().catch(e => console.error(e));
  }, [initActivities]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    initActivities().finally(() => setRefreshing(false));
  }, [initActivities]);

  const loadMoreActivities = useCallback(async () => {
    if (!loading && cursor) {
      setLoading(true);
      try {
        const response = await activityApi.getActivitiesActivitiesPost({
          cursor: cursor,
          limit: 10,
          following_user_id: bibliUser?.id,
        });
        setActivities(prevActivities => [
          ...prevActivities,
          ...response.data.activities,
        ]);
        setCursor(response.data.next_cursor);
      } catch (error) {
        console.error(
          `Error fetching more activity page for user ${bibliUser?.tag}:`,
          error,
        );
      } finally {
        setLoading(false);
      }
    }
  }, [activityApi, bibliUser?.id, bibliUser?.tag, cursor, loading]);

  const onEndReached = useCallback(() => {
    loadMoreActivities().catch(e => console.error(e));
  }, [loadMoreActivities]);

  const updateActivity = (activity: ActivityRead) => {
    return async () => {
      try {
        setLoading(true);
        const newActivities = [...activities];
        const index = newActivities.findIndex(item => item.id === activity.id);
        const response = await activityApi.getActivityActivityActivityIdGet(
          activity.id,
        );
        if (index !== -1) {
          newActivities[index] = response.data;
        }
        setActivities(newActivities);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderActivityItem = ({item}: {item: ActivityRead}) => {
    return (
      <>
        <ActivityItem activity={item} refresh={updateActivity(item)} />
        <Divider bold={true} />
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={activities}
        renderItem={renderActivityItem}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.7}
      />
    </SafeAreaView>
  );
};

const FeedTab = SharedNavigator(FeedScreen);

export default FeedTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headline: {
    alignSelf: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: LightTheme.colors.onTertiaryContainer,
    borderBottomWidth: 8,
    borderBottomColor: LightTheme.colors.onTertiaryContainer,
  },
  headerLeft: {
    maxWidth: width / 3,
    marginLeft: 12,
    // borderColor: 'white',
    // borderWidth: 1,
  },
  headerTitle: {
    maxWidth: width / 3,
    height: 76,
    marginVertical: -15,
    left: -17,
    // borderColor: 'white',
    // borderWidth: 1,
  },
  headerRight: {
    marginRight: 2,
    // borderColor: 'white',
    // borderWidth: 1,
  },
  logo: {
    height: '100%',
    aspectRatio: 1,
    alignSelf: 'center',
  },
});
