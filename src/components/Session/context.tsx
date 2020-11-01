import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import React from 'react';

const AuthUserContext = React.createContext<FirebaseAuthTypes.User|null>(null);

export default AuthUserContext;