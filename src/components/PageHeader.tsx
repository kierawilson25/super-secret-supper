import React from "react";

interface PageHeaderProps {
  isLandingPage?: boolean;
  children?: React.ReactNode;
}

export function PageHeader({
  isLandingPage = false,
  children,
}: PageHeaderProps) {
  if (isLandingPage) {
    return (
      <h1
        className="flex flex-nowrap justify-center gap-1 md:gap-0 text-xs md:text-7xl px-2 pt-10"
      >
        <span>Super</span>
        <span className="md:ml-8">Secret</span>
        <span className="md:ml-8">Supper</span>
      </h1>
    );
  }

  return (
<h1
  className="font-greatvibes text-[5rem] text-[#FBE6A6] text-center px-2 pt-10"
>
  {children}
</h1>
  );
}
