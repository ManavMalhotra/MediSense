"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { ref, get, update } from "firebase/database";
import { auth, db } from "@/lib/firebase";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { Loader2, Pencil, Save, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Profile() {
  const router = useRouter();
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);

  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    emergencyContact: "",
    address: "",
  });

  // Load user + DB info
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);

      if (currentUser?.uid) {
        const userRef = ref(db, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          setDbUser(data);

          setEditForm({
            fullName: data.fullName || "",
            phone: data.phone || "",
            emergencyContact: data.emergencyContact || "",
            address: data.address || "",
          });
        }
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Save profile changes
  const handleSave = async () => {
    if (!firebaseUser) return;

    try {
      await update(ref(db, `users/${firebaseUser.uid}`), {
        fullName: editForm.fullName,
        phone: editForm.phone,
        emergencyContact: editForm.emergencyContact,
        address: editForm.address,
      });

      setDbUser({ ...dbUser, ...editForm });
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error("Failed to update profile.");
    }
  };

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading)
    return (
      <div className="p-6 flex justify-center">
        <Loader2 className="animate-spin h-6 w-6 text-indigo-600" />
      </div>
    );

  if (!firebaseUser) return <p className="p-6">You are not logged in.</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="p-8 space-y-8 shadow-sm rounded-2xl border border-gray-200 bg-white animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* HEADER */}
        <div className="flex items-center gap-5">
          <Avatar className="h-20 w-20 transition hover:scale-105 hover:shadow-md">
            <AvatarFallback className="text-xl bg-indigo-100 text-indigo-700">
              {firebaseUser.email?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              {/* FIXED NAME LOGIC */}
              {isEditing
                ? editForm.fullName || "Enter your name"
                : dbUser?.fullName || "No Name Set"}

              <Badge variant="secondary" className="text-xs px-2 py-1">
                {dbUser?.role?.toUpperCase()}
              </Badge>
            </h1>

            <p className="text-sm text-gray-500">{firebaseUser.email}</p>
          </div>
        </div>

        {/* PROFILE SECTION */}
        <div className="border-t pt-6 space-y-4">
          <h2 className="font-semibold text-lg">Profile Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Full Name
              </label>
              {isEditing ? (
                <Input
                  value={editForm.fullName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, fullName: e.target.value })
                  }
                />
              ) : (
                <p className="text-sm text-gray-800">
                  {dbUser?.fullName || "Not set"}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              {isEditing ? (
                <Input
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                />
              ) : (
                <p className="text-sm text-gray-800">
                  {dbUser?.phone || "Not set"}
                </p>
              )}
            </div>

            {/* Emergency Contact */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Emergency Contact
              </label>
              {isEditing ? (
                <Input
                  value={editForm.emergencyContact}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      emergencyContact: e.target.value,
                    })
                  }
                />
              ) : (
                <p className="text-sm text-gray-800">
                  {dbUser?.emergencyContact || "Not set"}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Address
              </label>
              {isEditing ? (
                <Input
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                />
              ) : (
                <p className="text-sm text-gray-800">
                  {dbUser?.address || "Not set"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex items-center justify-between pt-6 border-t">
          {!isEditing ? (
            <Button
              className="flex items-center gap-2"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <Button className="flex items-center gap-2" onClick={handleSave}>
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          )}

          <Button
            variant="destructive"
            className="flex items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
}
