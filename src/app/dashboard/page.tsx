"use client";
import CreateVideoForm from "~/components/ui/CreateVideoForm/create-video-form";
import UserCard from "~/components/ui/UserCard/user-card";
import useAuth from "~/hooks/use-auth";
import useUserData from "~/hooks/use-user-data";

export default function Dashboard() {
  const auth = useAuth();

  const userData = useUserData();

  return (
    <div>
      <h1 className="text-4xl font-bold ">Dashboard</h1>
      <UserCard user={auth.user} />
      <p>Credits: {userData.data}</p>
      <CreateVideoForm />
    </div>
  );
}
