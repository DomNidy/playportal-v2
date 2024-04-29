import type { SVGProps } from "react";

export default function PlayportalIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        borderRadius: "50%",
        ...{ props },
      }}
    >
      <rect width="32" height="32" fill="#35244C" />
      <circle
        cx="15.7265"
        cy="15.7266"
        r="7.5"
        transform="rotate(-1.75779 15.7265 15.7266)"
        fill="url(#paint0_linear_50_56)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_50_56"
          x1="15.7265"
          y1="8.22662"
          x2="15.7265"
          y2="23.2266"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D8C6F2" />
          <stop offset="1" stopColor="#8650D1" />
        </linearGradient>
      </defs>
    </svg>
  );
}
