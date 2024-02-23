import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Title} from './Title';
import {
  CollectionRead,
  BookPage,
  CollectionUserLinkType,
  UserRead,
} from '../../generated/jericho';
import {List as BooksList} from '../book';
import {Divider} from 'react-native-paper';
import {LightTheme} from '../../styles/themes/LightTheme';
import {useApi} from '../../api';
import {UserContext} from '../../context';
import {TitleButtons} from './Buttons';

interface ScreenProps {
  collection: CollectionRead;
}

export const Screen = ({collection}: ScreenProps) => {
  const {user: bibliUser} = useContext(UserContext);
  const {booksApi, usersApi, collectionsApi} = useApi();
  const [bookPage, setBookPage] = useState<BookPage>();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [owner, setOwner] = useState<UserRead>();

  const owner_id = collection.user_links.find(
    link => link.type === CollectionUserLinkType.Owner,
  )?.user_id;

  useEffect(() => {
    const fetchUser = async () => {
      if (owner_id) {
        if (owner_id === bibliUser?.id) {
          setOwner(bibliUser);
        } else {
          try {
            const response = await usersApi.getUserByIdUserUserIdGet(owner_id);
            setOwner(response.data);
          } catch (error) {
            console.error('Error fetching user:', error);
          }
        }
      }
    };

    fetchUser().catch(error => console.log(error));
  }, [bibliUser, owner_id, usersApi]);

  const fetchBooks = useCallback(async () => {
    try {
      const response = await booksApi.getBooksBooksPost({
        collection_ids: [collection.id],
      });
      setBookPage(response.data);
      setIsLoaded(true);
    } catch (error) {
      console.log(
        `Error fetching books for collection ${collection.name}:`,
        error,
      );
    }
  }, [booksApi, collection.id, collection.name]);

  useEffect(() => {
    fetchBooks().catch(error => console.log(error));
  }, [fetchBooks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBooks();
    setRefreshing(false);
  }, [fetchBooks]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Title
          style={styles.profileBanner}
          collection={collection}
          owner={owner}
        />
        {bibliUser && isLoaded && (
          <TitleButtons
            collection={collection}
            collectionsApi={collectionsApi}
            bibliUser={bibliUser}
          />
        )}
        {isLoaded && (
          <Text style={styles.socialText}>
            {bookPage?.books?.length ?? 0} Books •{' '}
            {collection.user_links.length} Followers
          </Text>
        )}
      </View>
      <Divider
        bold={true}
        style={{backgroundColor: LightTheme.colors.onBackground}}
      />
      <ScrollView
        style={styles.routeContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <BooksList userBooks={bookPage?.books ?? []} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    marginHorizontal: 10,
    paddingBottom: 10,
  },
  socialText: {
    textAlign: 'center',
  },
  profileBanner: {
    paddingTop: 5,
  },
  routeContainer: {
    flex: 1,
  },
});
