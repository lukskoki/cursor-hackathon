import { useState } from "react";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { OrganizationCreateEventModal } from "@/components/organization/OrganizationCreateEventModal";

export default function CreateEvent() {
  const user = useAuthStore((s) => s.user);
  const [visible] = useState(true);

  const organizationName =
    user?.role === "organization" ? user.organizationName : "Your Organization";

  return (
    <OrganizationCreateEventModal
      visible={visible}
      onClose={() => router.back()}
      organizationName={organizationName}
      onCreated={() => router.back()}
    />
  );
}
