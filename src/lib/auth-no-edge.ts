import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "./server-utils";
import { authSchema } from "./validation";
import { nextAuthEdgeConfig } from "./auth-edge";

const config = {
  ...nextAuthEdgeConfig,
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
} satisfies NextAuthConfig;

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(config);
