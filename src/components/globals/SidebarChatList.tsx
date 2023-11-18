"use client";

import { pusherClient } from "@/lib/pusher";
import { ChatHrefConstructor, toPusherKey } from "@/lib/utilities";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import UnseenChatsToast from "./UnseenChatsToast";
import Image from "next/image";

interface SidebarChatListProps {
  friends: User[];
  sessionId: string;
}

interface ExtendedMessage extends Message{
  senderImg: string;
  senderName: string;
}

const SidebarChatList: FC<SidebarChatListProps> = ({ friends, sessionId }) => {
    
  const [unseen, setUnseen] = useState<Message[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.includes("chat")) {
      setUnseen((prev) => {
        return prev.filter((message) => {
          !pathname.includes(message.senderId);
        });
      });
    }
  }, [pathname]);


  useEffect(()=>{
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));

    const friendHandler = () => {
      router.refresh();
    }

    const chatHandler = (message:ExtendedMessage) => {
      const isToBeNotified = pathname !== `dashboard/chat/${ChatHrefConstructor(sessionId,message.senderId)}`;

      if(!isToBeNotified) return;

      // Ring a notification

      toast.custom((t) => (
        <UnseenChatsToast t={t} sessionId={sessionId} senderId={message.senderId} senderImg={message.senderImg} senderMessage={message.text} senderName={message.senderName}/>
      ))

      setUnseen((prev) => [...prev,message]);
    }

    pusherClient.bind(`new_message` , chatHandler);
    pusherClient.bind(`new_friend`,friendHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));
    pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));
    }
  },[sessionId,pathname,router])

  return (
    <>
    <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
      {friends.sort().map((friend) => {
        const unseenMessagesCount = unseen?.filter((msg) => {
          return msg.senderId === friend.id;
        }).length;

        return (
          <li key={friend.id} style={{
            display:"flex"
          }}>
            <Image src={friend.image} alt={`${friend.name}`} referrerPolicy="no-referrer" className="rounded-full" width={40} height={40} layout="fixed"/>
            <a
              href={`/dashboard/chat/${ChatHrefConstructor(
                sessionId,
                friend.id
              )}`}
              className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
            >
              {friend?.name}
              {unseenMessagesCount > 0 ? (
                <div className='bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center'>
                  {unseenMessagesCount}
                </div>
              ) : null}
            </a>
          </li>
        );
      })}
    </ul>
    </>
  );
};

export default SidebarChatList;