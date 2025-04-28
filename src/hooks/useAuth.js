import { useState } from "react";

const BASE_URL = "http://localhost:3000";

export const useAuth = () => {
  const [error, setError] = useState("");
  const [flag, setFlag] = useState(false);
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });

  const authActions = {
    checkExistingUser: async (username, password, verifyPassword) => {
      if (password !== verifyPassword) {
        setError("The password is incorrect");
        return false;
      }

      try {
        const response = await fetch(
          `${BASE_URL}/users?username=${username}&website=${password}`
        );

        if (!response.ok) throw new Error("Error");
        const existingUser = await response.json();

        if (existingUser.length > 0) {
          throw new Error("User already exists");
        }

        setFlag(true);
        return true;
      } catch (error) {
        setError(error.message);
        return false;
      }
    },

    finalregister: async (data, password) => {
      try {
        const response = await fetch(`${BASE_URL}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            website: password,
          }),
        });
        if (!response.ok) throw new Error("Error");

        const newUser = await response.json();
        localStorage.setItem("currentUser", JSON.stringify(newUser));
        setUserData(newUser);
        return newUser;
      } catch (error) {
        setError(error.message);
        return null;
      }
    },

    login: async (data) => {
      try {
        const response = await fetch(
          `${BASE_URL}/users?username=${data.username}&website=${data.password}`
        );
        if (!response.ok) throw new Error("Error");
        const users = await response.json();

        if (!users || users.length === 0) {
          throw new Error("Invalid username or password");
        }

        const user = users[0];
        localStorage.setItem("currentUser", JSON.stringify(user));
        setUserData(user);
        return user;
      } catch (error) {
        setError(error.message);
        return null;
      }
    },

    logout: () => {
      localStorage.removeItem("currentUser");
      setUserData(null);
    },
  };

  return {
    error,
    setError,
    flag,
    setFlag,
    userData,
    setUserData,
    ...authActions,
  };
};
