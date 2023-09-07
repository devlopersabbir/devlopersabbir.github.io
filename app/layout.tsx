import React from "react";
import { Metadata } from "next";
import { __about } from "@/constants";

export const metadata: Metadata = {
  title: __about.title,
  authors: __about.author,
  description: __about.description,
  keywords: __about.keywords,
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className="relative">{children}</body>
    </html>
  );
};

export default RootLayout;
