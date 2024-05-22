import { useState, useCallback, useEffect } from "react";

let logoutTimer; // declare outside hook, to avoid re-render with var change

export const useAuth = () => {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState();

  const login = useCallback((uid, token, expiryDate) => {
    setToken(token);
    setUserId(uid);
    const tokenExpiryDate =
      expiryDate || new Date(new Date().getTime() + 1000 * 60 * 60); // ms -> 1hr
    setTokenExpiry(tokenExpiryDate);

    localStorage.setItem(
      "userData",
      JSON.stringify({
        userId: uid,
        token,
        expiry: tokenExpiryDate.toISOString(),
      })
    );
  }, []);
  const logout = useCallback(() => {
    setToken(null);
    setUserId(null);
    setTokenExpiry(null);
    localStorage.removeItem("userData");
  }, []);

  useEffect(() => {
    if (token) {
      const remainingTime = tokenExpiry.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpiry]); // token changes with login or logout

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("userData"));
    if (
      storedData &&
      storedData.token &&
      new Date(storedData.expiry) > new Date()
    )
      login(storedData.userId, storedData.token, new Date(storedData.expiry));
  }, [login]);
  // this will cause a flash since the first render isnt authenticated and second render is
  // a splashback is a solution but not really needed here

  return { token, userId, login, logout };
};
