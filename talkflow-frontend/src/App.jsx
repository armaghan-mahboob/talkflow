import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Landing from "@/pages/Landing";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Chat from "@/pages/Chat";
import ProtectedRoute from "@/components/ProtectedRoute";
import Conversation from "@/pages/Conversation";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:conversationId"
          element={
            <ProtectedRoute>
              <Conversation />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
