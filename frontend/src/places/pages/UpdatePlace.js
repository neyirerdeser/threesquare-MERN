import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { useHistory } from "react-router-dom";

import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import Card from "../../shared/components/UIElements/Card";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from "../../shared/util/validators";
import "./PlaceForm.css";

/*
const DUMMY_PLACES = [
  {
    id: "p1",
    title: "ESB",
    description: "empire  states building",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRv9gPHglxY9Lf6Sf8Eu42-Y4WEztatMLvYXin3-Mhc81AnGFgz-hsKs-AwTwMQjaVbKBc&usqp=CAU",
    address: "West 34th Street, New York, NY, USA",
    location: {
      lat: 40.7484405,
      lng: -73.9878584,
    },
    creator: "u1",
  },
  {
    id: "p2",
    title: "ESB",
    description: "empire  states building",
    imageUrl:
      "https://media.gettyimages.com/id/846410892/photo/manhattan-skyline-on-a-sunny-day-empire-state-building-on-the-right-new-york-united-states.jpg?s=1024x1024&w=gi&k=20&c=tZPAH2H-jZABuc4wlzNTI0NgopTsA6mNO4SkMcncJCM=",
    address: "West 34th Street, New York, NY, USA",
    location: {
      lat: 40.7484405,
      lng: -73.9878584,
    },
    creator: "u2",
  },
];
*/

const UpdatePlace = () => {
  const [loadedPlace, setLoadedPlace] = useState();
  const placeId = useParams().pid;
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
      description: {
        value: "",
        isValid: false,
      },
      image: {
        value: "",
        isValid: false,
      }
    },
    false
  );

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const responseData = await sendRequest(
          `http://localhost:5000/api/places/${placeId}`
        );
        setLoadedPlace(responseData.place);
        // set doesnt take effect immediately so dont use loadedPlace.
        // its literally useless -_-
        // ill leave setFormData uncommented incase of future issues but is not useful currently
        setFormData(
          {
            title: {
              value: responseData.place.title,
              isValid: true,
            },
            description: {
              value: responseData.place.description,
              isValid: true,
            },
            image: {
              value: responseData.place.image,
              isValid: true,
            },
          },
          true
        );
      } catch (e) {}
    };
    fetchPlace();
  }, [sendRequest, placeId, setFormData]);

  const history = useHistory();
  const submitHandler = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", formState.inputs.title.value);
      formData.append("description", formState.inputs.description.value);
      formData.append("image", formState.inputs.image.value);
      await sendRequest(
        `http://localhost:5000/api/places/${placeId}`,
        "PATCH",
        formData
      );
      history.push(`/${loadedPlace.creator}/places`);
    } catch (e) {}
  };

  if (isLoading)
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );
  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {!loadedPlace && !error && (
        <div className="center">
          <Card>
            <h2>couldn't find said place</h2>
          </Card>
        </div>
      )}
      {loadedPlace && (
        <form className="place-form" onSubmit={submitHandler}>
          <Input
            id="title"
            element="input"
            type="text"
            label="title"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="please enter valid title"
            onInput={inputHandler}
            initialValue={loadedPlace.title}
            initialValid={true}
          />
          <Input
            id="description"
            element="textarea"
            label="description"
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText="please enter valid description of at least 5 characters"
            onInput={inputHandler}
            initialValue={loadedPlace.description}
            initialValid={true}
          />
          <ImageUpload center id="image" onInput={inputHandler} initialValue={`http://localhost:5000/${loadedPlace.image}`} />
          <Button type="submit" disabled={!formState.isValid}>
            update place
          </Button>
        </form>
      )}
    </React.Fragment>
  );
};

export default UpdatePlace;
