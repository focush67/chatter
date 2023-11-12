import { authOptions } from "@/authentication/auth-exports";
import {getServerSession} from "next-auth";
export default async function Home() {
  const session = await getServerSession(authOptions);
  if(!session){
    console.log("Login required");
  }
  else{
    console.log("Session: ",session);
  }
  return (
    <div>
      Hello 
    </div>
  )
}
