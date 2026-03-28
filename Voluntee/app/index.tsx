import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/authStore";

export default function Index() {
  const { isLoggedIn, role } = useAuthStore();

  if (!isLoggedIn) {
    return <Redirect href="/shared/auth/login" />;
  }

  if (role === "organization") {
    return <Redirect href="/organization/tabs/dashboard" />;
  }

  return <Redirect href="/volunteer/tabs/home" />;
}
