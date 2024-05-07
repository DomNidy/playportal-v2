import { type NextRequest } from "next/server";
import { updateSession } from "~/utils/supabase/middleware";

const requestCounter: Record<string, number> = {};

export default async function middlware(request: NextRequest) {
  // TODO: Implement rate limiting here
  const ip = (request.headers.get("x-forwarded-for") ?? "127.0.0.1").split(
    ",",
  )[0];
  const clientIp = { ip }.ip ?? "127.0.0.1";

  requestCounter[clientIp] = (requestCounter[clientIp] ?? 0) + 1;
  console.log("Request counts", requestCounter);

  const refreshedSession = await updateSession(request);
  return refreshedSession;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
