import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {Item} from './Item';
import {
  BooksApi,
  CollectionRead,
  CollectionsApi,
  ReviewsApi,
  UserBookRead,
  UserRead,
} from '../../generated/jericho';
import {Divider} from 'react-native-paper';

interface Props {
  userBooks: UserBookRead[];
  currentOwnedCollection?: CollectionRead;
  owner?: UserRead;
  ownerBooks?: UserBookRead[];
}

interface MergedBook {
  bookId: number;
  userBook: UserBookRead;
  ownerBook?: UserBookRead;
}

function mergeLists(
  userBooks: UserBookRead[],
  ownerBooks?: UserBookRead[],
): MergedBook[] {
  return userBooks.map(userBook => ({
    bookId: userBook.book.id,
    userBook,
    ownerBook: ownerBooks
      ? ownerBooks.find(book => book.book.id === userBook.book.id)
      : undefined,
  }));
}

export const List = ({
  userBooks,
  currentOwnedCollection,
  owner,
  ownerBooks,
}: Props) => {
  const [mergedBooks, setMergedBooks] = useState<MergedBook[]>();

  useEffect(() => {
    const result = mergeLists(userBooks, ownerBooks);
    setMergedBooks(result);
  }, [owner, ownerBooks, userBooks]);

  return mergedBooks ? (
    <View>
      {mergedBooks.map((item, index) => (
        <View key={item.bookId.toString()}>
          <Item
            userBook={item.userBook}
            currentOwnedCollection={currentOwnedCollection}
            owner={owner}
            ownerBook={item.ownerBook}
          />
          {index !== userBooks.length - 1 && <Divider bold={true} />}
        </View>
      ))}
    </View>
  ) : null;
};
