import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";

import { AuthContext } from "../../shared/context/auth-context";

import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import "./PlaceForm.css";

const NewPlace = () => {
  const auth = useContext(AuthContext); // sets up a listener
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [formState, inputHandler] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
      description: {
        value: "",
        isValid: false,
      },
      address: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  const history = useHistory();
  const placeSubmitHandler = async (event) => {
    //  const { title, desc, address, creator } = req.body;
    event.preventDefault();
    try {
      await sendRequest(
        "http://localhost:5000/api/places",
        "POST",
        JSON.stringify({
          title: formState.inputs.title.value,
          desc: formState.inputs.description.value,
          address: formState.inputs.address.value,
          creator: auth.userId,
        }),
        { "Content-Type": "application/json" }
      );
      history.push('/');
    } catch (e) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <form className="place-form" onSubmit={placeSubmitHandler}>
        {isLoading && <LoadingSpinner asOverlay />}
        <Input
          id="title"
          element="input"
          type="text"
          label="title"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="enter valid title"
          onInput={inputHandler}
        />
        <Input
          id="description"
          element="textarea"
          label="description"
          validators={[VALIDATOR_REQUIRE(), VALIDATOR_MINLENGTH(5)]}
          errorText="enter valid description of at least 5 characters"
          onInput={inputHandler}
        />
        <Input
          id="address"
          element="input"
          label="address"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="enter valid adress"
          onInput={inputHandler}
        />
        <Button type="submit" disabled={!formState.isValid}>
          add place
        </Button>
      </form>
    </React.Fragment>
  );
};

export default NewPlace;
