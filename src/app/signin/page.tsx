"use client";

import LoginPage from "../components/LoginPage";
import Navbar from "../components/Navbar";

const Signin = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <LoginPage kind="staff" />
    </div>
  );
};

export default Signin;
