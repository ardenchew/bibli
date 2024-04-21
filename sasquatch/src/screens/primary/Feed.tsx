import React, {useCallback, useContext, useEffect, useLayoutEffect, useState} from 'react';
import {
  Dimensions, FlatList,
  Image, RefreshControl,
  SafeAreaView, StyleProp,
  StyleSheet,
  View, ViewStyle,
} from 'react-native';
import {ActivityIndicator, Divider, IconButton, Text} from 'react-native-paper';
import {SharedNavigator} from './Shared';
import {useNavigation} from '@react-navigation/native';
import {ActivityCursor, ActivityRead, UserRead} from '../../generated/jericho';
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
        rippleColor={LightTheme.colors.onSurfaceDisabled}
        onPress={() => {
          Toast.showWithGravityAndOffset(
            'BING BONG',
            Toast.SHORT,
            Toast.BOTTOM,
            0,
            -98,
          );
        }}
      />
    </View>
  );
};

interface FeedListProps {
  user: UserRead;
  userType: 'primary' | 'follow';
  pageSize?: number;
}

const FEED_PAGE_SIZE = 10;

export const FeedList = ({user, userType, pageSize}: FeedListProps) => {
  const {activityApi} = useContext(ApiContext);
  const [activities, setActivities] = useState<ActivityRead[]>([]);
  const [cursor, setCursor] = useState<ActivityCursor>();
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const initActivities = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await activityApi.getActivitiesActivitiesPost({
        limit: pageSize ?? FEED_PAGE_SIZE,
        following_user_id: userType === 'follow' ? user.id : undefined,
        primary_user_id: userType === 'primary' ? user.id : undefined,
      });
      setActivities(response.data.activities);
      setCursor(response.data.next_cursor);
    } catch (error) {
      console.error(
        `Error fetching activity page for user ${user.tag}:`,
        error,
      );
    } finally {
      setRefreshing(false);
    }
  }, [activityApi, pageSize, user.id, user.tag, userType]);

  useEffect(() => {
    initActivities().catch(e => console.error(e));
  }, [initActivities]);

  const onRefresh = useCallback(() => {
    initActivities().catch(e => console.log(e));
  }, [initActivities]);

  const loadMoreActivities = useCallback(async () => {
    if (!loadingMore && cursor) {
      setLoadingMore(true);
      try {
        const response = await activityApi.getActivitiesActivitiesPost({
          cursor: cursor,
          limit: pageSize ?? FEED_PAGE_SIZE,
          following_user_id: userType === 'follow' ? user.id : undefined,
          primary_user_id: userType === 'primary' ? user.id : undefined,
        });
        setActivities(prevActivities => [
          ...prevActivities,
          ...response.data.activities,
        ]);
        setCursor(response.data.next_cursor);
      } catch (error) {
        console.error(
          `Error fetching more activity page for user ${user.tag}:`,
          error,
        );
      } finally {
        setLoadingMore(false);
      }
    }
  }, [activityApi, cursor, loadingMore, pageSize, user.id, user.tag, userType]);

  const onEndReached = useCallback(() => {
    loadMoreActivities().catch(e => console.error(e));
  }, [loadMoreActivities]);

  const updateActivity = (activity: ActivityRead) => {
    return async () => {
      try {
        setLoadingMore(true);
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
        setLoadingMore(false);
      }
    };
  };

  const renderActivityItem = ({item}: {item: ActivityRead}) => {
    return (
      <>
        <ActivityItem activity={item} refresh={updateActivity(item)} />
      </>
    );
  };

  const itemSeparator = () => <Divider bold={true} />;

  return activities.length === 0 && refreshing ? (
    <ActivityIndicator style={{flex: 1}} size={'large'} />
  ) : (
    <FlatList
      data={activities}
      renderItem={renderActivityItem}
      keyExtractor={item => item.id.toString()}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.7}
      ListFooterComponent={loadingMore ? <ActivityIndicator /> : undefined}
      ItemSeparatorComponent={itemSeparator}
    />
  );
};

const Header = () => {
  return (
    <SafeAreaView style={styles.headerContainer}>
      <View style={styles.safeHeaderContainer}>
        <HeaderLeft style={styles.headerLeft} />
        <HeaderTitle style={styles.headerTitle} />
        <HeaderRight style={styles.headerRight} />
      </View>
    </SafeAreaView>
  );
};

const FeedScreen = () => {
  const navigation = useNavigation();
  const {user: bibliUser} = useContext(UserContext);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: Header,
    });
  }, [bibliUser, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {bibliUser && <FeedList user={bibliUser} userType={'follow'} />}
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
    backgroundColor: LightTheme.colors.onTertiaryContainer,
  },
  safeHeaderContainer: {
    height: 70, // MUST MATCH HEADER TITLE
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    maxWidth: width / 3,
    margin: 10,
  },
  headerTitle: {
    position: 'absolute',
    left: 5,
    right: 0,
    height: 80, // MUST MATCH SAFE HEADER CONTAINER
  },
  headerRight: {},
  logo: {
    height: '100%',
    aspectRatio: 1,
    alignSelf: 'center',
  },
});
