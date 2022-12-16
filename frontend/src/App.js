import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Public from "./components/Public";
import Login from "./pages/auth/Login";
import DashLayout from "./components/DashLayout";
import Welcome from "./pages/auth/Welcome";
import NotesList from "./pages/notes/NotesList";
import UsersList from "./pages/users/UsersList";
import "./App.css";

function App() {
  return (
    <Routes>
      //! layout route
      <Route path="/" element={<Layout />}>
        {/* //< the main page is the public as its the index */}
        <Route index element={<Public />} />
        <Route path="login" element={<Login />} />
      {/* //< after login we go to the dashboard page straight to the welcome page as its the index */}
        <Route path="dash" element={<DashLayout />}>
          <Route index element={<Welcome />} />

        {/* //< notes section */}
          <Route path="notes">
            <Route index element={<NotesList />} />
          </Route>

        {/* //< users section */}
          <Route path="users">
            <Route index element={<UsersList />} />
          </Route>
          /
        </Route>
        {/* //< End DashLayout */}
      </Route>
       {/* //! end of layout route */}
    </Routes>
  );
}

export default App;
