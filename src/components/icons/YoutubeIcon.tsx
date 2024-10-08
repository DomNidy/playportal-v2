import { type SVGProps } from "react";

export default function YoutubeIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      width={24}
      height={24}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m23.495 6.205a3.007 3.007 0 0 0 -2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501a3.007 3.007 0 0 0 -2.088 2.088 31.247 31.247 0 0 0 -.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0 -.5-5.805zm-13.886 9.396v-7.193l6.264 3.602z" />
    </svg>
  );
}
