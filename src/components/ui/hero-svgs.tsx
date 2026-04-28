import type { SVGProps } from "react";

export function HeroWave({ width, height, className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={width ?? 1138}
      height={height ?? 393}
      viewBox="0 0 1138 393"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      className={className}
      {...props}
    >
      <path
        d="M-71.5 419.5L-85 23.2635C-85 23.2635 66.3397 -29.0793 254.271 23.2635C428.563 71.8077 434.091 223.744 577.313 315.534C701.769 395.296 901.493 415.274 1025.8 419.5H1137.5C1137.5 419.5 1092.51 421.768 1025.8 419.5H-71.5Z"
        fill="url(#hero-wave-gradient)"
      />
      <defs>
        <linearGradient
          id="hero-wave-gradient"
          x1="50.5"
          y1="-68.5"
          x2="-26.6003"
          y2="378.483"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="#FFE0E0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function HeroSlash({ width, height, className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={width ?? 1058}
      height={height ?? 124}
      viewBox="0 0 1058 124"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      className={className}
      {...props}
    >
      <path
        d="M0 145L592.5 0L1057.5 163.566L0 145Z"
        fill="url(#hero-slash-gradient)"
      />
      <defs>
        <linearGradient
          id="hero-slash-gradient"
          x1="171.672"
          y1="-338.229"
          x2="33.0775"
          y2="320.87"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="#DA3131" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function HeroFade({ width, height, className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={width ?? 1440}
      height={height ?? 199}
      viewBox="0 0 1440 199"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      className={className}
      {...props}
    >
      <rect width="1440" height="199" fill="url(#hero-fade-gradient)" />
      <defs>
        <linearGradient
          id="hero-fade-gradient"
          x1="720"
          y1="0"
          x2="720"
          y2="199"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F9F9F9" stopOpacity="0" />
          <stop offset="1" stopColor="#F9F9F9" />
        </linearGradient>
      </defs>
    </svg>
  );
}
