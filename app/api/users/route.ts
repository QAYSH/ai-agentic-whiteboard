import { db, users } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const user= await currentUser();

    //if user already exists in the database, return a message
    if(user){
        const userData=await db.select().from(users)
        //@ts-ignore
        .where(eq(users.primaryEmailAddress?.emailAddress, users.email));

        if(userData.length>0){
            return NextResponse.json(userData[0]);
        }else
        {
            //create a new user in the database
            const result=await db.insert(users).values({
                name: user.firstName,
                email: user.primaryEmailAddress?.emailAddress ?? "",
                
            }).returning();
            return NextResponse.json(result[0]);
        }
    }

    return NextResponse.json({message: "User not authenticated"}, {status: 401});

}