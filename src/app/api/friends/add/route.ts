import { authOptions } from "@/authentication/auth-exports";
import { addFriendValidator } from "@/lib/add-friend";
import { NextRequest,NextResponse } from "next/server";
import {getServerSession} from "next-auth";
import { fetchRedis } from "@/helpers/redis";
import { database } from "@/lib/database";
import {z} from "zod";
export async function POST(request: NextRequest){
    try {
        const body = await request.json();
        const {email: emailToAdd} = addFriendValidator.parse(body.email);

        const idToAdd = await fetchRedis("get" , `user:email:${emailToAdd}`) as string;

        if(!idToAdd){
            return NextResponse.json({
                message: "Person doesn't exist",
                status: 400,
                id: idToAdd,
            });
        }
        const session = await getServerSession(authOptions);
        console.log("Backend session: ",session);
        if(!session){
            return NextResponse.json({
                message: "Unauthorized request",
                status: 405,
                session: session,
            });
        }
        if(idToAdd === session.user.id){
            return NextResponse.json({
                message: "Can't add yourself as a friend",
                status: 400,
            })
        }

        const isAlreadyAdded = await fetchRedis("sismember",`user:${idToAdd}:incoming_friend_requests`,session.user.id) as 0 | 1;

        if(isAlreadyAdded){
            return NextResponse.json({
                message: "Already added this user",
                status: 400,
                extra: isAlreadyAdded
            })
        }

        const isAlreadyFriend = await fetchRedis("sismember",`user:${session.user.id}:friends`,idToAdd) as 0 | 1;

        if(isAlreadyFriend){
            return NextResponse.json({
                message: "Already friends with this user",
                status: 400,
                extra: isAlreadyFriend,
            })
        }        

        database.sadd(`user:${idToAdd}:incoming_friend_requests`,session.user.id);

        return NextResponse.json({
            message: "Friend request sent",
            status: 200,
        });

    } catch (error){
        if(error instanceof z?.ZodError){
            return NextResponse.json({
                message: "Invalid request payload",
                status: 422,
            })
        }
        return NextResponse.json({
            message: "Invalid request",
            status: 400,
            error: error,
        })
    }
}