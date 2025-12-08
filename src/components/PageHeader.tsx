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
        className="flex flex-col text-[5rem] md:flex-row md:flex-nowrap justify-center gap-0.5 md:gap-0 px-2 pt-4 pb-4 md:pt-6 text-center"
      >
        <span>Super</span>
        <span className="md:ml-6">Secret</span>
        <span className="md:ml-6">Supper</span>
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