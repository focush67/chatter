import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { database } from "@/lib/database";
import { fetchRedis } from "@/helpers/redis";
function checkGoogleCredentials(){
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if(!clientId || clientId.length === 0){
        throw new Error("Missing Google Client Id");
    }
    if(!clientSecret || clientSecret.length === 0){
        throw new Error("Missing Google Client Secret");
    }
    return {clientId,clientSecret}
}

export const authOptions:NextAuthOptions = {
    adapter: UpstashRedisAdapter(database),
    session:{
        strategy:"jwt"
    },
    pages:{
        signIn:"/login",
    },
    providers:[
        GoogleProvider({
            clientId: checkGoogleCredentials().clientId,
            clientSecret: checkGoogleCredentials().clientSecret,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET!,
    callbacks:{
        async jwt({token,user}){
            const dbUserResult = await fetchRedis("get" , `user:${token.id}`) as | string | null;
            if(!dbUserResult){
                token.id = user!.id
                return token;
            }
            const dbUser = JSON.parse(dbUserResult) as User;
            return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                image: dbUser.image,
            }
        },
        async session({session,token}){
            if(token){
                session.user.id = token.id
                session.user.name = token.name
                session.user.email = token.email
                session.user.image = token.image as string
            }
            return session;
        },
        redirect(){
            return "/dashboard"
        },
    }
}