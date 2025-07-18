import type { Metadata } from "next";
import '../globals.css';

import Preview from "./Preview";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Curioloop Online Tools",
  description: "Curioloop Online Tools",
};

export default function ToolLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense>
      <Preview container={true} >{children}</Preview>
    </Suspense>
  );
}
