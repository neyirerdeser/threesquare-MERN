import React from "react";
import { useParams } from "react-router-dom";

import PlaceList from "../components/PlaceList";

const DUMMY_PLACES = [
  {
    id: "p1",
    title: "ESB",
    desc: "empire  states building",
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
    desc: "empire  states building",
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

const UserPlaces = () => {
  const userId = useParams().uid;
  const loadedPlaces = DUMMY_PLACES.filter((place) => place.creator === userId);
  return <PlaceList items={loadedPlaces} />;
};

export default UserPlaces;
