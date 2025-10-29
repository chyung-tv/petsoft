import { auth } from "./lib/auth";

export default auth;

// Apply middleware to all routes except for static files and API routes
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
