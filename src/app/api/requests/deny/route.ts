import { NextRequest,NextResponse } from "next/server";
import {getServerSession} from "next-auth";
import { database } from "@/lib/database";
import { z } from "zod";
import { authOptions } from "@/authentication/auth-exports";

export async function POST(request:NextRequest){
    try {
        const body = await request.json();
        const session = await getServerSession(authOptions);
        if(!session){
            return NextResponse.json({
                message:"Unauthenticated Request",
                status:400,
            })
        }

        const {id: idToDeny} = z?.object({id: z?.string()}).parse(body);

        await database.srem(`user:${session?.user?.id}:incoming_friend_requests`,idToDeny);

        return NextResponse.json({
            message:"Denied friendship",
            status:200,
        })
    } catch (error){
        if(error instanceof z?.ZodError){
            return NextResponse.json({
                message: "Invalid Request Payload",
                status: 422,
            })
        }
        return NextResponse.json({
            message:"Some error occured",
            status:400,
        })
    }
}