"use client";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [isLoggedIn, setLoggedIn] = useState();
  return (
    <div>
      <Head>
        <title>Collabrush</title>
        <meta
          name="description"
          content="Collaborate and Paint online with natural brushes, and edit your drawings. Free. Import, save, and upload images."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className="w-screen lg:h-screen h-[600px] md:h-[600px]"
        style={{
          backgroundImage: `url("/Collabrush.png")`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div className="flex flex-row items-center justify-end w-full h-24 px-12 space-x-4">
          <div className="text-xl text-white hover:underline md:text-lg lg:text-base">
            {isLoggedIn ? `Log Out` : `Log In`}
          </div>
          <div className="px-2 py-1 md:text-lg lg:text-base shadow-2xl text-black bg-[#FFC700] border-black border-[3px] hover:-translate-y-1 duration-500">
            {isLoggedIn ? `Dashboard` : `Get Started`}
          </div>
        </div>
      </div>
      <div className="bg-[#FFDE59] h-96"></div>
      <footer className="px-4 py-2 text-sm text-center bg-purple-900">
        🧑🏻‍💻 Developed by Priyav and Sanskar
      </footer>
    </div>
  );
}
