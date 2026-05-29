import { NextResponse } from "next/server";
import { allFetishTags } from "@/lib/fetishes";

export async function GET() {
  return NextResponse.json({ tags: allFetishTags().slice(0, 48) });
}
