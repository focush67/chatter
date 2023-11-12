import { FC } from "react";
interface PageProps {};
import getServerSession from "next-auth";
import { authOptions } from "@/authentication/auth-exports";
const Dashboard:FC<PageProps> = async({}) => {
    const session = await getServerSession(authOptions);
    return(
        <div>
            {
                `${session?.user?.email || "No session"}`
            }
        </div>
    )
}

export default Dashboard;