import React, { useEffect, useState } from "react";
import { compose } from "recompose";
import { useTranslation } from "react-i18next";
import { withAuthorization, withEmailVerification } from "../Session";
import * as ROLES from "../../constants/roles";
import { withFirebase } from "../Firebase";

interface AdminState {
  loading: boolean;
  users: any[];
}
const initState = (): AdminState => {
  return {
    loading: false,
    users: [],
  };
};

const AdminPage = (props: any) => {
  const { t } = useTranslation();
  const [state, setState] = useState<AdminState>(initState());

  useEffect(() => {
    setState((prevState: AdminState) => ({ ...prevState, loading: true }));
    props.firebase.users().on("value", (snapshot: any) => {
      const usersObject = snapshot.val();
      const usersList = Object.keys(usersObject).map((key) => ({
        ...usersObject[key],
        uid: key,
      }));
      setState({
        users: usersList,
        loading: false,
      });
    });
    return () => {
      props.firebase.users().off();
    };
  }, [props.firebase]);

  const { users, loading } = state;
  return (
    <div>
      <h1>{t("Admin")}</h1>
      <p>
        {t("Restricted area! Only users with the admin role are authorized.")}
      </p>
      {loading && <div>{t("Loading")}...</div>}
      <UserList users={users} />
    </div>
  );
};

interface UserListProps {
  users: any[];
}

const UserList = (props: UserListProps) => {
  const { t } = useTranslation();
  return (
    <ul>
      {props.users.map((user: any) => (
        <li key={user.uid}>
          <span>
            <strong>{t("ID")}:</strong> {user.uid}
          </span>
          <span>
            <strong>{t("Email address")}:</strong> {user.email}
          </span>
          <span>
            <strong>{t("Username")}:</strong> {user.username}
          </span>
        </li>
      ))}
    </ul>
  );
};
const condition = (authUser: any) => authUser && !!authUser.roles[ROLES.ADMIN];
export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(AdminPage);
