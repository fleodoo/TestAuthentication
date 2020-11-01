import React, { ChangeEvent, useState } from 'react';
import { Link } from 'react-router-dom';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';


const PasswordForgetPage = () => (
    <div>
      <h1>PasswordForget</h1>
      <PasswordForgetForm />
    </div>
  );

interface PasswordForgetState {
    email: string,
    error: any,
}
const initState = ():PasswordForgetState=>{
    return {
        email: "",
        error: null,
    }
}

const PasswordForgetFormBase = (props:any) => {
    const [state, setState] = useState<PasswordForgetState>(initState());

    const onSubmit = (event: React.FormEvent) => {
        const { email } = state;
        props.firebase
          .doPasswordReset(email)
          .then(() => {
            setState(initState());
          })
          .catch((error: any) => {
            setState((prevState: PasswordForgetState) => ({ ...prevState, error }));
          });
        event.preventDefault();
      };

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        setState((prevState: PasswordForgetState) => ({ ...prevState, [name]: value }));
    };

    const { email, error } = state;
    const isInvalid = email === '';

    return (
        <form onSubmit={onSubmit}>
          <input
            name="email"
            value={state.email}
            onChange={onChange}
            type="text"
            placeholder="Email Address"
          />
          <button disabled={isInvalid} type="submit">
            Reset My Password
          </button>
          {error && <p>{error.message}</p>}
        </form>
      );
}

const PasswordForgetLink = () => (
    <p>
      <Link to={ROUTES.PASSWORD_FORGET}>Forgot Password?</Link>
    </p>
  );
export default PasswordForgetPage;
const PasswordForgetForm = withFirebase(PasswordForgetFormBase);
export { PasswordForgetForm, PasswordForgetLink };