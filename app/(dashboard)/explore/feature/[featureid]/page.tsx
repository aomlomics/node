import DataDisplay from "@/app/components/DataDisplay";
import { prisma } from "@/app/helpers/prisma";
import { ReactNode } from "react";

export default async function Featureid({ params }: { params: Promise<{ featureid: string }> }) {
	let { featureid } = await params;
	featureid = decodeURIComponent(featureid);

	const { feature, taxaCounts, prevalence } = await prisma.$transaction(async (tx) => {
		const feature = await tx.feature.findUnique({
			where: {
				featureid
			},
			include: {
				Assignments: {
					distinct: ["taxonomy"],
					select: {
						taxonomy: true
					}
				},
				_count: {
					select: {
						Assignments: true
					}
				}
			}
		});

		const taxaCounts = [] as { taxonomy: string; count: number }[];
		if (feature) {
			for (const { taxonomy } of feature.Assignments) {
				taxaCounts.push({
					taxonomy,
					count: await tx.assignment.count({
						where: {
							taxonomy,
							featureid
						}
					})
				});
			}
		}

		const relevantSamples = await tx.sample.count({
			where: {
				Occurrences: {
					some: {
						featureid
					}
				}
			}
		});
		const samplesCount = await tx.sample.count();
		const prevalence = (relevantSamples / samplesCount) * 100;

		return { feature, taxaCounts, prevalence };
	});

	if (!feature) return <>Feature not found</>;

	taxaCounts.sort((a, b) => b.count - a.count);

	return (
		<div className="max-w-7xl mx-auto p-6 space-y-8">
			<header>
				<h1 className="text-4xl font-semibold text-primary mb-2">{feature.featureid}</h1>
				<p className="text-md text-base-content/70 break-all">{feature.dna_sequence}</p>
			</header>
			<div>
				<h2 className="text-primary text-2xl">Taxonomy</h2>
				<div className="grid grid-cols-2 gap-4">
					{taxaCounts.reduce((acc: ReactNode[], { taxonomy, count }) => {
						acc.push(
							<div className="break-words" key={`${taxonomy}1`}>
								{taxonomy}
							</div>
						);
						acc.push(
							<div key={`${taxonomy}2`}>
								{count} ({(count / feature._count.Assignments) * 100}%)
							</div>
						);

						return acc;
					}, [])}
				</div>
			</div>
		</div>
	);
}
