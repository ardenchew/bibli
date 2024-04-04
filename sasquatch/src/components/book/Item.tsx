import React, {Dispatch, SetStateAction, useContext, useEffect, useState} from 'react';
import {StyleSheet, Image, Text, View} from 'react-native';
import {Card, Avatar, IconButton, Menu} from 'react-native-paper';
import {
  BooksApi,
  CollectionBookLink,
  CollectionsApi,
  CollectionType,
  Reaction,
  ReviewRead,
  UserBookRead, UserRead,
} from '../../generated/jericho';
import {LightTheme} from '../../styles/themes/LightTheme';
import {UserContext} from '../../context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ReviewModal} from './Review';
import {ActiveIndicator, SavedIndicator} from './Indicators';

interface ReviewIndicatorProps {
  completed: boolean;
  review?: ReviewRead;
}

// Define the mapping from indicators to colors
const reactionColorMap: {[key in Reaction]: string} = {
  [Reaction.Positive]: '#0cb256', // green
  [Reaction.Neutral]: '#e39700', // yellow
  [Reaction.Negative]: '#d53325', // red
};

interface HasCollections {
  hasComplete: boolean;
  hasActive: boolean;
  hasSaved: boolean;
}

export const useHasCollections = (userBook: UserBookRead): HasCollections => {
  const [hasComplete, setHasComplete] = useState<boolean>(() =>
    userBook.collections
      ? userBook.collections.some(
          collection => collection.type === CollectionType.Complete,
        )
      : false,
  );
  const [hasActive, setHasActive] = useState<boolean>(() =>
    userBook.collections
      ? userBook.collections.some(
          collection => collection.type === CollectionType.Active
        )
      : false,
  );
  const [hasSaved, setHasSaved] = useState<boolean>(() =>
    userBook.collections
      ? userBook.collections.some(
          collection => collection.type === CollectionType.Saved
        )
      : false,
  );

  useEffect(() => {
    if (userBook.collections) {
      const complete = userBook.collections.some(
        collection => collection.type === CollectionType.Complete,
      );
      const active = userBook.collections.some(
        collection => collection.type === CollectionType.Active,
      );
      const saved = userBook.collections.some(
        collection => collection.type === CollectionType.Saved,
      );

      setHasComplete(complete);
      setHasActive(active);
      setHasSaved(saved);
    } else {
      setHasComplete(false);
      setHasActive(false);
      setHasSaved(false);
    }
  }, [userBook.collections]);

  return {
    hasComplete,
    hasActive,
    hasSaved,
  };
};

export const RefreshBook = (
  booksApi: BooksApi,
  book: UserBookRead,
  setBook: Dispatch<SetStateAction<UserBookRead>>,
) => {
  return async () => {
    try {
      const response = await booksApi.getBookBookBookIdGet(book.book.id);
      setBook(response.data);
    } catch (e) {
      console.log(e);
    }
  };
};

export const ReviewIndicator = ({completed, review}: ReviewIndicatorProps) => {
  if (!review) {
    return completed ? (
      <View style={styles.ratingIndicatorContainer}>
        <IconButton
          iconColor={reactionColorMap[Reaction.Positive]}
          icon={'check-all'}
        />
      </View>
    ) : null;
  }

  const color = reactionColorMap[review.reaction];
  return (
    <View style={styles.ratingIndicatorContainer}>
      <Text style={[styles.ratingIndicatorText, {color}]}>
        {review.rating.toFixed(1)}
      </Text>
    </View>
  );
};

interface MenuButtonProps {}

const MenuButton = ({}: MenuButtonProps) => {
  const [visible, setVisible] = useState<boolean>(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={
        <IconButton
          style={styles.rightIcon}
          icon="dots-vertical"
          onPress={openMenu}
        />
      }>
      <Menu.Item
        leadingIcon={'book-plus'}
        onPress={() => {}}
        title="Add to collection"
      />
    </Menu>
  );
};

interface RightIndicatorsProps {
  book: UserBookRead;
  collectionsApi: CollectionsApi;
  refreshBook: () => void;
}

export const RightIndicators = ({
  book,
  collectionsApi,
  refreshBook,
}: RightIndicatorsProps) => {
  const {user: bibliUser} = useContext(UserContext);
  const {hasComplete, hasActive, hasSaved} = useHasCollections(book);

  const [bookmarked, setBookmarked] = useState<boolean>(hasSaved);
  const [reviewScoped, setReviewScoped] = useState<ReviewRead | undefined>(
    book.review,
  );
  const [visible, setVisible] = useState<boolean>(false);

  const bookmarkOnPress = async () => {
    try {
      const response = await collectionsApi.getCollectionsCollectionsGet(
        bibliUser?.id,
        CollectionType.Saved,
      );
      const collectionId = response.data[0]?.id;

      if (!collectionId) {
        throw new Error('Saved collection does not exist.');
      }

      const collectionBookLink: CollectionBookLink = {
        collection_id: collectionId,
        book_id: book.book.id,
      };

      if (bookmarked) {
        await collectionsApi.deleteCollectionBookLinkCollectionBookLinkDelete(
          collectionBookLink,
        );
      } else {
        await collectionsApi.postCollectionBookLinkCollectionBookLinkPost(
          collectionBookLink,
        );
      }

      setBookmarked(!bookmarked);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={styles.rightContainer}>
      {reviewScoped || hasComplete ? (
        <ReviewIndicator completed={hasComplete} review={reviewScoped} />
      ) : (
        <>
          {visible && (
            <ReviewModal
              visible={visible}
              setVisible={setVisible}
              userBook={book}
            />
          )}
          <IconButton
            style={styles.rightIcon}
            icon={'star-plus-outline'}
            onPress={() => setVisible(true)}
          />
          {/*<IconButton*/}
          {/*  style={styles.rightIcon}*/}
          {/*  icon={bookmarked ? 'bookmark' : 'bookmark-outline'}*/}
          {/*  onPress={bookmarkOnPress}*/}
          {/*/>*/}
          <SavedIndicator
            bibliUser={bibliUser}
            collectionsApi={collectionsApi}
            book={book}
            refreshBook={refreshBook}
            hasSaved={hasSaved}
          />
          <ActiveIndicator hasActive={hasActive} />
        </>
      )}
      <MenuButton />
    </View>
  );
};

const CardPress = (userBook: UserBookRead) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return () => {
    navigation.push('Book', {
      userBook: userBook,
    });
  };
};

interface Props {
  userBook: UserBookRead;
  booksApi: BooksApi;
  collectionsApi: CollectionsApi;
}

export const Item = ({userBook, booksApi, collectionsApi}: Props) => {
  const [book, setBook] = useState<UserBookRead>(userBook);
  const refreshBook = RefreshBook(booksApi, book, setBook);
  const title = userBook.book.subtitle
    ? `${userBook.book.title}: ${userBook.book.subtitle}`
    : userBook.book.title;

  return (
    <Card
      mode={'contained'}
      style={styles.container}
      theme={{
        colors: {surfaceVariant: LightTheme.colors.surface},
      }}
      onPress={CardPress(userBook)}>
      {/*TODO Hold for book blurb would be so cool*/}
      <Card.Title
        title={title}
        subtitle={userBook.authors?.map(author => author.name).join(', ')}
        left={props =>
          userBook.book.cover_link ? (
            <Image
              source={{uri: userBook.book.cover_link}}
              style={styles.bookImage}
            />
          ) : (
            <Avatar.Icon {...props} icon="book" />
          )
        }
        right={() => (
          <RightIndicators
            book={userBook}
            collectionsApi={collectionsApi}
            refreshBook={refreshBook}
          />
        )}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    elevation: 2,
  },
  bookImage: {
    height: 70,
    resizeMode: 'contain',
  },
  rightContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: -10,
  },
  rightIcon: {
    margin: 0,
    padding: 0,
    alignSelf: 'center',
  },
  ratingIndicatorContainer: {
    borderColor: LightTheme.colors.outlineVariant,
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  ratingIndicatorText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
});
