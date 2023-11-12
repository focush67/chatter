"use client";

import axios from "axios";
import { Check, UserPlus, X } from "lucide-react";
import { FC, useState } from "react";
import { useRouter } from "next/navigation";
interface FriendRequestsProps {
  initialIncomingRequests: IncomingFriendRequestsType[];
  sessionId: string;
}

const FriendRequests: FC<FriendRequestsProps> = ({
  initialIncomingRequests,
  sessionId,
}) => {
  const [incoming, setIncoming] = useState<IncomingFriendRequestsType[]>(
    initialIncomingRequests
  );

  const router = useRouter();

  const acceptFriend = async(senderId: string) => {
    const response = await axios.post(`/api/requests/accept`,{
        id: senderId
    });
    console.log(response.data);
    setIncoming((prev) => prev.filter((request) => request.senderId !== senderId));
    router.refresh();
  }

  const denyFriend = async(senderId: string) => {
    const response = await axios.post(`/api/requests/deny`,{
        id: senderId
    });
    console.log(response.data);
    setIncoming((prev) => prev.filter((request) => request.senderId !== senderId));
    router.refresh();
  }

  return (
    <>
      {incoming.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here</p>
      ) : (
        incoming.map((request) => (
          <div key={request.senderId} className="flex gap-4 items-center">
            <UserPlus className="text-black" />
            <p className="font-medium text-lg">{request.senderEmail}</p>
            <button aria-label="accept friend" className="w-8 h-8 bg-indigo-800 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-medium" onClick={() => acceptFriend(request.senderId)}>
                <Check className="font-semibold text-white w-3/4 h-3/4"/>
            </button>

            <button aria-label="deny friend" className="w-8 h-8 bg-red-800 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-medium" onClick={() => denyFriend(request.senderId)}>
                <X className="font-semibold text-white w-3/4 h-3/4"/>
            </button>
          </div>
        ))
      )}
    </>
  );
};

export default FriendRequests;
