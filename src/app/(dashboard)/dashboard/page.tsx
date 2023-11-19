import { FC } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/authentication/auth-exports";
import { notFound } from "next/navigation";
import { getFriendsByUserId } from "@/helpers/get-friends-by-userId";
import { fetchRedis } from "@/helpers/redis";
import { ChatHrefConstructor } from "@/lib/utilities";
import { ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const Dashboard: FC = async () => {
  const session = await getServerSession(authOptions);
  if (!session) {
    notFound();
  }
  const friends = await getFriendsByUserId(session?.user?.id);

  const friendsWithLastMessages = await Promise.all(
    friends?.map(async (friend) => {
      const [lastMessageRaw] = (await fetchRedis(
        `zrange`,
        `chat:${ChatHrefConstructor(session?.user?.id, friend.id)}:messages`,
        -1,
        -1
      )) as string[];

      console.log("Last Message Raw: ",lastMessageRaw);
      const lastMessage = lastMessageRaw ? JSON.parse(lastMessageRaw || "") as Message : console.log("Error in JSON Parsing");
      
      return {
        ...friend,
        lastMessage,
      };
    })
  );

  // console.log("Friend with last message: ",friendsWithLastMessages);
  return (
    <div className="py-12 container">
      <h1 className="font-bold text-5xl mb-8">Recent</h1>
      {friendsWithLastMessages.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here</p>
      ) : (
        friendsWithLastMessages.map((friend) => (
          <div
            key={friend.id}
            className="relative bg-zinc-50 border-zinc-200 p-3 rounded-md"
          >
            <div className="absolute right-4 inset-y-0 flex items-center">
              <ChevronRight className="text-zinc-400 h-7 w-7" />
            </div>
            <Link
              href={`/dashboard/chat/${ChatHrefConstructor(
                session?.user?.id,
                friend.id
              )}`}
              className="relative sm:flex"
            >
              <div className="mb-4 flex-shrink-0 sm:mb-0 sm:mr-4">
                <div className="relative h-6 w-6">
                  <Image
                    referrerPolicy="no-referrer"
                    className="rounded-full"
                    alt={`${friend.name}`}
                    src={friend.image}
                    fill
                  />
                </div>
              </div>

              <div className="">
                <h4 className="text-large font-semibold">{friend.name}</h4>
                <p className="max-w-md mt-1">
                  <span className="text-zinc-400">
                    {friend.lastMessage?.senderId === session?.user?.id
                      ? "You: "
                      : ""}
                  </span>
                  {friend.lastMessage?.text}
                </p>
              </div>
            </Link>
          </div>
        ))
      )}
    </div>
  );
};

export default Dashboard;
