"use client";

import { redirect } from "next/navigation";

export default function WorkspaceDangerPage() {
  redirect("/settings/workspace");
  return null;
}

