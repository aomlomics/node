import { prisma } from "../helpers/prisma";
import Link from "next/link";

export default async function DataSummary() {
	const { projectCount, sampleCount, taxaCount, featureCount, uniqueAssays } = await prisma.$transaction(async (tx) => {
		const projectCount = await tx.project.count();
		const sampleCount = await tx.sample.count();
		const taxaCount = await tx.taxonomy.count();
		const featureCount = await tx.feature.count();
		const uniqueAssays = (await tx.assay.findMany({
			distinct: ["target_gene"],
			select: {
				target_gene: true
			}
		})) as { target_gene: string; count?: number }[];

		for (const a of uniqueAssays) {
			//get count of features that were assigned using a particular target gene
			//number of assignments = number of features (an assignment has only one feature)
			const count = await tx.analysis.findFirst({
				where: {
					Assay: {
						target_gene: a.target_gene
					}
				},
				select: {
					_count: {
						select: {
							Assignments: true
						}
					}
				}
			});
			if (count) {
				a.count = count._count.Assignments;
			}
		}

		return { projectCount, sampleCount, taxaCount, featureCount, uniqueAssays };
	});

	return (
		<div>
			<div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
				<DataSummaryItem title="Projects" value={projectCount} href="/explore/project" />
				<DataSummaryItem title="Samples" value={sampleCount} href="/explore/sample" />
				<DataSummaryItem title="Observed Taxonomies" value={taxaCount} href="/explore/taxonomy" />
				<DataSummaryItem title="Unique Sequence Features" value={featureCount} href="/explore/feature" />
				{uniqueAssays.map((a) => (
					<DataSummaryItem key={a.target_gene} title={a.target_gene} value={a.count || 0} href="/explore/assay" />
				))}
			</div>
		</div>
	);
}

function DataSummaryItem({ title, value, href }: { title: string; value: number; href: string }) {
	return (
		<Link
			href={href}
			className="bg-base-200 hover:bg-base-300 active:bg-interactive-active p-6 rounded-lg text-center shadow-md transition-colors"
		>
			<h3 className="text-main text-lg mb-2">{title}</h3>
			<p className="text-primary text-3xl font-bold">{value.toLocaleString()}</p>
		</Link>
	);
}
