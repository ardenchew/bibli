import {
  CollectionRead,
  UserBookRead,
  UserRead,
} from '../../generated/jericho';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

export const CollectionPress = (collection: CollectionRead) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return () => {
    navigation.push('Collection', {
      collection: collection,
    });
  };
};

export const UserPress = (user: UserRead) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return () => {
    navigation.push('Profile', {
      profile: user,
    });
  };
};

export const BookPress = (userBook: UserBookRead) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return () => {
    navigation.push('Book', {
      userBook: userBook,
    });
  };
};
