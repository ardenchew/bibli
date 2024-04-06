import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  BooksApi,
  CollectionRead, CollectionsApi,
  CollectionType, ReviewsApi,
  TagBookLink,
  UserBookRead,
  UserRead,
  UsersApi,
} from '../../generated/jericho';
import {
  Avatar,
  Button,
  Card,
  Divider,
  IconButton,
  Text,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {LightTheme} from '../../styles/themes/LightTheme';
import {useHeaderHeight} from '@react-navigation/elements';
import {Indicators, RefreshBook, useHasCollections} from './Item';
import {ActiveIndicator, CompleteIndicator, ReviewIndicator, SavedIndicator} from './Indicators';
import {useApi} from '../../api';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {UserContext} from '../../context';

const {height} = Dimensions.get('window');
const backgroundHeight = height;

export const Background = ({userBook}: {userBook: UserBookRead}) => {
  return (
    <View style={styles.backgroundContainer}>
      <ImageBackground
        source={{uri: userBook.book.cover_link}}
        resizeMode={'cover'}
        blurRadius={10}
        style={styles.backgroundImage}
      />
      <LinearGradient
        colors={['transparent', LightTheme.colors.background]}
        locations={[0.4, 1.0]}
        style={styles.backgroundGradient}
      />
    </View>
  );
};

interface HeadlineProps {
  userBook: UserBookRead;
  refreshBook: () => void;
  collectionsApi: CollectionsApi;
  reviewsApi: ReviewsApi;
}

export const Headline = ({
  userBook,
  refreshBook,
  collectionsApi,
  reviewsApi,
}: HeadlineProps) => {
  const title = userBook.book.subtitle
    ? `${userBook.book.title}: ${userBook.book.subtitle}`
    : userBook.book.title;
  const headerHeight = useHeaderHeight();
  const marginTop = -headerHeight * 1.5;
  const authors = userBook.authors?.map(author => author.name).join(', ');

  return (
    <View style={{...styles.headlineContainer, marginTop: marginTop}}>
      <Image
        style={styles.headlineImage}
        source={{uri: userBook.book.cover_link}}
        resizeMode={'cover'}
      />
      <View style={styles.headlineTitle}>
        <Text style={styles.headlineTitleFont}>{title}</Text>
        <Text style={styles.headlineAuthorFont}>by: {authors}</Text>
        <View style={styles.headlineButtonContainer}>
          <Indicators
            book={userBook}
            collectionsApi={collectionsApi}
            reviewsApi={reviewsApi}
            refreshBook={refreshBook}
          />
        </View>
      </View>
    </View>
  );
};

interface TopSectionProps {
  userBook: UserBookRead;
  refreshBook: () => void;
  collectionsApi: CollectionsApi;
  reviewsApi: ReviewsApi;
}

export const TopSection = ({
  userBook,
  refreshBook,
  collectionsApi,
  reviewsApi,
}: TopSectionProps) => {
  const headerHeight = useHeaderHeight();
  const marginTop = -backgroundHeight + headerHeight * 3;
  return (
    <View style={{...styles.topSection, marginTop: marginTop}}>
      <Background userBook={userBook} />
      <Headline
        userBook={userBook}
        refreshBook={refreshBook}
        collectionsApi={collectionsApi}
        reviewsApi={reviewsApi}
      />
    </View>
  );
};

export const InfoSection = ({userBook}: {userBook: UserBookRead}) => {
  let detailStrArray: string[] = [];
  if (userBook.book.pages) {
    detailStrArray.push(`${userBook.book.pages} pages`);
  }
  if (userBook.book.publication_date) {
    const date = new Date(userBook.book.publication_date);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    detailStrArray.push(
      `Published ${date.toLocaleDateString('en-US', options)}`,
    );
  }
  const detailStr = detailStrArray.join(' • ');

  const initialNumberOfLines = 10;
  const [expanded, setExpanded] = useState<boolean>(false);
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const [showMore, setShowMore] = useState<boolean>(false);
  const onTextLayout = useCallback(
    (e: {nativeEvent: {lines: string | any[]}}) => {
      const {lines} = e.nativeEvent;
      setShowMore(lines.length > initialNumberOfLines);
    },
    [],
  );

  return (
    <View style={styles.infoSection}>
      {detailStr && (
        <View>
          <Text style={styles.detailStr} variant={'titleSmall'}>
            {detailStr}
          </Text>
          <Divider style={{marginVertical: 5}} />
        </View>
      )}
      {userBook.book.summary && (
        <View>
          {showMore ? (
            <>
              <Text
                style={styles.summaryStr}
                numberOfLines={expanded ? undefined : initialNumberOfLines}>
                {userBook.book.summary}
              </Text>
              <Button
                mode={'text'}
                onPress={toggleExpand}
                compact={true}
                rippleColor={'transparent'}
                style={{marginVertical: -5}}>
                {expanded ? 'less' : 'more'}
              </Button>
            </>
          ) : (
            <Text style={styles.summaryStr} onTextLayout={onTextLayout}>
              {userBook.book.summary}
            </Text>
          )}
          <Divider style={{marginVertical: 5}} />
        </View>
      )}
    </View>
  );
};

export const ReviewSection = ({userBook}: {userBook: UserBookRead}) => {
  const initialNumberOfLines = 10;
  const [expanded, setExpanded] = useState<boolean>(false);
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const [showMore, setShowMore] = useState<boolean>(false);
  const onTextLayout = useCallback(
    (e: {nativeEvent: {lines: string | any[]}}) => {
      const {lines} = e.nativeEvent;
      setShowMore(lines.length > initialNumberOfLines);
    },
    [],
  );

  return userBook.review?.notes ? (
    <View style={styles.infoSection}>
      <Text variant="titleMedium" style={{marginBottom: 10}}>
        Your Review
      </Text>
      <View>
        {showMore ? (
          <>
            <Text
              style={styles.summaryStr}
              numberOfLines={expanded ? undefined : initialNumberOfLines}>
              {userBook.review?.notes}
            </Text>
            <Button
              mode={'text'}
              onPress={toggleExpand}
              compact={true}
              rippleColor={'transparent'}
              style={{marginVertical: -5}}>
              {expanded ? 'less' : 'more'}
            </Button>
          </>
        ) : (
          <Text style={styles.summaryStr} onTextLayout={onTextLayout}>
            {userBook.review?.notes}
          </Text>
        )}
      </View>
    </View>
  ) : (
    <></>
  );
};

function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    txt => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(),
  );
}

export const TagPills = ({tags}: {tags: TagBookLink[] | undefined}) => {
  if (!tags || tags.length === 0) {
    return <Text>No tags available</Text>;
  }
  const filteredTags = tags
    .filter(tag => tag.count >= 10)
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'center',
        marginBottom: 10,
      }}>
      {filteredTags.map(tag => (
        <Button
          key={tag.tag_name}
          mode={'contained-tonal'}
          contentStyle={{marginVertical: -5, marginHorizontal: -8}}
          style={{margin: 3}}
          // onPress={() => {}}
        >
          {toTitleCase(tag.tag_name)}
        </Button>
      ))}
    </View>
  );
};

interface TagSectionProps {
  userBook: UserBookRead;
  booksApi: BooksApi;
}

export const TagSection = ({userBook, booksApi}: TagSectionProps) => {
  const [tags, setTags] = useState<TagBookLink[]>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await booksApi.getBookTagsBookIdGet(userBook.book.id);
        setTags(response.data);
      } catch (error) {
        console.log(`Error fetching tags for book ${userBook.book.id}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchTags().catch(error => console.log(error));
  }, [booksApi, userBook.book.id]);

  return loading || !tags ? null : (
    <View style={styles.tagSection}>
      <Text variant="titleMedium" style={{marginBottom: 10}}>
        Tags
      </Text>
      <TagPills tags={tags} />
      <Divider style={{marginVertical: 5, width: '100%'}} />
    </View>
  );
};

const CollectionPillPress = (collection: CollectionRead) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return () => {
    navigation.push('Collection', {
      collection: collection,
    });
  };
};

export const CollectionPills = ({
  collections,
}: {
  collections: CollectionRead[];
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'center',
        marginBottom: 10,
      }}>
      {collections.map(collection => (
        <Button
          key={collection.id}
          mode={'contained'}
          contentStyle={{marginVertical: -5, marginHorizontal: -8}}
          style={{margin: 3}}
          onPress={CollectionPillPress(collection)}>
          {collection.name}
        </Button>
      ))}
    </View>
  );
};

export const CollectionSection = ({userBook}: {userBook: UserBookRead}) => {
  return !userBook.collections || userBook.collections.length === 0 ? null : (
    <View style={styles.tagSection}>
      <CollectionPills collections={userBook.collections} />
    </View>
  );
};

const FollowingPress = (user: UserRead) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return () => {
    navigation.push('Profile', {
      profile: user,
    });
  };
};

interface FollowingBookItemProps {
  following: UserRead;
  followingBook: UserBookRead;
}

export const FollowingBookItemCollectionTags = ({
  collections,
}: {
  collections: CollectionRead[];
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}>
      {collections.map(collection => (
        <Button
          key={collection.id}
          mode={'outlined'}
          contentStyle={{marginVertical: -10, marginHorizontal: -10}}
          style={{margin: 2}}
          labelStyle={{fontSize: 12}}
          onPress={CollectionPillPress(collection)}>
          {collection.name}
        </Button>
      ))}
    </View>
  );
};

export const FollowingBookItem = ({
  following,
  followingBook,
}: FollowingBookItemProps) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [expandable, setExpandable] = useState<boolean>(false);
  const [parsedCollections, setParsedCollections] = useState<CollectionRead[]>(
    [],
  );
  const {hasActive, hasComplete} = useHasCollections(followingBook);

  useEffect(() => {
    if (!followingBook.collections) {
      return;
    }

    // Filter collections and set parsedCollections
    const filteredCollections = followingBook.collections.filter(
      collection => collection.type !== CollectionType.Complete,
    );
    setParsedCollections(filteredCollections);
  }, [followingBook]);

  useEffect(() => {
    setExpandable(
      parsedCollections.length > 0 ||
        (followingBook.review?.notes ?? '').trim() !== '',
    );
  }, [followingBook.review?.notes, parsedCollections.length]);

  const handleExpandPress = () => {
    setExpanded(!expanded);
  };

  // TODO if no review but in finished use check mark.  Pop
  // @ts-ignore
  return (
    <Card
      mode={'contained'}
      style={{
        marginVertical: 5,
        marginHorizontal: 10,
        elevation: 2,
      }}
      onPress={FollowingPress(following)}
      theme={{
        colors: {surfaceVariant: LightTheme.colors.surface},
      }}>
      <Card.Title
        title={following.name}
        subtitle={`@${following.tag}`}
        left={props => <Avatar.Icon {...props} icon="account-outline" />}
        right={() => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              direction: 'rtl',
              marginHorizontal: 10,
            }}>
            {expandable && (
              <IconButton
                style={{marginHorizontal: 0}}
                icon={expanded ? 'chevron-up' : 'chevron-down'}
                onPress={handleExpandPress}
              />
            )}
            {hasComplete &&
              (followingBook.review ? (
                <ReviewIndicator review={followingBook.review} />
              ) : (
                <CompleteIndicator hasComplete={hasComplete} />
              ))}
          </View>
        )}
      />
      {expanded && (
        <Card.Content style={{marginHorizontal: 20, gap: 10}}>
          {followingBook.review?.notes && (
            <Text>{followingBook.review?.notes}</Text>
          )}
          <FollowingBookItemCollectionTags collections={parsedCollections} />
        </Card.Content>
      )}
    </Card>
  );
};

interface FollowingSectionProps {
  userId: number;
  userBook: UserBookRead;
  usersApi: UsersApi;
  booksApi: BooksApi;
}

export const FollowingSection = ({
  userId,
  userBook,
  usersApi,
  booksApi,
}: FollowingSectionProps) => {
  const [followingBookItems, setFollowingBookItems] = useState<
    FollowingBookItemProps[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchFollowingBooks = async () => {
      try {
        const response =
          await booksApi.getFollowingUserBooksFollowingBooksBookIdParentIdGet(
            userBook.book.id,
            userId,
          );
        const books = response.data;

        const bookItems: FollowingBookItemProps[] = await Promise.all(
          books.map(async (book: UserBookRead) => {
            const userResponse = await usersApi.getUserByIdUserUserIdGet(
              book.user_id,
            );
            return {
              following: userResponse.data,
              followingBook: book,
            };
          }),
        );

        setFollowingBookItems(bookItems);
      } catch (error) {
        console.log(
          `Error fetching followers and books for user ${userId}:`,
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFollowingBooks().catch(error => console.log(error));
  }, [booksApi, userBook.book.id, userId, usersApi]);

  return loading ? null : (
    <View>
      {followingBookItems.map(i => (
        <FollowingBookItem
          key={i.following.id}
          following={i.following}
          followingBook={i.followingBook}
        />
      ))}
    </View>
  );
};

interface ScreenProps {
  userBook: UserBookRead;
}

// TODO this can be a lot better if the background image is stored in the header.
// try using the useNavigation hook with navigation.setOptions to improve.
export const Screen = ({userBook: initBook}: ScreenProps) => {
  const {user: bibliUser} = useContext(UserContext);
  const {booksApi, usersApi, collectionsApi, reviewsApi} = useApi();
  const [userBook, setUserBook] = useState<UserBookRead>(initBook);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const refreshBook = RefreshBook(booksApi, userBook, setUserBook);

  useEffect(() => {
    RefreshBook(booksApi, initBook, setUserBook)().catch(e => console.log(e));
  }, [booksApi, initBook]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshBook();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <TopSection
        userBook={userBook}
        refreshBook={refreshBook}
        collectionsApi={collectionsApi}
        reviewsApi={reviewsApi}
      />
      <CollectionSection userBook={userBook} />
      <InfoSection userBook={userBook} />
      <TagSection userBook={userBook} booksApi={booksApi} />
      <ReviewSection userBook={userBook} />
      <FollowingSection
        userId={bibliUser?.id ?? userBook.user_id}
        userBook={userBook}
        usersApi={usersApi}
        booksApi={booksApi}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {},
  backgroundContainer: {
    height: backgroundHeight,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  backgroundGradient: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  headlineContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-evenly',
  },
  headlineImage: {
    flex: 1,
    aspectRatio: 1,
    marginLeft: 20,
    marginRight: 10,
    marginBottom: 50,
    overflow: 'visible',
  },
  headlineTitle: {
    flex: 2,
    marginLeft: 10,
    marginRight: 20,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  headlineTitleFont: {
    fontSize: 23,
    marginBottom: 10,
  },
  headlineAuthorFont: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  headlineButtonContainer: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  infoSection: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  detailStr: {
    marginVertical: 5,
    alignSelf: 'center',
  },
  summaryStr: {
    marginVertical: 5,
    alignSelf: 'center',
  },
  tagSection: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
});
