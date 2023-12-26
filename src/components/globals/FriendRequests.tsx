"use client";

import axios from "axios";
import { Check, UserPlus, X } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utilities";
import toast from "react-hot-toast";
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
    toast.success("Added friend");
    router.refresh();
  }

  const denyFriend = async(senderId: string) => {
    const response = await axios.post(`/api/requests/deny`,{
        id: senderId
    });
    console.log(response.data);
    setIncoming((prev) => prev.filter((request) => request.senderId !== senderId));
    toast.error("Denied friend");
    router.refresh();
  }

  const friendRequestHandler = () => {
    console.log("Friend request generated");
  }

  useEffect(()=>{
    // console.log("Mounting component");
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`));

    console.log("Listening to", `user:${sessionId}:incoming_friend_requests`);

    console.log("Pusher Client Initiated");
    
    const friendRequestsHandler = ({senderId,senderEmail}:IncomingFriendRequestsType) => {
      console.log("New friend requests may have been received");
      setIncoming((prev) => [...prev,{senderId,senderEmail}]);
    }

    pusherClient.bind(`incoming_friend_requests`,friendRequestsHandler);

    return () => {
      // console.log("Unmounting component");
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`)
      )
      pusherClient.unbind(`incoming_friend_requests`,friendRequestHandler);
    }
  },[sessionId])

  return (
    <>
      {incoming.length === 0 ? (
        <p className="text-sm text-white">Nothing to show here</p>
      ) : (
        incoming.map((request,index) => (
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
