import React, { useState, useContext } from "react";
import { useForm } from "../../shared/hooks/form-hook";

import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import Card from "../../shared/components/UIElements/Card";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import { AuthContext } from "../../shared/components/context/auth-context";
import "./Auth.css";

const Auth = () => {
  const auth = useContext(AuthContext);
  const [isLoginMode, setIsLoginMode] = useState(true); // the mode is login or not (ie signup)
  const [formState, inputHandler, setFormData] = useForm(
    {
      email: {
        value: "",
        isValid: false,
      },
      password: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  const loginSubmitHandler = (event) => {
    event.preventDefault();
    console.log(formState.inputs);
    auth.login();

  };

  const switchModeHandler = () => {
    if (!isLoginMode) {
      // so we're about to SWITCH to login mode
      setFormData(
        {
          ...formState.inputs,
          name: undefined,
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {
      setFormData(
        {
          ...formState.inputs,
          name: {
            value: "",
            isValid: false,
          },
        },
        false
      );
    }
    setIsLoginMode((prevMode) => !prevMode);
  };

  return (
    <Card className="authentication">
      <h1>login please</h1>
      <form className="authentication form" onSubmit={loginSubmitHandler}>
        {!isLoginMode && (
          <Input
            id="name"
            element="input"
            type="text"
            label="your name"
            validators={[VALIDATOR_REQUIRE]}
            errorText="please enter your name"
            onInput={inputHandler}
          />
        )}
        <Input
          id="email"
          element="input"
          type="email"
          label="e-mail"
          validators={[VALIDATOR_EMAIL()]}
          errorText="please enter your email address"
          onInput={inputHandler}
        />
        <Input
          id="password"
          element="input"
          type="password"
          label="password"
          validators={[VALIDATOR_MINLENGTH(4)]}
          errorText="enter your password of at least 4 length"
          onInput={inputHandler}
        />
        <Button type="submit" disabled={!formState.isValid}>
          {isLoginMode ? "login" : "sign up"}
        </Button>
      </form>
      <Button inverse onClick={switchModeHandler}>
        {isLoginMode
          ? "no account? sign up!"
          : "already have an account? login!"}
      </Button>
    </Card>
  );
};

export default Auth;
