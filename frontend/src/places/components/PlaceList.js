import React, { useContext } from "react";
import { AuthContext } from "../../shared/context/auth-context";

import Card from "../../shared/components/UIElements/Card";
import PlaceItem from "./PlaceItem";
import Button from "../../shared/components/FormElements/Button";
import "./PlaceList.css";

const PlaceList = (props) => {
  const auth = useContext(AuthContext);
  let message = "no places exist for the user :(";
  let button;
  if (props.items.length === 0) {
    if (!auth.isLoggedIn) {
      message = "is this your profile? looks empty. login and share some!";
      button = "login";
    } else if (auth.isLoggedIn && auth.userId === props.userId) {
      message = "you dont have places yet. share one?";
      button = "share place";
    }

    return (
      <div className="place-list center">
        <Card>
          <h2>{message}</h2>
          {button && <Button to="/places/new">{button}</Button>}
        </Card>
      </div>
    );
  }
  return (
    <ul className="place-list">
      {props.items.map((place) => (
        <PlaceItem
          key={place.id}
          id={place.id}
          image={place.image}
          title={place.title}
          desc={place.description}
          address={place.address}
          creatorId={place.creator}
          coords={place.location}
          onDelete={props.onDeletePlace}
        />
      ))}
    </ul>
  );
};

export default PlaceList;
