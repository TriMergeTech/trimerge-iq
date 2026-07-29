"use client";

import LoginPage from "../_shared/LoginPage";
import Navbar from "../_shared/Navbar";

const Signin = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <LoginPage kind="staff" />
    </div>
  );
};

export default Signin;
