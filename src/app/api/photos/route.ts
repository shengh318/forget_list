export const dynamic = "force-static";
import {readdir} from "fs/promises";
import path from "path";
import {NextResponse} from "next/server";

export async function GET() {
    const dir = path.join(process.cwd(), "public", "photos");
    try {
        const names = await readdir(dir);
        const images = names
            .filter((n) => /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(n))
            .map((n) => `/photos/${ n }`);
        return NextResponse.json({paths: images});
    } catch {
        return NextResponse.json({paths: []});
    }
}
