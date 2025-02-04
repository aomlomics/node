import { prisma } from "@/app/helpers/prisma";
import Link from "next/link";
import Map from "@/app/components/map/Map";
import Image from "next/image";
import Table from "@/app/components/paginated/Table";
import BarChart from "@/app/components/charts/BarChart";
import { randomColors } from "@/app/helpers/utils";
import DataDisplay from "@/app/components/DataDisplay";

export default async function Project_Id({ params }: { params: Promise<{ project_id: string }> }) {
	let { project_id } = await params;
	project_id = decodeURIComponent(project_id);

	const project = await prisma.project.findUnique({
		where: {
			project_id
		},
		include: {
			_count: {
				select: {
					Samples: true,
					Analyses: true
				}
			},
			Samples: {
				select: {
					samp_name: true,
					decimalLatitude: true,
					decimalLongitude: true
				}
			},
			Analyses: {
				select: {
					analysis_run_name: true,
					assay_name: true,
					Assay: {
						select: {
							target_gene: true
						}
					},
					Assignments: {
						select: {
							taxonomy: true
						}
					}
				}
			}
		}
	});
	if (!project) return <>Project not found</>;
	const { _count: _, Samples: __, Analyses: ___, ...justProject } = project;

	const uniqueAssays = project.Analyses.reduce(
		(acc, a) => ({ ...acc, [a.assay_name]: { target_gene: a.Assay.target_gene } }),
		{} as Record<string, Record<string, string>>
	);

	//get a sorted array of taxonomy counts, and a separate object to show which analysis taxonomies came from
	const taxaCount = {} as Record<string, number>;
	const taxaCountByAnalysis = {} as Record<string, Record<string, number>>;
	for (const a of project.Analyses) {
		taxaCountByAnalysis[a.analysis_run_name] = {};
		for (const assign of a.Assignments) {
			if (assign.taxonomy in taxaCount) {
				taxaCount[assign.taxonomy] += 1;
			} else {
				taxaCount[assign.taxonomy] = 1;
			}

			if (assign.taxonomy in taxaCountByAnalysis[a.analysis_run_name]) {
				taxaCountByAnalysis[a.analysis_run_name][assign.taxonomy] += 1;
			} else {
				taxaCountByAnalysis[a.analysis_run_name][assign.taxonomy] = 1;
			}
		}
	}
	const colorsArr = randomColors(Object.keys(taxaCountByAnalysis).length);
	const sortedTaxa = Object.entries(taxaCount).sort(([, a], [, b]) => b - a);
	const topTaxa = [...sortedTaxa]; // Create a copy for the top taxonomy section

	return (
		<div className="max-w-7xl mx-auto p-6">
			<div className="grid grid-cols-3 gap-8 mb-3">
				<div className="col-span-3">
					<header>
						<h1 className="text-4xl font-semibold text-primary mb-2">{project.project_id}</h1>
						<p className="text-lg text-base-content/70">{project.project_name}</p>
					</header>
				</div>

				<div className="col-span-2 space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<Link
							href="#samples-section"
							className="stat bg-base-200 p-6 hover:bg-base-300 transition-colors cursor-pointer"
						>
							<div className="text-sm font-medium text-base-content/70">Total Samples</div>
							<div className="text-2xl font-medium mt-1">{project._count.Samples}</div>
						</Link>

						<details className="dropdown dropdown-bottom w-full">
							<summary className="stat bg-base-200 p-6 hover:bg-base-300 focus:bg-base-300 transition-colors w-full cursor-pointer relative z-[2] flex justify-between items-center">
								<div>
									<div className="text-sm font-medium text-base-content/70">Total Analyses</div>
									<div className="text-2xl font-medium mt-1">{project._count.Analyses}</div>
								</div>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="text-base-content/70"
								>
									<path d="m6 9 6 6 6-6" />
								</svg>
							</summary>
							<ul className="dropdown-content menu py-1 px-2 bg-base-300 rounded-b-box w-full rounded-t-none shadow-xl absolute top-[calc(100%-1.25rem)] left-0 z-[1]">
								{project.Analyses.map((analysis) => (
									<li key={analysis.analysis_run_name}>
										<Link
											href={`/explore/analysis/${analysis.analysis_run_name}`}
											className="text-base-content hover:text-primary"
										>
											{analysis.analysis_run_name}
										</Link>
									</li>
								))}
							</ul>
						</details>
					</div>

					<div className="bg-base-200 p-6">
						<div className="text-sm font-medium text-base-content/70 mb-2">Top Taxonomy</div>
						{sortedTaxa.slice(0, 5).map((taxa) => {
							const taxonomyParts = taxa[0].split(";").filter(Boolean); // Remove empty strings after split
							const lastTaxonomy = taxonomyParts[taxonomyParts.length - 1]?.trim() || "Unknown";
							return (
								<div key={taxa[0]} className="text-base mb-1">
									{lastTaxonomy}: {taxa[1]}
								</div>
							);
						})}
					</div>
				</div>

				<div className="bg-base-200 p-6">
					<h2 className="text-lg font-medium text-base-content/70 mb-4">Project Information</h2>
					<div className="h-[300px] overflow-y-auto">
						<DataDisplay data={justProject} omit={["id", "project_id", "userId", "project_name"]} />
					</div>
				</div>
			</div>

			<div className="bg-base-200 -mt-4">
				<div className="card-body px-6">
					<h2 className="card-title text-base-content/70">
						Assays in this Project: {Object.keys(uniqueAssays).length}
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
						{Object.keys(uniqueAssays).map((assay, index) => {
							const imagePath = `/images/${assay}_icon.svg`;

							return (
								<div key={index} className="card bg-base-300 shadow-md">
									<div className="card-body">
										<div className="flex items-center gap-4">
											<div className="w-16 h-16">
												<Image src={imagePath} alt={assay} width={64} height={64} className="object-contain" />
											</div>
											<div>
												<h3 className="font-medium">{uniqueAssays[assay].target_gene}</h3>
												<p className="text-sm text-base-content">{assay}</p>
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			<div className="mt-4 px-6">
				<h2 id="samples-section" className="card-title text-base-content/70 mb-4">
					Samples:
				</h2>
				<div role="tablist" className="tabs tabs-lifted">
					<input type="radio" name="dataTabs" role="tab" className="tab" aria-label="Map" defaultChecked />
					<div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
						<div className="card-body p-0 overflow-hidden h-[400px]">
							<Map locations={project.Samples} id="samp_name" table="sample" cluster />
						</div>
					</div>

					<input type="radio" name="dataTabs" role="tab" className="tab" aria-label="Table" />
					<div
						role="tabpanel"
						className="tab-content bg-base-100 border-base-300 rounded-box p-6 h-[400px] w-full overflow-hidden"
					>
						<Table table="sample" title="samp_name" where={{ project_id }}></Table>
					</div>

					<input type="radio" name="dataTabs" role="tab" className="tab" aria-label="Charts" />
					<div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
						<BarChart
							title="Top 10 Taxonomies"
							labels={sortedTaxa.slice(0, 10).map((taxaArr) => taxaArr[0].split(";")[taxaArr[0].split(";").length - 1])}
							datasets={Object.keys(taxaCountByAnalysis).map((taxa, i) => ({
								label: taxa.split(";")[taxa.split(";").length - 1],
								data: sortedTaxa.slice(0, 10).map((taxaArr) => taxaCountByAnalysis[taxa][taxaArr[0]]),
								backgroundColor: colorsArr[i]
							}))}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
