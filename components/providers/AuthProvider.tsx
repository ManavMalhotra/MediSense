"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, db } from "@/lib/firebase";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser, setAuthStatus, clearUser } from "@/store/authSlice";

const AUTH_ROUTES = ["/login", "/register", "/complete-profile"];
const PROTECTED_ROUTES = ["/dashboard"];

const LoadingSpinner = () => (
  <div className="flex min-h-screen items-center justify-center">
    Loading...
  </div>
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { user, status } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    dispatch(setAuthStatus("loading"));
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const snapshot = await get(ref(db, `users/${firebaseUser.uid}`));
          if (snapshot.exists()) {
            const userData = snapshot.val();
            // Accept minimal patient stub OR full doctor profile
            if (userData.role === "patient" || userData.role === "doctor") {
              dispatch(setUser(userData));
            } else {
              dispatch(clearUser());
            }
          } else {
            // no /users entry yet
            dispatch(clearUser());
          }
        } else {
          dispatch(clearUser());
        }
      } catch (err) {
        console.error("AuthProvider onAuthStateChanged error:", err);
        dispatch(clearUser());
      } finally {
        // mark the auth DB check complete
        dispatch(setAuthStatus("succeeded"));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  // Redirect logic runs only AFTER status is not loading
  useEffect(() => {
    if (status === "loading") return;

    const firebaseUser = auth.currentUser;
    const isProtectedRoute = PROTECTED_ROUTES.some((p) =>
      pathname.startsWith(p)
    );
    const isAuthRoute = AUTH_ROUTES.includes(pathname);

    // Not authenticated but trying to access protected
    if (!firebaseUser && isProtectedRoute) {
      router.push("/login");
      return;
    }

    // Authenticated but no user (profile) in our DB — send to complete-profile
    if (firebaseUser && !user && pathname !== "/complete-profile") {
      router.push("/complete-profile");
      return;
    }

    // Authenticated and user exists, don't allow visiting auth routes
    if (user && isAuthRoute) {
      router.push("/dashboard");
      return;
    }
  }, [user, status, pathname, router]);

  if (status === "loading") return <LoadingSpinner />;

  // Prevent flicker: if user is authenticated but Redux user isn't yet available,
  // block until we have decided.
  const firebaseUser = auth.currentUser;
  if (firebaseUser && !user && pathname !== "/complete-profile")
    return <LoadingSpinner />;
  if (!firebaseUser && PROTECTED_ROUTES.some((p) => pathname.startsWith(p)))
    return <LoadingSpinner />;

  return <>{children}</>;
}
