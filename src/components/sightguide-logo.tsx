import type { SVGProps } from 'react';

export function SightGuideLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
      <path d="M15.5 12a3.5 3.5 0 0 1-3.5 3.5" />
      <path d="M18 12a6 6 0 0 1-6 6" />
      <path d="M20.5 12a8.5 8.5 0 0 1-8.5 8.5" />
    </svg>
  );
}
