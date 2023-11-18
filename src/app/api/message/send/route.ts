import { authOptions } from "@/authentication/auth-exports";
import { fetchRedis } from "@/helpers/redis";
import { database } from "@/lib/database";
import { Message, messageValidator } from "@/lib/message";
import { pusherClient, pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utilities";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth";

export async function POST(request:Request){
    try {
        const {text,chatId} = await request.json();
        const session = await getServerSession(authOptions);
        if(!session){
            return Response.json({
                message: "Unauthorized",
                status: 404,
            });
        }
        const [firstUserId,secondUserId] = chatId.split("--");
        console.log({firstUserId,secondUserId});
        if(session?.user?.id !== firstUserId && session?.user?.id !== secondUserId){
            return Response.json({
                message: "Unauthorized",
                status: 401,
            });
        }


        const friendId = session?.user?.id === firstUserId ? secondUserId : firstUserId;
        const friendList = await fetchRedis("smembers",`user:${session?.user?.id}:friends:`) as string[];
        const isAFriend = friendList.includes(friendId);
        console.log("Backend friends: ",friendList);
        if(!isAFriend){
            return Response.json({
                message: "Unauthorized,no friendship",
                status: 401,
            });
        }

        const timestamp = Date.now();
        const senderInformation  = await fetchRedis("get" , `user:${session.user.id}`) as string;
        const parsedSender = JSON.parse(senderInformation);
        const messageData:Message = {
            id:nanoid(),
            senderId:session?.user?.id!,
            text,
            timestamp,
        }

        const message = messageValidator.parse(messageData);

        // live chat feature here

        pusherServer.trigger(toPusherKey(`chat:${chatId}`),"incoming_messages",message)
        await database.zadd(`chat:${chatId}:messages`,{
            score: timestamp,
            member: JSON.stringify(message)
        })

        return Response.json({
            message: "Successfully posted message",
            status: 200,
            messagePosted: message,
        })
    } catch (error) {
        if(error instanceof Error){
            return Response.json({
                error: error.message,
                status: 500,
            })
        }

        return Response.json({
            message: "Internal Server Error",
            status: 500,
        })
    }
}