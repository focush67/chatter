import NextAuth from "next-auth/next";
import {authOptions} from "@/authentication/auth-exports";

const handler = NextAuth(authOptions);

export {handler as GET , handler as POST};