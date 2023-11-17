"use client";

import { FC, useRef, useState } from "react";
import { Message } from "@/lib/message";
import { cn } from "@/lib/utilities";
import {format} from "date-fns";
interface MessageComponentProps {
  initialMessages: Message[];
  sessionId: string;
  chatId: string;
}

const MessagesComponent: FC<MessageComponentProps> = ({
  initialMessages,
  sessionId,
}) => {
  const scrollDownRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessage] = useState<Message[]>(initialMessages);

  const formatTimeStamp = (timestamp:number) => {
    return format(timestamp,"HH:mm");
  }
  return (
    <div
      id="messages"
      className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scroll-bar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
    >
      <div ref={scrollDownRef} />
      {messages?.map((message, index) => {
        const isCurrentUser = message.senderId === sessionId;
        
        const hasNextMessageFromSameUser =
          messages[index - 1]?.senderId === messages[index].senderId;
        return (
          <div
            key={`${message.id}-${message.timestamp}`}
            className="chat-message"
          >
            <div
              className={cn("flex,items-end", {
                "justify-end": isCurrentUser,
              })}
            >
              <div
                className={cn(
                  "flex flex-col space-y-2 max-w-xs text-base mx-2",
                  {
                    "order-1 items-end ml-auto": isCurrentUser,
                    "order-2 items-start": !isCurrentUser,
                  }
                )}
              >
                <span
                  className={cn("px-4 py-2 rounded-lg inline-block", {
                    "bg-indigo-600 text-white": isCurrentUser,
                    "bg-gray-200 text-gray-900": !isCurrentUser,
                    "rounded-br-none":
                      !hasNextMessageFromSameUser && isCurrentUser,
                    "rounded-bl-none":
                      !hasNextMessageFromSameUser && !isCurrentUser,
                  })}
                >
                  {message.text}{" "}
                  <span className="ml-2 text-xs text-gray-400">{formatTimeStamp(message.timestamp)}</span>
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessagesComponent;