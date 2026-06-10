"use client";

import { redirect } from "next/navigation";

export default function WorkspaceMembersPage() {
  redirect("/settings/workspace");
  return null;
}

