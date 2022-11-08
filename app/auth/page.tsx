import React from "react";
import SignUp from "./signUp";
import LogIn from "./logIn";

interface Props {}

function DrawReact(props: Props) {
  const {} = props;

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <SignUp />
      {false && <LogIn />}
    </div>
  );
}

export default DrawReact;
