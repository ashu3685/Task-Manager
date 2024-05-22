// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from './frontend/Login.js';
import Registration from "./frontend/Registration.js";
import Home from "./frontend/Home.js";
import PrivateRoute from "./PrivateRoute.js"

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/home" element={<PrivateRoute Component={Home}/>} />
      </Routes>
    </Router>
  );
};

export default App;
