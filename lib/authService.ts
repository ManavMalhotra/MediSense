import { signInWithPopup } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, googleProvider, db } from "@/lib/firebase";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * Handles Google Sign-In, checks for an existing user profile in the database,
 * and redirects accordingly.
 * @param router - The Next.js router instance.
 * @returns A promise that resolves on completion.
 */
export const handleGoogleSignIn = async (
  router: AppRouterInstance
): Promise<void> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if the user already has a profile in our Realtime Database
    const userRef = ref(db, `users/${user.uid}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      // This is a new user (or a user who never completed their profile).
      // Redirect them to the profile completion page.
      router.push("/complete-profile");
    } else {
      // This is an existing user with a complete profile.
      // The AuthProvider will automatically redirect them to the dashboard.
      // We can push to dashboard just in case, but it's usually handled.
      router.push("/dashboard");
    }
  } catch (error: any) {
    // Re-throw the error to be caught by the component's try-catch block
    // so we can display a message to the user.
    console.error("Google Sign-In Error:", error);
    throw new Error("Failed to sign in with Google. Please try again.");
  }
};
