import { NextResponse } from "next/server";
import { AIRefusalError } from "./claude";
import { UserInputError } from "./safeFetch";

export function errorResponse(err: unknown) {
  if (err instanceof UserInputError) return NextResponse.json({ error: err.message }, { status: 400 });
  if (err instanceof AIRefusalError) return NextResponse.json({ error: err.message }, { status: 422 });
  console.error(err);
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}
