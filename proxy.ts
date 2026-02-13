import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// explicitly define PUBLIC URLs (not folder names)
const isPublicRoute = createRouteMatcher([
  "/",                // landing page
  "/sign-in(.*)",     // auth pages
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect(); // everything else requires login
  }
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};
