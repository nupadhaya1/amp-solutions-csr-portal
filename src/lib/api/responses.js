// @ts-check

import { NextResponse } from "next/server";

export function ok(data, init) {
  return NextResponse.json({ data, error: null }, init);
}

export function fail(message, status = 400) {
  return NextResponse.json(
    {
      data: null,
      error: message,
    },
    { status },
  );
}
