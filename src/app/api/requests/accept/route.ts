import { authOptions } from "@/authentication/auth-exports";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {getServerSession} from "next-auth";
import { fetchRedis } from "@/helpers/redis";
import { database } from "@/lib/database";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utilities";
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id: idToAdd } = z?.object({ id: z?.string() }).parse(body);
    const session = await getServerSession(authOptions);
    // console.log(session);
    if (!session) {
      return NextResponse.json({
        message: "Unauthenticated Request",
        status: 401,
      });
    }

    // verifying if friendship betweeen the users already exists

    const isAlreadyFriends = await fetchRedis(
      "sismember",
      `user:${session?.user?.id}:friends`,
      idToAdd
    );

    if (isAlreadyFriends) {
      return NextResponse.json({
        message: "Already friends",
        status: 400,
      });
    }

    const hasFriendRequest = await fetchRedis(
      "sismember",
      `user:${session?.user?.id}:incoming_friend_requests`,
      idToAdd
    );

    if (!hasFriendRequest) {
      return NextResponse.json({
        message: "No friend request",
        status: 404,
      });
    }

    // notify user 

    pusherServer.trigger(toPusherKey(`user:${idToAdd}:friends`),'new_friend',{});

    const a = await database.sadd(`user:${session?.user?.id}:friends:`,idToAdd);

    const b = await database.sadd(`user:${idToAdd}:friends:`,session?.user?.id);

    const c = await database.srem(`user:${session?.user?.id}:incoming_friend_requests`,idToAdd);

    if (a === 0 || b === 0 || c === 0) {
        return NextResponse.json({
          message: "Failed to add friend or remove friend request",
          status: 500,
        });
      }

    return NextResponse.json({
      message: "Request accepted and validated",
      status: 200,
    });
  } catch (error) {
    if(error instanceof z?.ZodError){
        return NextResponse.json({
            message: "Invalid request payload",
            status: 422
        })
    }
    return NextResponse.json({
        message: "Invalid request",
        status: 400,
        error
    })
  }
}
