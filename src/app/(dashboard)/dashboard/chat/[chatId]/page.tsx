import { authOptions } from "@/authentication/auth-exports";
import { fetchRedis } from "@/helpers/redis";
import { database } from "@/lib/database";
import { messageArrayValidator } from "@/lib/message";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { FC } from "react";

interface PageProps {
    params: {
        chatId: string,
    },
    searchParams:{}
}

async function getChatMessages(chatId: string) {
    try {
        const results: string[] = await fetchRedis('zrange',`chat:${chatId}:messages`,0,-1);
        const dbMessages = results.map((message) => {
            JSON.parse(message) as Message
        })
        const reversedMessages = dbMessages.reverse();

        const messages = messageArrayValidator.parse(reversedMessages);

        return messages;
    } catch (error) {
        notFound();
    }
}

const SpecificChat : FC<PageProps> = async({params}) => {

    const {chatId} = params;
    console.log("Chat Id: ",chatId);
    const session = await getServerSession(authOptions);
    if(!session){
        console.log("Session missing");
        notFound();
    }
    const {user} = session;
    const [firstId,secondId] = chatId.split(`--`);
    if(user.id !== firstId && user.id !== secondId){
        notFound();
    }
    const chatPartnerId = user.id === firstId ?  secondId : firstId;
    const chatPartner = (await database.get(`user:${chatPartnerId}`)) as User;
    const initialMessages = (await getChatMessages(chatId));

    return(
        <div>Hello specific chat user {params.chatId}</div>
    )
}

export default SpecificChat;