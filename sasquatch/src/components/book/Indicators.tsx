import React, {useEffect, useState} from 'react';
import {
  CollectionBookLink,
  CollectionsApi,
  CollectionType,
  Reaction,
  ReviewRead,
  ReviewsApi,
  UserBookRead,
  UserRead,
} from '../../generated/jericho';
import {IconButton, Tooltip} from 'react-native-paper';
import {StyleSheet, Text, View} from 'react-native';
import {LightTheme} from '../../styles/themes/LightTheme';
import {ReviewModal} from './Review';

export const IdCollectionOnPress = (
  collectionsApi: CollectionsApi,
  book: UserBookRead,
  collectionId: number,
  add: boolean,
) => {
  return async () => {
    try {
      const collectionBookLink: CollectionBookLink = {
        collection_id: collectionId,
        book_id: book.book.id,
      };

      if (add) {
        await collectionsApi.postCollectionBookLinkCollectionBookLinkPost(
          collectionBookLink,
        );
      } else {
        await collectionsApi.deleteCollectionBookLinkCollectionBookLinkDelete(
          collectionBookLink,
        );
      }
    } catch (e) {
      console.log(e);
    }
  };
};

export const TypedCollectionOnPress = (
  bibliUser: UserRead | null,
  collectionsApi: CollectionsApi,
  book: UserBookRead,
  type: CollectionType,
  add: boolean,
) => {
  return async () => {
    try {
      const response = await collectionsApi.getCollectionsCollectionsGet(
        bibliUser?.id,
        type,
      );
      const collectionId = response.data[0]?.id;

      if (!collectionId) {
        throw new Error('Collection does not exist.');
      }

      const collectionBookLink: CollectionBookLink = {
        collection_id: collectionId,
        book_id: book.book.id,
      };

      if (add) {
        await collectionsApi.postCollectionBookLinkCollectionBookLinkPost(
          collectionBookLink,
        );
        if (type === CollectionType.Complete) {
          const saved = book.collections?.find(
            collection => collection.type === CollectionType.Saved,
          );
          if (saved) {
            await collectionsApi.deleteCollectionBookLinkCollectionBookLinkDelete(
              {
                collection_id: saved.id,
                book_id: book.book.id,
              },
            );
          }

          const active = book.collections?.find(
            collection => collection.type === CollectionType.Active,
          );
          if (active) {
            await collectionsApi.deleteCollectionBookLinkCollectionBookLinkDelete(
              {
                collection_id: active.id,
                book_id: book.book.id,
              },
            );
          }
        }
      } else {
        await collectionsApi.deleteCollectionBookLinkCollectionBookLinkDelete(
          collectionBookLink,
        );
      }
    } catch (e) {
      console.log(e);
    }
  };
};

export const DeleteReviewOnPress = (
  reviewsApi: ReviewsApi,
  review: ReviewRead,
) => {
  return async () => {
    if (!review || !review.user_id || !review.book_id) {
      return;
    }
    try {
      await reviewsApi.deleteReviewReviewUserIdBookIdDelete(
        review.user_id,
        review.book_id,
      );
    } catch (e) {
      console.log(`Failed to remove review: ${e}`);
    }
  };
};

interface RateIndicatorProps {
  book: UserBookRead;
}

export const RateIndicator = ({book}: RateIndicatorProps) => {
  const [visible, setVisible] = useState<boolean>(false);

  return (
    <>
      {visible && (
        <ReviewModal
          visible={visible}
          setVisible={setVisible}
          userBook={book}
        />
      )}
      <IconButton
        style={styles.icon}
        icon={'star-plus-outline'}
        onPress={() => setVisible(true)}
      />
    </>
  );
};

// Define the mapping from indicators to colors
const reactionColorMap: {[key in Reaction]: string} = {
  [Reaction.Positive]: '#0cb256', // green
  [Reaction.Neutral]: '#e39700', // yellow
  [Reaction.Negative]: '#d53325', // red
};

interface ReviewIndicatorProps {
  review?: ReviewRead;
}

export const ReviewIndicator = ({review}: ReviewIndicatorProps) => {
  if (!review) {
    return null;
  }
  if (review.hide_rank) {
    return (
      <Tooltip
        title={'Ratings are hidden until 5 reviews are complete.'}
        enterTouchDelay={0}>
        <View style={styles.ratingIndicatorContainer}>
          <Text
            style={[
              styles.ratingIndicatorText,
              {color: LightTheme.colors.onSurface},
            ]}>
            ?
          </Text>
        </View>
      </Tooltip>
    );
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

interface CompleteIndicatorProps {
  hasComplete: boolean;
}

export const CompleteIndicator = ({hasComplete}: CompleteIndicatorProps) => {
  return hasComplete ? (
    <View style={styles.ratingIndicatorContainer}>
      <IconButton
        iconColor={reactionColorMap[Reaction.Positive]}
        icon={'check'}
      />
    </View>
  ) : null;
};

interface ActiveIndicatorProps {
  hasActive: boolean;
}

export const ActiveIndicator = ({hasActive}: ActiveIndicatorProps) => {
  return hasActive ? (
    <IconButton style={styles.icon} icon={'book-open-variant'} />
  ) : null;
};

interface SavedIndicatorProps {
  bibliUser: UserRead | null;
  collectionsApi: CollectionsApi;
  book: UserBookRead;
  hasSaved: boolean;
  refreshBook: () => void;
}

export const SavedIndicator = ({
  bibliUser,
  collectionsApi,
  book,
  refreshBook,
  hasSaved,
}: SavedIndicatorProps) => {
  const [icon, setIcon] = useState<string>(
    hasSaved ? 'bookmark' : 'bookmark-outline',
  );

  useEffect(() => {
    setIcon(hasSaved ? 'bookmark' : 'bookmark-outline');
  }, [hasSaved]);

  const onPress = async () => {
    setIcon(hasSaved ? 'bookmark' : 'bookmark-outline'); // slightly faster response, will revert if failed.

    await TypedCollectionOnPress(
      bibliUser,
      collectionsApi,
      book,
      CollectionType.Saved,
      !hasSaved,
    )();

    refreshBook();
  };

  return (
    <IconButton
      style={styles.icon}
      icon={icon}
      onPress={bibliUser?.id === book.user_id ? onPress : undefined}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
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
