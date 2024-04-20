import React, {useContext} from 'react';
import {View} from 'react-native';
import {UserRead} from '../../generated/jericho';
import {Divider} from 'react-native-paper';
import {UserContext} from '../../context';
import UserItem from './Item';

const UserList = ({users}: {users: UserRead[]}) => {
  const {user: bibliUser} = useContext(UserContext);

  return (
    <View>
      {users.map((item, index) => (
        <View key={item.id.toString()}>
          {bibliUser && <UserItem user={item} currentUser={bibliUser} />}
          {index !== users.length - 1 && <Divider bold={true} />}
        </View>
      ))}
    </View>
  );
};

export default UserList;
