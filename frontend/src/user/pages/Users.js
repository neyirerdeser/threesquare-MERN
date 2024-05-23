import React, { useEffect, useState } from "react";
import { useHttpClient } from "../../shared/hooks/http-hook";

import UsersList from "../components/UsersList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";

const Users = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedUsers, setLoadedUsers] = useState();

  // the function useEffect takes as argument should not be async, we dont want promises
  // insterad we use an "IIFE" (immediately invoked function expression) <iffy>
  useEffect(() => {
    const fetchUsers = async () => {
      try{
        const responseData = await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/users`);
        setLoadedUsers(responseData.users)
      }catch(e){}
    };
    fetchUsers();
  }, [sendRequest]);

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedUsers && <UsersList items={loadedUsers} />}
    </React.Fragment>
  );
};

export default Users;
