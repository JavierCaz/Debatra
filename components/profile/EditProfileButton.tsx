"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function EditProfileButton() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const handleClick = () => {
    router.push("/profile/edit");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
    >
      Edit Profile
    </button>
  );
}
