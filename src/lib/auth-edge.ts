import { NextAuthConfig } from "next-auth";
import prisma from "./db";
export const nextAuthEdgeConfig = {
  pages: {
    signIn: "/login",
    // registering need to implement self, it doesnt involve jwt aka not a auth action
  },
  callbacks: {
    authorized: ({ auth, request }) => {
      const isLoggedIn = !!auth?.user;
      const isAccessingApp = request.nextUrl.pathname.includes("/app");

      if (isAccessingApp && !isLoggedIn) {
        return false; // Not authorized
      }

      if (isAccessingApp && isLoggedIn && !auth?.user.hasAccess) {
        return Response.redirect(new URL("/payment", request.nextUrl));
      }

      if (isAccessingApp && isLoggedIn && auth?.user.hasAccess) {
        return true; // Authorized
      }

      if (
        isLoggedIn &&
        (request.nextUrl.pathname === "/login" ||
          request.nextUrl.pathname === "/signup") &&
        auth?.user.hasAccess
      ) {
        return Response.redirect(new URL("/app/dashboard", request.nextUrl));
      }

      if (!isAccessingApp && isLoggedIn && !auth?.user.hasAccess) {
        if (
          (request.nextUrl.pathname.includes("/login") ||
            request.nextUrl.pathname.includes("/signup")) &&
          !auth?.user.hasAccess
        ) {
          // set redirect for logged in users trying to access non-app routes
          return Response.redirect(new URL("/payment", request.nextUrl)); // Allow access to non-app routes
        }
        return true;
      }
      if (!isAccessingApp && !isLoggedIn) {
        return true; // Allow access to non-app routes
      }
      return false; //safe to deny by default
    },
    jwt: async ({ token, user, trigger }) => {
      if (user) {
        token.userId = user.id;
        token.email = user.email!;
        token.hasAccess = user.hasAccess;
      }
      if (trigger === "update") {
        const userFromDb = await prisma.user.findUnique({
          where: { email: token.email },
        });
        if (userFromDb) {
          token.hasAccess = userFromDb.hasAccess;
        }
      }
      return token;
    },
    session: ({ session, token }) => {
      session.user.id = token.userId;
      session.user.hasAccess = token.hasAccess;

      return session;
      // need to type the additional fields in next-auth.d.ts.
    },
  },
  providers: [],
} satisfies NextAuthConfig;
