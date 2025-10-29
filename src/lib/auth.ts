import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "./server-utils";
import { authSchema } from "./validation";

const config = {
  pages: {
    signIn: "/login",
    // registering need to implement self, it doesnt involve jwt aka not a auth action
  },
  // session:{
  //     maxAge: 30 * 24 * 60 * 60, // 30 days
  //     strategy: 'jwt',
  // }, these are defaults
  providers: [
    Credentials({
      async authorize(credentials) {
        // runs on login attempt with middleware, when signIn is called
        // validation
        const validatedFormData = authSchema.safeParse(credentials);
        if (!validatedFormData.success) {
          return null;
        }
        // extract email and password
        const { email, password } = validatedFormData.data;
        // find user on db
        const user = await getUserByEmail(email);
        if (!user) {
          console.log("no user found");
          return null;
        }

        const passwordsMatch = await bcrypt.compare(
          password,
          user.hashedPassword
        );
        if (!passwordsMatch) {
          console.log("passwords dont match");
          return null;
        }
        // return user object, but it only allows some fields to be passed on
        return user;
        // by default, next auth only includes  name, email in the jwt and session; but when this function returns user object, all fields in user object are available in jwt callback. so we can add user information we need there
      },
    }),
  ],
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
        const userFromDb = await getUserByEmail(token.email);
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
} satisfies NextAuthConfig;

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(config);
