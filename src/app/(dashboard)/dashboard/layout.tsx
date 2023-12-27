import { authOptions } from "@/authentication/auth-exports";
import { FC, ReactNode } from "react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import Image from "next/image";
import { Icon, Icons } from "@/components/globals/Icons";
import SignOutButton from "@/components/globals/SignOutButton";
import FriendRequestsSidebarOptions from "@/components/globals/FriendRequestsSidebarOptions";
import { fetchRedis } from "@/helpers/redis";
import { getFriendsByUserId } from "@/helpers/get-friends-by-userId";
import SidebarChatList from "@/components/globals/SidebarChatList";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Mobile from "@/components/globals/Mobile";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "User Dashboard",
};

interface LayoutProps {
  children: ReactNode;
}

export interface SideBarOption {
  id: number;
  name: string;
  href: string;
  Icon: Icon;
}

const Options: SideBarOption[] = [
  {
    id: 1,
    name: "Add-Friend",
    href: "/dashboard/add",
    Icon: "UserPlus",
  },
];

const DashboardLayout: FC<LayoutProps> = async ({ children }) => {
  const session = await getServerSession(authOptions);
  if (!session) {
    notFound();
  }
  const friends = await getFriendsByUserId(session?.user?.id);

  const unseenRequestsCount = (
    (await fetchRedis(
      "smembers",
      `user:${session?.user?.id}:incoming_friend_requests`
    )) as User[]
  ).length;

  // console.log(`Friends for ${session?.user?.email}`,friends);
  return (
    <div className="w-full flex h-screen bg-black">
      <div className="md:hidden">
        <Mobile
          friends={friends}
          session={session}
          sidebarOptions={Options}
          unseenRequestsCount={unseenRequestsCount}
        />
      </div>
      <div className="hidden md:flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r border-gray-300 bg-purple-100 px-6">
        <Link href={"/dashboard"} className="h-16 flex shrink-0 items-center">
          <Icons.Logo className="h-10 w-auto text-blue-800" />
        </Link>
        {friends?.length > 0 && (
          <div className="text-xs text-gray-400 font-semibold leading-6">
            Your chats
          </div>
        )}

        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <SidebarChatList friends={friends} sessionId={session.user.id} />
            </li>
            <li>
              <div className="text-xs font-semibold leading-6 text-gray-400">
                Overview
              </div>
              <ul role="list" className="-mx-2 mt-2 space-y-1">
                {Options.map((option) => {
                  const Icon = Icons[option.Icon];
                  return (
                    <>
                      <li key={option.id}>
                        <Link
                          href={option.href}
                          className="text-black hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 rounded-md padding-2 text-sm leading-6 font-semibold"
                        >
                          <span className="text-black border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
                            <Icon className="w-4 h-4" />
                          </span>

                          <span className="truncate">{option.name}</span>
                        </Link>
                      </li>

                      <li>
                        <FriendRequestsSidebarOptions
                          sessionId={session?.user?.id!}
                          initialUnseenRequestsCount={unseenRequestsCount}
                        />
                      </li>
                    </>
                  );
                })}
              </ul>
            </li>

            <li className="-mx-6 mt-auto flex items-center">
              <div className="flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
                <div className="relative h-8 w-8 bg-gray-50">
                  <Image
                    src={session?.user?.image || ""}
                    fill
                    referrerPolicy="no-referrer"
                    className="rounded-full"
                    alt="Profile Image"
                  />
                </div>
                <span className="sr-only">Your Profile</span>
                <div className="flex flex-col">
                  <span aria-hidden="true">{session?.user?.name}</span>
                  <span className="text-xs text-zinc-400" aria-hidden="true">
                    {session?.user?.email}
                  </span>
                </div>
              </div>

              <SignOutButton className="h-full aspect-square" />
            </li>
          </ul>
        </nav>
      </div>
      <aside className="container max-h-screen py-16 md:py-12 w-full ">
        {children}
      </aside>
    </div>
  );
};

export default DashboardLayout;
