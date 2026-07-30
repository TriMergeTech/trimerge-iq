import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "mock-admin-modules.json");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(body, null, 2), "utf8");
    return NextResponse.json({ ok: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to save mock modules", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const contents = await fs.readFile(DATA_FILE, "utf8");
    return NextResponse.json({ ok: true, data: JSON.parse(contents) });
  } catch (err) {
    return NextResponse.json({ ok: true, data: null });
  }
}
