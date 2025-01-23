"use client";
import React, { useEffect, useState } from "react";

const Spotlight = () => {
  const [animationClass, setAnimationClass] = useState("");

  useEffect(() => {
    // Ajout de la classe d'animation après un court délai
    const timeout = setTimeout(() => {
      setAnimationClass("animate-spotlight");
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <svg
      className={`pointer-events-none absolute z-[1] opacity-0 lg:opacity-100 transition-transform duration-2000 ease-in-out ${animationClass}`}
      style={{
        top: "-50%",
        left: "-50%",
        width: "200%",
        height: "200%",
      }}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <g filter="url(#filter)">
        <ellipse
          cx="1000"
          cy="500"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill="hsl(var(--primary))"
          fillOpacity="0.3"
        />
      </g>
      <defs>
        <filter
          id="filter"
          x="0.860352"
          y="0.838989"
          width="3785.16"
          height="2840.26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="151"
            result="effect1_foregroundBlur_1065_8"
          />
        </filter>
      </defs>
    </svg>
  );
};

export default Spotlight;
