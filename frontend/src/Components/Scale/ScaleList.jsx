import React from "react";
import ScaleCard from "./ScaleCard";
import { scaleData } from "./Scale";
import "./scale.css";

const ScaleList = () => {
  return (
    <div className="scale-grid">
      {scaleData.map((item, index) => (
        <ScaleCard key={index} {...item} />
      ))}
    </div>
  );
};

export default ScaleList;
