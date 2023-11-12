"use client";

import AddFriendButton from "@/components/globals/AddFriendButton";
import { FC } from "react";
interface PageProps {}

const Add: FC<PageProps> = ({}) => {
    return(
        <section className="pt-8">
            <h1 className="text-bold text-5xl mb-8">Add a Friend</h1>
            <AddFriendButton/>
        </section>
    )
}

export default Add;