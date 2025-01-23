"use server";

import { prisma } from "@/app/helpers/prisma";
import { auth } from "@clerk/nextjs/server";

export default async function projectDeleteAction(formData: FormData) {
	const { userId } = await auth();
	if (!userId) {
		return { message: "Error", error: "Unauthorized" };
	}

	const del = JSON.parse(formData.get("del") as string);

	await prisma.$transaction(
		async (tx) => {
			//project delete
			if (del.project_id) {
				console.log("project delete");
				await tx.project.delete({
					where: {
						project_id: del.project_id
					}
				});
			}

			//features delete
			console.log("empty features delete");
			await tx.feature.deleteMany({
				where: {
					Assignments: {
						none: {}
					}
				}
			});

			//taxonomies delete
			console.log("empty taxonomies delete");
			await tx.taxonomy.deleteMany({
				where: {
					Assignments: {
						none: {}
					}
				}
			});
		},
		{ timeout: 1.5 * 60 * 1000 }
	);

	return { message: "Success" };
}
