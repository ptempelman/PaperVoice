"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { api } from "~/trpc/react";

export const TopBar = () => {
    // Clerk authentication
    const { isLoaded: userLoaded, isSignedIn, user } = useUser();
    api.signin.createUser.useQuery({ id: user?.id, email: user?.primaryEmailAddress?.emailAddress ?? null });

    const { data: credits } = api.user.credits.useQuery({ id: user?.id ?? "" });

    return (
        <div className="flex justify-center items-center">
            <p>Credits: {credits?.credits?.toFixed(2)}</p>
            <div className="m-5">
                <div className="h-2 w-2 rounded bg-gray-800"></div>
            </div>
            {!isSignedIn && <SignInButton />}
            {isSignedIn && <UserButton appearance={{
                elements: {
                    userButtonAvatarBox: {
                        width: 56,
                        height: 56
                    }
                }
            }} />}
        </div>
    );
}