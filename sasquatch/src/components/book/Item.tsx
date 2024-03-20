import React, {useContext, useState} from 'react';
import {StyleSheet, Image, Text, View} from 'react-native';
import {Card, Avatar, IconButton, Menu} from 'react-native-paper';
import {
  CollectionBookLink, CollectionsApi,
  CollectionType,
  Reaction,
  ReviewRead,
  UserBookRead,
} from '../../generated/jericho';
import {LightTheme} from '../../styles/themes/LightTheme';
import {UserContext} from '../../context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ReviewModal} from './Review';
import {useLogout} from '../profile/Logout'; // Adjust the import path

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
  hasCompleteCollection: boolean;
  hasSavedCollection: boolean;
  collectionsApi: CollectionsApi;
  // reviewPress: null | ((event: GestureResponderEvent) => void) | undefined;
}

export const RightIndicators = ({
  book,
  hasCompleteCollection,
  hasSavedCollection,
  collectionsApi,
}: RightIndicatorsProps) => {
  // TODO useState with book so it can be updated.
  const {user: bibliUser} = useContext(UserContext);
  const [completed, setCompleted] = useState<boolean>(hasCompleteCollection);
  const [bookmarked, setBookmarked] = useState<boolean>(hasSavedCollection);
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

      console.log(book.book);

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
      {reviewScoped || completed ? (
        <ReviewIndicator completed={completed} review={reviewScoped} />
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
          <IconButton
            style={styles.rightIcon}
            icon={bookmarked ? 'bookmark' : 'bookmark-outline'}
            onPress={bookmarkOnPress}
          />
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
  collectionsApi: CollectionsApi;
}

export const Item = ({userBook, collectionsApi}: Props) => {
  const hasCompleteCollection =
    userBook.collections?.some(
      collection => collection.type === CollectionType.Complete,
    ) ?? false;
  const hasSavedCollection =
    userBook.collections?.some(
      collection => collection.type === CollectionType.Saved,
    ) ?? false;
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
            hasCompleteCollection={hasCompleteCollection}
            hasSavedCollection={hasSavedCollection}
            collectionsApi={collectionsApi}
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
