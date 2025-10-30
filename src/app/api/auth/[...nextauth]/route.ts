export { GET, POST } from "@/lib/auth-no-edge";

// what is this file doing?
// This file sets up NextAuth with a credentials provider,
// and defines callbacks to manage user sessions and JWTs.

// It uses the authorize function to validate user credentials,
// and the jwt and session callbacks to store and retrieve
// the user ID in/from the JWT and session objects respectively.
