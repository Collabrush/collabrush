"use client"

import React, { useState } from "react";

import MenuBar from "./menubar";
import Content from "./content";

const defaultTool = "Pencil";

import pencil from "./images/pencil.svg";
import line from "./images/line.svg";
import brush from "./images/brush.svg";
import fill from "./images/fill.svg";
import erase from "./images/erase.svg";
import rectangle from "./images/rectangle.svg";
import circle from "./images/circle.svg";
import text from "./images/text.svg";
import picker from "./images/picker.svg";

const defaultToolbarItems = [
  { name: "Pencil", image: pencil },
  { name: "Line", image: line },
  { name: "Brush", image: brush },
  { name: "Erase", image: erase },
  { name: "Fill", image: fill },
  { name: "Rectangle", image: rectangle },
  { name: "Text", image: text },
  { name: "Circle", image: circle },
  { name: "Picker", image: picker },
];

const ReactPaint = () => {
  const [color, setColor] = useState("black");
  const [selectedItem, setSelectedItem] = useState(defaultTool);
  const [toolbarItems, setToolbarItems] = useState(defaultToolbarItems);

  const changeTool = (_event: any, tool: any) => {
    setSelectedItem(tool);
  };

  return (
    <>
      <MenuBar />
      <Content
        items={toolbarItems}
        activeItem={selectedItem}
        handleClick={changeTool}
        color={color}
        setColor={setColor}
      />
    </>
  );
};

export default ReactPaint
