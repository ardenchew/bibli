import React, {useContext} from 'react';
import {View} from 'react-native';
import CollectionItem from './Item';
import {UserRead} from '../../generated/jericho';
import {Divider} from 'react-native-paper';
import {UserContext} from '../../context';
import {useApi} from '../../api';

const UserList = ({users}: {users: UserRead[]}) => {
  const {user: bibliUser} = useContext(UserContext);
  const {usersApi} = useApi();

  return (
    <View>
      {users.map((item, index) => (
        <View key={item.id.toString()}>
          {bibliUser && (
            <CollectionItem
              user={item}
              currentUser={bibliUser}
              api={usersApi}
            />
          )}
          {index !== users.length - 1 && <Divider bold={true} />}
        </View>
      ))}
    </View>
  );
};

export default UserList;
