"use client";
import React, { useState } from "react";
import { supabase } from "../../utils/supabaseClient";

interface Props {}

async function signUp(props: Props) {
  //   const [email, setEmail] = useState("Enter Your Email");
  const [password, setPassword] = useState("Enter a strong password");

  const { data, error } = await supabase.auth.signUp({
    email: "example@email.com",
    password: "example-password",
  });

  const {} = props;

  return (
    <div className="flex flex-col min-h-screen bg-grey-lighter bg-[#C7B9FF]">
      <div className="container flex flex-col items-center justify-center flex-1 max-w-sm px-2 mx-auto">
        <div className="w-full px-6 py-8 text-black bg-white rounded shadow-md">
          <h1 className="mb-8 text-3xl text-center">Sign up</h1>
          <input
            type="text"
            className="block w-full p-3 mb-4 border rounded border-grey-light"
            name="fullname"
            placeholder="Full Name"
          />

          <input
            type="text"
            className="block w-full p-3 mb-4 border rounded border-grey-light"
            name="email"
            placeholder="Email"
          />

          <input
            type="password"
            className="block w-full p-3 mb-4 border rounded border-grey-light"
            name="password"
            placeholder="Password"
          />
          <input
            type="password"
            className="block w-full p-3 mb-4 border rounded border-grey-light"
            name="confirm_password"
            placeholder="Confirm Password"
          />

          <button
            type="submit"
            className="w-full py-3 my-1 text-center text-white rounded bg-green hover:bg-green-dark focus:outline-none"
          >
            Create Account
          </button>

          <div className="mt-4 text-sm text-center text-grey-dark">
            By signing up, you agree to the
            <a
              className="no-underline border-b border-grey-dark text-grey-dark"
              href="#"
            >
              Terms of Service
            </a>{" "}
            and
            <a
              className="no-underline border-b border-grey-dark text-grey-dark"
              href="#"
            >
              Privacy Policy
            </a>
          </div>
        </div>

        <div className="mt-6 text-grey-dark">
          Already have an account?
          <a
            className="no-underline border-b border-blue text-blue"
            href="../login/"
          >
            Log in
          </a>
          .
        </div>
      </div>
    </div>
  );
}

export default signUp;
