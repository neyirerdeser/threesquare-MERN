import React, { useState, useContext } from "react";
import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";

import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import Card from "../../shared/components/UIElements/Card";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import { AuthContext } from "../../shared/context/auth-context";
import "./Auth.css";

const Auth = () => {
  const auth = useContext(AuthContext);
  const [isLoginMode, setIsLoginMode] = useState(false); // the mode is login or not (ie signup)
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const defaultImage = 'http://localhost:5000/uploads/images/default-user.png';
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
      image: {
        value: null,
        isValid: true,
      },
    },
    false
  );

  const authSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      let responseData;
      if (isLoginMode) {
        responseData = await sendRequest(
          "http://localhost:5000/api/users/login",
          "POST",
          JSON.stringify({
            email: formState.inputs.email.value,
            password: formState.inputs.password.value,
          }),
          { "Content-Type": "application/json" }
        );
      } else {
        const formData = new FormData();
        formData.append("name", formState.inputs.name.value);
        formData.append("email", formState.inputs.email.value);
        formData.append("password", formState.inputs.password.value);
        formData.append("image", formState.inputs.image.value);

        responseData = await sendRequest(
          "http://localhost:5000/api/users/signup",
          "POST",
          formData
        );
      }
      auth.login(responseData.user._id);
    } catch (e) {}
  };

  const switchModeHandler = () => {
    if (!isLoginMode) {
      // switching to login
      setFormData(
        {
          ...formState.inputs,
          name: undefined,
          image: undefined,
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {
      // switching to signup
      setFormData(
        {
          ...formState.inputs,
          name: {
            value: "",
            isValid: false,
          },
          image: {
            value: null,
            isValid: true,
          },
        },
        false
      );
    }
    setIsLoginMode((prevMode) => !prevMode);
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Card className="authentication">
        {isLoading && <LoadingSpinner asOverlay />}
        {isLoginMode ? <h1>login please</h1> : <h1>signup</h1>}
        <Button center inverse onClick={switchModeHandler}>
          {isLoginMode
            ? "no account? sign up!"
            : "already have an account? login!"}
        </Button>
        <form className="authentication form" onSubmit={authSubmitHandler}>
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
            validators={[VALIDATOR_MINLENGTH(6)]}
            errorText="enter your password of at least 6 length"
            onInput={inputHandler}
          />
          {!isLoginMode && (
            <ImageUpload center id="image" onInput={inputHandler} initialValue={defaultImage}/>
          )}
          <Button type="submit" disabled={!formState.isValid}>
            {isLoginMode ? "login" : "sign up"}
          </Button>
        </form>
      </Card>
    </React.Fragment>
  );
};

export default Auth;
