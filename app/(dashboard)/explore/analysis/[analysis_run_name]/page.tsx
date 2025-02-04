import TaxaGrid from "@/app/components/paginated/TaxaGrid";
import { prisma } from "@/app/helpers/prisma";
import Link from "next/link";
import Map from "@/app/components/map/Map";
import Table from "@/app/components/paginated/Table";
import OccDownloadButton from "@/app/components/OccDownloadButton";
import DataDisplay from "@/app/components/DataDisplay";

export default async function Analysis_Run_name({ params }: { params: Promise<{ analysis_run_name: string }> }) {
	const { analysis_run_name } = await params;

	const analysis = await prisma.analysis.findUnique({
		where: {
			analysis_run_name: analysis_run_name
		},
		include: {
			_count: {
				select: {
					Occurrences: true,
					Assignments: true
				}
			},
			Occurrences: {
				distinct: ["samp_name"],
				select: {
					Sample: {
						select: {
							samp_name: true,
							decimalLatitude: true,
							decimalLongitude: true
						}
					}
				}
			}
		}
	});
	if (!analysis) return <>Analysis not found</>;
	const { _count: _, Occurrences: __, ...justAnalysis } = analysis;

	return (
		<div className="max-w-7xl mx-auto p-6">
			{/* Breadcrumb navigation */}
			<div className="text-base breadcrumbs mb-6">
				<ul>
					<li>
						<Link href="/explore/project" className="text-primary hover:text-primary-focus">
							Projects
						</Link>
					</li>
					<li>
						<Link href={`/explore/project/${analysis.project_id}`} className="text-primary hover:text-primary-focus">
							{analysis.project_id}
						</Link>
					</li>
					<li>
						<Link href={`/explore/analysis`} className="text-primary hover:text-primary-focus">
							Analyses
						</Link>
					</li>
					<li>{analysis_run_name}</li>
				</ul>
			</div>

			<div className="grid grid-cols-4 gap-8">
				<div className="col-span-4">
					<header>
						<h1 className="text-4xl font-semibold text-primary mb-2">{analysis_run_name}</h1>
						<div className="bg-base-200 -ml-3.5 text-semibold">
								<OccDownloadButton
									text={"Download Occurrence Table"}
									filename={`${analysis_run_name}_occurrenceTable`}
									where={{ analysis_run_name }}
								/>
							</div>
					</header>
				</div>

				<div className="col-span-2 space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<Link
							href={`/explore/project/${analysis.project_id}`}
							className="stat bg-base-200 p-6 hover:bg-base-300 transition-colors"
						>
							<div className="text-lg font-medium text-base-content/70">Project</div>
							<div className="text-base mt-1">{analysis.project_id}</div>
						</Link>

						<Link
							href={`/explore/assay/${analysis.assay_name}`}
							className="stat bg-base-200 p-6 hover:bg-base-300 transition-colors"
						>
							<div className="text-lg font-medium text-base-content/70">Assay</div>
							<div className="text-base mt-1">{analysis.assay_name}</div>
						</Link>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="stat bg-base-200 p-6">
							<div className="text-lg font-medium text-base-content/70">Total Occurrences</div>
							<div className="text-base mt-1">{analysis._count.Occurrences}</div>
						</div>

						<div className="stat bg-base-200 p-6">
							<div className="text-lg font-medium text-base-content/70">Total Assignments</div>
							<div className="text-base mt-1">{analysis._count.Assignments}</div>
						</div>
					</div>
				</div>

				<div className="col-span-2">
					<div className="bg-base-200 p-6 h-full">
						<div className="text-lg font-medium text-base-content/70">Analysis Information</div>
						<div className="h-[300px] overflow-y-auto mt-4">
							<DataDisplay 
								data={justAnalysis} 
								omit={["id", "project_id", "userId", "analysis_run_name", "assay_name"]}
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="mt-4 px-6">
				<h2 className="text-lg font-medium text-base-content/70 mb-4">Data Explorer</h2>
				<div role="tablist" className="tabs tabs-lifted">
					<input type="radio" defaultChecked name="dataTabs" role="tab" className="tab" aria-label="Samples" />
					<div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
						<div className="card-body p-0 overflow-hidden h-[400px]">
							<Map
								locations={analysis.Occurrences.map((samp) => ({ ...samp.Sample }))}
								id="samp_name"
								table="sample"
								cluster
							/>
						</div>
					</div>

					<input type="radio" name="dataTabs" role="tab" className="tab" aria-label="Assignments" />
					<div
						role="tabpanel"
						className="tab-content bg-base-100 border-base-300 rounded-box p-6 h-[400px] w-full overflow-hidden"
					>
						<Table table="assignment" title="featureid" where={{ analysis_run_name }} />
					</div>

					<input type="radio" name="dataTabs" role="tab" className="tab" aria-label="Taxa" />
					<div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box">
						<TaxaGrid
							where={{
								Assignments: {
									some: {
										analysis_run_name
									}
								}
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
