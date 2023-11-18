import { ChatHrefConstructor, cn } from "@/lib/utilities";
import Image from "next/image";
import { FC } from "react";
import toast, { Toast } from "react-hot-toast";

interface UnseenChatsPropsType {
  t: Toast;
  sessionId: string;
  senderId: string;
  senderImg: string;
  senderName: string;
  senderMessage: string;
}

const UnseenChatsToast: FC<UnseenChatsPropsType> = ({
  t,
  senderId,
  sessionId,
  senderImg,
  senderName,
  senderMessage,
}) => {
  return (
    <div
      className={cn(
        "max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5",
        {
          "animate-enter": t.visible,
          "animate-leave": !t.visible,
        }
      )}
    >
      <a
        href={`/dashboard/chat/${ChatHrefConstructor(sessionId, senderId)}`}
        onClick={() => toast.dismiss(t.id)}
        className="flex-1 w-0 p-4"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="relative h-10 w-10">
              <Image
                fill
                referrerPolicy="no-referrer"
                className="rounded-full"
                alt={`${senderName} Profile Picture`}
                src={senderImg}
              />
            </div>
          </div>

          <div className="ml-3 flex-1 ">
            <p className="text-sm font-md text-gray-900">{senderName}</p>
            <p className="mt-1 text-sm text-gray-500">{senderMessage}</p>
          </div>
        </div>
      </a>

        <div className="flex border-l border-gray-300">
            <button className="w-full border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-md text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:rng-indigo-500"  onClick={() => toast.dismiss(t.id)}>Close</button>
        </div>

    </div>
  );
};

export default UnseenChatsToast;
