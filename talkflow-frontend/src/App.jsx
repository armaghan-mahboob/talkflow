import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Chat from "@/pages/Chat";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />

        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
