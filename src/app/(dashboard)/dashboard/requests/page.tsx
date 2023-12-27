import { authOptions } from "@/authentication/auth-exports";
import FriendRequests from "@/components/globals/FriendRequests";
import { fetchRedis } from "@/helpers/redis";
import {getServerSession} from "next-auth";
import type { Metadata } from "next";

export const metadata:Metadata = {
    title: "Friend Requests",
    description: "Friend Requests",
}

const Requests = async({}) => {
    const session = await getServerSession(authOptions);
    if(!session){
        //notFound()
    }

    // ids of the people who sent the current logged-in user a friend request

    const incomingSenderIds = await fetchRedis('smembers',`user:${session?.user?.id}:incoming_friend_requests`) as string[];

    const incomingFriendRequests = await Promise.all(incomingSenderIds.map(async(senderId) => {
        const sender = await fetchRedis("get",`user:${senderId}`) as string;        
        const parsedSender = JSON.parse(sender || "");
        return {
            senderId,
            senderEmail: parsedSender?.email,
        }
    }))

    console.log("Incoming friend requests",incomingFriendRequests);
    
    return(
        <section className="pt-8">
        <h1 className="text-bold text-5xl mb-8 text-white">Add a Friend</h1>
        <div className="flex flex-col gap-4">
            <FriendRequests initialIncomingRequests={incomingFriendRequests} sessionId={session?.user?.id!}/>
        </div>
    </section>
    )
}

export default Requests;

