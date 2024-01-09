import {createContext, Dispatch, SetStateAction} from 'react';
import {UserRead} from '../generated/jericho';

export interface UserContextInterface {
  user: UserRead | null;
  setUser: Dispatch<SetStateAction<UserRead | null>>;
}

const initialContext: UserContextInterface = {
  user: null,
  setUser: () => {},
};

export const UserContext = createContext<UserContextInterface>(initialContext);
