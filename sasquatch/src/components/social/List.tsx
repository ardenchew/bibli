import React from 'react';
import {View} from 'react-native';
import CollectionItem from './Item';
import {UserRead} from '../../generated/jericho';
import {Divider} from 'react-native-paper';

// Example usage in a component
const UserList = ({users}: {users: UserRead[]}) => {
  return (
    <View>
      {users.map((item, index) => (
        <View key={item.id.toString()}>
          <CollectionItem user={item} />
          {index !== users.length - 1 && <Divider bold={true} />}
        </View>
      ))}
    </View>
  );
};

export default UserList;
