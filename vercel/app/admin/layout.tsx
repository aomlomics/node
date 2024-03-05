import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	const user = await currentUser();
	const fromValidEmail = user?.emailAddresses.some((e) => e.emailAddress.endsWith("noaa.gov") || e.emailAddress.endsWith("msstate.edu"));
	if(!fromValidEmail) {
		redirect("/");
	}

	return (
		<>
			{children}
		</>
	);
}