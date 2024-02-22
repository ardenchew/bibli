import React, {useContext, useState, useRef} from 'react';
import {StyleSheet, Image, Text, View} from 'react-native';
import {Card, Avatar, IconButton} from 'react-native-paper';
import {
  CollectionBookLink,
  CollectionType,
  Reaction,
  ReviewRead,
  UserBookRead,
} from '../../generated/jericho';
import {LightTheme} from '../../styles/themes/LightTheme';
import {useApi} from '../../api';
import {UserContext} from '../../context'; // Adjust the import path

// Define the mapping from indicators to colors
const reactionColorMap: {[key in Reaction]: string} = {
  [Reaction.Positive]: '#0cb256', // green
  [Reaction.Neutral]: '#e39700', // yellow
  [Reaction.Negative]: '#d53325', // red
};

const ReviewIndicator = ({review}: {review: ReviewRead}) => {
  const color = reactionColorMap[review.reaction];
  return (
    <View style={styles.ratingIndicatorContainer}>
      <Text style={[styles.ratingIndicatorText, {color}]}>
        {review.rating.toFixed(1)}
      </Text>
    </View>
  );
};

interface RightIndicators {
  book: UserBookRead;
  hasCompleteCollection: boolean;
  hasSavedCollection: boolean;
}

const RightIndicators = ({
  book,
  hasCompleteCollection,
  hasSavedCollection,
}: RightIndicators) => {
  const {user: bibliUser} = useContext(UserContext);
  const {collectionsApi} = useApi();

  const [completed, setCompleted] = useState<boolean>(hasCompleteCollection);
  const [bookmarked, setBookmarked] = useState<boolean>(hasSavedCollection);
  const [reviewScoped, setReviewScoped] = useState<ReviewRead | undefined>(
    book.review,
  );

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
      {reviewScoped ? (
        <ReviewIndicator review={reviewScoped} />
      ) : completed ? (
        <>
          <IconButton style={styles.rightIcon} icon={'check-all'} />
        </>
      ) : (
        <>
          <IconButton
            style={styles.rightIcon}
            icon={'star-plus-outline'}
            onPress={() => {}}
          />
          <IconButton
            style={styles.rightIcon}
            icon={bookmarked ? 'bookmark' : 'bookmark-outline'}
            onPress={bookmarkOnPress}
          />
        </>
      )}
      <IconButton
        style={styles.rightIcon}
        icon={'dots-vertical'}
        onPress={() => {}}
        rippleColor={'transparent'}
      />
    </View>
  );
};

interface Props {
  userBook: UserBookRead;
}

const Item = ({userBook}: Props) => {
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
      }}>
      <Card.Title
        title={title}
        subtitle={userBook.authors?.join(', ')}
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
  },
  rightIcon: {
    margin: 0,
    marginLeft: -10,
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

export default Item;
