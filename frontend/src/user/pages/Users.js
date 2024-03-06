import React from "react";

import UsersList from "../components/UsersList";

const Users = () => {
  const USERS = [
    {
      id: "u1",
      name: "neyir e.",
      image:
        "https://media.gettyimages.com/id/1399306033/vector/new-year-rabbit-paperart.jpg?s=1024x1024&w=gi&k=20&c=XelSlj9TWzEQME0eoAuURk6IeGy86J_Z0KYwqXQH1ew=",
      places: 2,
    },
  ];
  return <UsersList items={USERS} />;
};

export default Users;
