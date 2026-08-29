import { Navigate } from "react-router-dom";

function Landing() {
  const user = localStorage.getItem("user");

  return user ? (
    <Navigate to="/chat" replace />
  ) : (
    <Navigate to="/signin" replace />
  );
}

export default Landing;
