import { authOptions } from "@/authentication/auth-exports";
import { fetchRedis } from "@/helpers/redis";
import { database } from "@/lib/database";
import { messageArrayValidator,Message } from "@/lib/message";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { FC } from "react";
import Image from "next/image";
import MessagesComponent from "@/components/globals/MessageComponent";
import ChatInput from "@/components/globals/ChatInput";
interface PageProps {
    params: {
        chatId: string,
    },
    searchParams:{}
}

async function getChatMessages(chatId: string) {
    try {
        console.log("ChatId received in fucntion: ",chatId);
        const results: string[] = await fetchRedis('zrange',`chat:${chatId}:messages`,0,-1);


        const dbMessages:Message[] = [];
        for(const msg of results){
            const parsedMessage = JSON.parse(msg);
            console.log(parsedMessage);
            dbMessages.push(parsedMessage);
        }

        const reversedMessages = dbMessages?.reverse();
        console.log("Results of parsed messages :",reversedMessages);
        const messages = messageArrayValidator?.parse(reversedMessages);

        return messages;
    } catch (error) {
        console.log(error);
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
        <div className="flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]">
            <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
                <div className="relative flex items-center space-x-4">
                    <div className="relative">
                        <div className="relative w-8 sm:w-12 h-8 sm:h-12">
                            {/* <Image fill referrerPolicy="no-referrer" src={chatPartner?.image} alt={`${chatPartner.name} profile picture`} 
                            className="rounded-full"/> */}
                        </div>
                    </div>
                    <div className="flex flex-col leading-tight">
                        <div className="text-xl flex items-center">
                            <span className="text-gray-700 font-semibold mr-3">{chatPartner.name}</span>
                        </div>
                        <span className="text-sm text-gray-600">
                            {chatPartner.email}
                        </span>
                    </div>
                </div>
            </div>
            <MessagesComponent initialMessages={initialMessages!} sessionId={session.user.id} chatId={chatId}/>
            <ChatInput chatPartner={chatPartner} chatId={chatId} />
        </div>
    )
}

export default SpecificChat;