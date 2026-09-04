import { useEffect } from "react";
import { Navigate } from "react-router-dom";

import { socket } from "@/lib/socket";

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem("user");

  useEffect(() => {
    if (user) {
      const parsedUser = JSON.parse(user);
      socket.auth = { userId: parsedUser.id };
      socket.connect();
      console.log("Socket connect requested for logged-in user");
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;
