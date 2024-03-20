import {
  BookRead,
  BooksApi,
  Comparison,
  Reaction,
  ReviewPut,
  ReviewRead,
  ReviewsApi,
  UserBookRead,
  UserRead,
} from '../../generated/jericho';
import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import {UserContext} from '../../context';
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {LightTheme} from '../../styles/themes/LightTheme';
import {
  Avatar,
  Button,
  Card,
  Divider,
  IconButton,
  Modal,
  Portal,
  Text,
  TextInput,
  TouchableRipple,
} from 'react-native-paper';
import {RightIndicators} from './Item';
import {useApi} from '../../api';
import {User} from 'react-native-auth0';

const {width, height} = Dimensions.get('window');

interface ReactionTypeMetadata {
  color: string;
  ratingColor: string;
  text: string;
  icon: string;
}

// Define the mapping from indicators to colors
const reactionMap: {[key in Reaction]: ReactionTypeMetadata} = {
  [Reaction.Positive]: {
    color: 'rgba(109,217,109,0.9)',
    ratingColor: 'rgb(0,148,0)',
    text: 'Liked it!',
    icon: 'emoticon-happy-outline',
  },
  [Reaction.Neutral]: {
    color: 'rgba(243,211,84,0.9)',
    ratingColor: 'rgb(168,134,0)',
    text: 'Meh',
    icon: 'emoticon-neutral-outline',
  },
  [Reaction.Negative]: {
    color: 'rgba(239,118,119,0.7)',
    ratingColor: 'rgb(166,0,2)',
    text: 'Disliked it',
    icon: 'emoticon-sad-outline',
  },
};

interface ReactionButtonProps {
  type: Reaction;
  activeType: Reaction | null;
  setActiveType: Dispatch<SetStateAction<Reaction | null>>;
}

const ReactionButton = ({
  type,
  activeType,
  setActiveType,
}: ReactionButtonProps) => {
  return (
    <View style={styles.reactionButtonContainer}>
      <IconButton
        icon={reactionMap[type].icon}
        iconColor={'black'}
        style={{
          ...styles.reactionButton,
          backgroundColor: reactionMap[type].color,
          borderWidth: type === activeType ? 2 : 0,
          borderColor: LightTheme.colors.onSurface,
          opacity: activeType !== null && type !== activeType ? 0.4 : 1,
        }}
        onPress={() => setActiveType(type === activeType ? null : type)}
      />
      <Text style={{fontWeight: type === activeType ? 'bold' : 'normal'}}>
        {reactionMap[type].text}
      </Text>
    </View>
  );
};

interface ComparisonState {
  l: number;
  r: number;
  skipped: number[];
}

function getIndexToCompare(c: ComparisonState): number {
  if (c.r < c.l) {
    return -1;
  }

  let idx = Math.floor((c.r - c.l) / 2) + c.l;

  if (!c.skipped.includes(idx)) {
    return idx;
  }

  let [leftSkip, rightSkip] = [idx - 1, idx + 1];
  while (leftSkip >= c.l || rightSkip <= c.r) {
    if (leftSkip >= c.l) {
      if (!c.skipped.includes(leftSkip)) {
        return leftSkip;
      }
      leftSkip--;
    }
    if (rightSkip <= c.r) {
      if (!c.skipped.includes(rightSkip)) {
        return rightSkip;
      }
      rightSkip++;
    }
  }

  // In this case you have gone through all the options.
  // Clear the skipped array and try again.
  return idx;
}

interface BookCompareButtonPropsV2 {
  review?: ReviewRead;
  book: UserBookRead;
  onPress: () => void;
}

export const BookCompareButtonV2 = ({
  review,
  book,
  onPress,
}: BookCompareButtonPropsV2) => {
  return (
    <TouchableRipple
      onPress={onPress}
      style={{
        borderRadius: 10,
        borderWidth: 1,
      }}>
      <View
        style={{
          width: width / 3,
          minHeight: width / 3,
          maxHeight: width / 3 + 50,
          padding: 2,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {book.book.cover_link && (
          <Image
            source={{uri: book.book.cover_link}}
            style={{width: '40%', height: '40%', resizeMode: 'contain'}}
          />
        )}
        <Text
          style={{textAlign: 'center', fontWeight: 'bold'}}
          numberOfLines={3}>
          {book.book.title}
        </Text>
        {book.authors !== undefined && book.authors?.length > 0 && (
          <Text style={{textAlign: 'center'}} numberOfLines={2}>
            {book.authors[0].name}
          </Text>
        )}
        {review !== undefined && !review.hide_rank && (
          <Text
            style={{
              color: reactionMap[review.reaction].ratingColor,
              fontWeight: 'bold',
              textAlign: 'center',
            }}
            numberOfLines={1}>
            {review.rating.toFixed(1)}
          </Text>
        )}
      </View>
    </TouchableRipple>
  );
};

function allOptionsSkipped(c: ComparisonState): boolean {
  for (let i = c.l; i <= c.r; i++) {
    if (!c.skipped.includes(i)) {
      return false;
    }
  }
  return true;
}

interface CompareProps {
  userBook: UserBookRead;
  reviews: ReviewRead[];
  comparisonStates: ComparisonState[];
  setComparisonStates: Dispatch<SetStateAction<ComparisonState[]>>;
  setComparison: Dispatch<SetStateAction<Comparison | null>>;
}

export const Compare = ({
  userBook,
  reviews,
  comparisonStates,
  setComparisonStates,
  setComparison,
}: CompareProps) => {
  const {booksApi} = useApi();
  const initIdx = getIndexToCompare(
    comparisonStates[comparisonStates.length - 1],
  );
  const [comparisonIdx, setComparisonIdx] = useState<number>(initIdx);
  const [comparisonReview, setComparisonReview] = useState<ReviewRead>(
    reviews[initIdx],
  );
  const [comparisonBook, setComparisonBook] = useState<UserBookRead>();
  const [comparisonLoading, setComparisonLoading] = useState<boolean>(false);
  const [currentComparison, setCurrentComparison] = useState<Comparison>({});

  useEffect(() => {
    const idx = getIndexToCompare(
      comparisonStates[comparisonStates.length - 1],
    );
    setComparisonIdx(idx);
    console.log(idx);
    console.log(comparisonStates[comparisonStates.length - 1]);
  }, [comparisonStates]);

  useEffect(() => {
    setComparisonLoading(true);
    const newReview = reviews[comparisonIdx];
    const fetchBook = async () => {
      try {
        const response = await booksApi.getBookBookBookIdGet(
          newReview?.book_id ?? -1,
        );
        setComparisonReview(newReview);
        setComparisonBook(response.data);
      } catch (e) {
        console.log(`Error fetching book ${newReview?.book_id}:`, e);
      }
    };

    fetchBook().catch(e => console.log(e));
    setComparisonLoading(false);
  }, [booksApi, comparisonIdx, reviews]);

  const comparisonOnPress = () => {
    if (comparisonStates.length !== 0) {
      const updatedComparison: Comparison = {
        less_than_id: currentComparison.less_than_id,
        greater_than_id: reviews[comparisonIdx].book_id,
      };

      const latestComparison = comparisonStates[comparisonStates.length - 1];

      let r = comparisonIdx - 1;
      while (
        r >= latestComparison.l &&
        reviews[comparisonIdx].rank === reviews[r].rank
      ) {
        r--;
      }

      if (comparisonIdx === latestComparison.l || r < latestComparison.l) {
        setComparison(updatedComparison);
      } else {
        const newComparisonState: ComparisonState = {
          l: latestComparison.l,
          r: r,
          skipped: latestComparison.skipped,
        };
        setCurrentComparison(updatedComparison);
        setComparisonStates([...comparisonStates, newComparisonState]);
      }
    }
  };

  const userBookOnPress = () => {
    if (comparisonStates.length !== 0) {
      const updatedComparison: Comparison = {
        less_than_id: reviews[comparisonIdx].book_id,
        greater_than_id: currentComparison.greater_than_id,
      };

      const latestComparison = comparisonStates[comparisonStates.length - 1];

      let l = comparisonIdx + 1;
      while (
        l <= latestComparison.r &&
        reviews[comparisonIdx].rank === reviews[l].rank
      ) {
        l++;
      }

      if (comparisonIdx === latestComparison.r || l > latestComparison.r) {
        setComparison(updatedComparison);
      } else {
        const newComparisonState: ComparisonState = {
          l: l,
          r: latestComparison.r,
          skipped: latestComparison.skipped,
        };
        setCurrentComparison(updatedComparison);
        setComparisonStates([...comparisonStates, newComparisonState]);
      }
    }
  };

  const undoOnPress = () => {
    if (comparisonStates.length > 1) {
      setComparisonStates(comparisonStates.slice(0, -1));
    }
  };

  const skipOnPress = () => {
    if (comparisonStates.length !== 0) {
      const latestComparison = comparisonStates[comparisonStates.length - 1];
      const newComparisonState: ComparisonState = {
        l: latestComparison.l,
        r: latestComparison.r,
        skipped: [...latestComparison.skipped, comparisonIdx],
      };
      if (allOptionsSkipped(newComparisonState)) {
        newComparisonState.skipped = [comparisonIdx];
      }
      setComparisonStates([...comparisonStates, newComparisonState]);
    }
  };

  const equalOnPress = () => {
    const comparison: Comparison = {
      equal_to_id: reviews[comparisonIdx].book_id,
    };
    setComparison(comparison);
  };

  return comparisonReview && comparisonBook ? (
    <View style={{flexDirection: 'column', gap: 10}}>
      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          justifyContent: 'space-around',
          alignItems: 'center',
        }}>
        {!comparisonLoading && (
          <>
            <BookCompareButtonV2 book={userBook} onPress={userBookOnPress} />
            <BookCompareButtonV2
              review={comparisonReview}
              book={comparisonBook}
              onPress={comparisonOnPress}
            />
          </>
        )}
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}>
        {comparisonStates.length > 1 && (
          <Button
            style={{left: 0, position: 'absolute'}}
            icon={'undo'}
            onPress={undoOnPress}>
            Undo
          </Button>
        )}
        <Button
          style={{alignSelf: 'center'}}
          mode={'elevated'}
          icon={'equal'}
          onPress={equalOnPress}>
          Equal
        </Button>
        <Button
          style={{right: 0, position: 'absolute'}}
          icon={'redo'}
          onPress={skipOnPress}>
          Skip
        </Button>
      </View>
    </View>
  ) : (
    <></>
  );
};

interface ReviewModalProps {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  userBook: UserBookRead;
  currentReview?: ReviewRead;
}

export const ReviewModal = ({
  visible,
  setVisible,
  userBook,
}: ReviewModalProps) => {
  const {user: bibliUser} = useContext(UserContext);
  const {reviewsApi} = useApi();
  const [reactionType, setReactionType] = useState<Reaction | null>(null);
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [reviews, setReviews] = useState<ReviewRead[]>([]);
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    setReviews([]);
    setComparison(null);
    if (!bibliUser?.id || !reactionType) {
      return;
    }
    const fetchReviews = async () => {
      try {
        const response = await reviewsApi.getReviewsReviewsGet(
          undefined,
          bibliUser?.id,
        );
        const reviewsFiltered = response.data.filter(
          review => review.reaction === reactionType,
        );
        reviewsFiltered.sort((a, b) => a.rank - b.rank);
        setReviews(reviewsFiltered);
        if (reviewsFiltered.length === 0) {
          setComparison({});
        }
      } catch (e) {
        console.log(`Error fetching reviews for user ${bibliUser?.id}:`, e);
      }
    };

    fetchReviews().catch(e => console.log(e));
  }, [bibliUser?.id, reactionType, reviewsApi]);

  const [comparisonStates, setComparisonStates] = useState<ComparisonState[]>(
    [],
  );

  useEffect(() => {
    if (!reviews || reviews.length === 0) {
      setComparisonStates([]);
    } else {
      const initialComparisonState: ComparisonState = {
        l: 0,
        r: reviews.length - 1,
        skipped: [],
      };
      setComparisonStates([initialComparisonState]);
    }
  }, [reviews]);

  useEffect(() => {
    if (comparison) {
      console.log(comparison);
    }
  }, [comparison]);

  const onDismiss = () => {
    setReviews([]);
    setComparison(null);
    setReactionType(null);
    setVisible(false);
  };

  const onSubmit = async () => {
    if (reactionType && comparison) {
      const reviewPut: ReviewPut = {
        user_id: bibliUser?.id,
        book_id: userBook.book.id,
        notes: notes || undefined,
        reaction: reactionType,
        comparison: comparison,
      };
      try {
        await reviewsApi.putReviewReviewPut(reviewPut);
        onDismiss();
      } catch (e) {
        console.log(`Error fetching reviews for user ${bibliUser?.id}:`, e);
      }
    }
  };

  // @ts-ignore
  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss}>
        <View style={styles.modalContainer}>
          <View style={styles.foregroundContainer}>
            <View style={styles.bookDetail}>
              <Card>
                <Card.Title
                  title={userBook.book.title}
                  subtitle={userBook.authors
                    ?.map(author => author.name)
                    .join(', ')}
                  left={() =>
                    userBook.book.cover_link && (
                      <Image
                        source={{uri: userBook.book.cover_link}}
                        style={styles.bookImage}
                      />
                    )
                  }
                  right={() => (
                    <IconButton icon={'close'} onPress={onDismiss} />
                  )}
                />
              </Card>
            </View>
            <Text variant={'titleMedium'}>What'd you think?</Text>
            <View style={styles.reactionContainer}>
              <ReactionButton
                type={Reaction.Negative}
                activeType={reactionType}
                setActiveType={setReactionType}
              />
              <ReactionButton
                type={Reaction.Neutral}
                activeType={reactionType}
                setActiveType={setReactionType}
              />
              <ReactionButton
                type={Reaction.Positive}
                activeType={reactionType}
                setActiveType={setReactionType}
              />
            </View>
            {reactionType !== null && (
              <>
                {comparison === null && comparisonStates.length > 0 ? (
                  <>
                    <Divider bold={true} style={{width: '50%'}} />
                    <Compare
                      userBook={userBook}
                      reviews={reviews}
                      comparisonStates={comparisonStates}
                      setComparisonStates={setComparisonStates}
                      setComparison={setComparison}
                    />
                  </>
                ) : comparison !== null ? (
                  <>
                    <Divider bold={true} style={{width: '50%'}} />
                    <View
                      style={{
                        width: '100%',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 10,
                      }}>
                      <Text variant={'titleMedium'}>Any notes?</Text>
                      <TextInput
                        mode={'outlined'}
                        style={{width: '100%', maxHeight: 150}}
                        multiline={true}
                        placeholder={'Optional...'}
                        onChangeText={text => setNotes(text)}
                      />
                      <Button
                        style={{alignSelf: 'flex-end', margin: 5}}
                        labelStyle={{fontSize: 17}}
                        onPress={onSubmit}>
                        Submit
                      </Button>
                    </View>
                  </>
                ) : (
                  <></>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    // backgroundColor: LightTheme.colors.surfaceDisabled,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    alignContent: 'center',
    alignSelf: 'center',
  },
  foregroundContainer: {
    backgroundColor: LightTheme.colors.surface,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    alignSelf: 'flex-start',
    width: width - 20,
    padding: 10,
    borderRadius: 20,
    gap: 10,
    marginTop: -(height / 3),
  },
  bookDetail: {
    width: '100%',
  },
  bookImage: {
    height: '200%',
    resizeMode: 'contain',
  },
  reactionContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  reactionButtonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  reactionButton: {
    width: width / 4,
    height: 50,
  },
});
