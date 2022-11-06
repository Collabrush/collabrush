"use client";

import Image from "next/image";
import React, { MouseEvent } from "react";
import ColorPanel from "./colorpanel";

import share from "./images/share.svg";
import download from "./images/download.svg";

const Button = (props: {
  image: any;
  active: any;
  handleClick: (
    arg0: React.MouseEvent<HTMLDivElement, MouseEvent>,
    arg1: any
  ) => void;
  name: any;
}) => {
  return (
    <div
      className={
        "rounded box-border h-8 m-px p-1 w-8 hover:bg-white duration-200 hover:shadow-md active:translate-y-0 active:opacity-80 group " +
        (props.active ? "bg-[#C7B9FF]" : "")
      }
      onClick={(e) => props.handleClick(e, props.name)}
    >
      <Image
        src={props.image}
        alt={props.name}
        className={
          "fill-[#6e6e6e] group-hover:fill-black " +
          (props.active ? "fill-white" : "")
        }
      />
    </div>
  );
};

const Toolbox = (props: {
  activeItem: any;
  items: any;
  color: any;
  setColor: any;
  handleClick: (
    arg0: React.MouseEvent<HTMLDivElement, MouseEvent>,
    arg1: any
  ) => void;
}) => {
  const items = props.items.map((item: { name: any; image: any }) => (
    <Button
      active={props.activeItem === item.name ? true : false}
      name={item.name}
      image={item.image}
      key={item.name}
      handleClick={props.handleClick}
    />
  ));

  const changeColor = (e: MouseEvent<HTMLDivElement>) => {
    props.setColor((e.target as HTMLDivElement).style.backgroundColor);
  };

  const handleShare = () => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "image.png";
    link.href = dataURL;
    link.click();
  };

  const handleDownload = () => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "image.png";
    link.href = dataURL;
    link.click();
  };

  return (
    <div className="box-border flex flex-row justify-between p-2 bg-[#FEDD67] border-black border-4 items-center">
      <div className="flex justify-start space-x-4">
        <div className="grid grid-flow-col grid-rows-2 gap-0 px-2 border-r-2 border-black">
          {items}
        </div>
        <ColorPanel selectedColor={props.color} handleClick={changeColor} />
      </div>
      <div className="flex justify-end space-x-4">
        <div className="grid grid-flow-col grid-rows-2 gap-0 px-2 mr-2 border-black rounded-lg border-x-2">
          <Button
            active={props.activeItem === "Share" ? true : false}
            name={"Share"}
            image={share}
            handleClick={handleShare}
          />
          <Button
            active={props.activeItem === "Download" ? true : false}
            name={"Download"}
            image={download}
            handleClick={handleDownload}
          />
        </div>
      </div>
    </div>
  );
};

export default Toolbox;
