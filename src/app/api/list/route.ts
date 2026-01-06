import {NextResponse} from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "bring_list.json");

async function ensureFile() {
    try {
        await fs.mkdir(DATA_DIR, {recursive: true});
        await fs.access(DATA_FILE);
    } catch (e: any) {
        if (e?.code === "ENOENT") {
            await fs.writeFile(DATA_FILE, "[]", "utf8");
        }
    }
}

export async function GET() {
    try {
        await ensureFile();
        const raw = await fs.readFile(DATA_FILE, "utf8");
        const data = JSON.parse(raw || "[]");
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({error: "failed to read"}, {status: 500});
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await fs.mkdir(DATA_DIR, {recursive: true});
        await fs.writeFile(DATA_FILE, JSON.stringify(body, null, 2), "utf8");
        return NextResponse.json({ok: true});
    } catch (err) {
        return NextResponse.json({error: "failed to write"}, {status: 500});
    }
}
