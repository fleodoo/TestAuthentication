import React from 'react';

const FirebaseContext = React.createContext<any>(null)

export const withFirebase = (Component: React.ComponentType) => (props: any) => (
    <FirebaseContext.Consumer>
        {firebase => <Component {...props} firebase={firebase} />}
    </FirebaseContext.Consumer>
)

export default FirebaseContext;