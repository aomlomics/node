"use client";

import { DeadValueEnum, TableToEnumSchema } from "@/types/enums";
import { Prisma } from "@prisma/client";
import { FormEvent, ReactNode, useState } from "react";
import useSWR, { preload } from "swr";
import { useDebouncedCallback } from "use-debounce";
import { fetcher } from "../../helpers/utils";
import LoadingTable from "./LoadingTable";
import PaginationControls from "./PaginationControls";

export default function Table({
	table,
	title,
	where
}: {
	table: Uncapitalize<Prisma.ModelName>;
	title: string;
	where?: Record<string, any>;
}) {
	const [take, setTake] = useState(50);
	const [page, setPage] = useState(1);

	const [whereFilter, setWhereFilter] = useState({} as Record<string, { contains: string; mode: "insensitive" }>);

	const [columnsFilter, setColumnsFilter] = useState("");
	const handleColFilter = useDebouncedCallback((f) => {
		setColumnsFilter(f);
	}, 300);

	const [headersFilter, setHeadersFilter] = useState({} as Record<string, boolean>);

	function handlePageHover(dir = 1) {
		let query = new URLSearchParams({
			take: take.toString(),
			page: (page + dir).toString()
		});
		if (where) {
			if (Object.keys(whereFilter).length) {
				query.set("where", JSON.stringify({ ...where, ...whereFilter }));
			} else {
				query.set("where", JSON.stringify(where));
			}
		}

		preload(`/api/pagination/${table}?${query.toString()}`, fetcher);
	}

	//filters in the column header
	function applyFilters(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();

		console.log("test");

		const formData = new FormData(e.currentTarget);

		let take = parseInt(formData.get("take") as string);
		formData.delete("take");

		const temp = {} as typeof whereFilter;
		for (const [key, value] of formData.entries()) {
			if (typeof value === "string")
				if (value.trim()) {
					temp[key] = { contains: value, mode: "insensitive" };
				}
		}
		setTake(take);
		setWhereFilter(temp);
	}

	function resetForm() {
		//@ts-ignore
		document.forms[`${table}TableForm`].reset();
		setWhereFilter({});
	}

	//api call
	let query = new URLSearchParams({
		take: take.toString(),
		page: page.toString()
	});
	if (where) {
		if (Object.keys(whereFilter).length) {
			query.set("where", JSON.stringify({ ...where, ...whereFilter }));
		} else {
			query.set("where", JSON.stringify(where));
		}
	}
	const { data, error, isLoading } = useSWR(`/api/pagination/${table}?${query.toString()}`, fetcher);
	if (isLoading) return <LoadingTable />;
	if (error || data.error) return <div>failed to load: {error || data.error}</div>;

	const headers = TableToEnumSchema[table]._def.values.filter((e) => {
		//remove database field
		//displaying title header differently, so removing it
		if (e === "id" || e === title) {
			return false;
		}
		//remove all headers where the value is assumed to be the same
		if (where) {
			for (const head in where) {
				if (e === head) {
					return false;
				}
			}
		}

		return true;
	});

	return (
		<form id={`${table}TableForm`} onSubmit={applyFilters} className="w-full h-full flex flex-col">
			<div className="grid grid-cols-3 justify-items-center">
				{/* Filters Buttons */}
				<div className="flex items-center gap-5">
					<button onClick={resetForm} className="btn btn-sm" type="button">
						Clear Filters
					</button>
					<button type="submit" className="btn btn-sm">
						Apply Filters
					</button>
					<label className="input input-sm input-bordered flex items-center gap-2">
						Per Page:
						<input name="take" defaultValue={take} type="number" className="grow max-w-12" />
					</label>
				</div>
				{/* Pagination Controls */}
				<PaginationControls
					page={page}
					take={take}
					count={data.count}
					handlePage={(dir?: number) => setPage(dir ? page + dir : page + 1)}
					handlePageHover={handlePageHover}
				/>
				{/* Column Selection Button */}
				<div className="flex items-center">
					<div className="dropdown dropdown-end">
						<div tabIndex={0} role="button" className="btn btn-sm">
							Columns
						</div>
						{/* Dropdown */}
						<div
							tabIndex={0}
							className="dropdown-content menu bg-base-300 rounded-box z-50 w-52 shadow p-0 text-xs min-w-min"
						>
							{/* Header Name Filter Section */}
							<div className="form-control flex-row items-center w-full border-b-2 p-2 pb-0">
								<label className="label cursor-pointer justify-start">
									<input
										type="checkbox"
										onChange={(e) => {
											if (e.target.checked) {
												setHeadersFilter({});
											} else {
												setHeadersFilter(
													headers.reduce((acc, head) => {
														if (!headersFilter[head]) {
															return { ...acc, [head]: true };
														} else {
															return { ...acc };
														}
													}, {})
												);
											}
										}}
										checked={!Object.values(headersFilter).some((bool) => bool)}
										className="checkbox checkbox-xs"
									/>
									<span className="label-text pl-2">All</span>
								</label>
								<input
									type="text"
									onChange={(e) => handleColFilter(e.target.value)}
									placeholder="Filter"
									className="input input-bordered input-xs w-full max-w-xs ml-2 mb-1"
								/>
							</div>
							{/* Header Names Section */}
							<ul className="p-2 pt-0 w-full max-h-[200px] overflow-y-auto scrollbar scrollbar-thumb-accent scrollbar-track-base-300">
								{headers.reduce((acc: ReactNode[], head) => {
									//only render the header name if it is selected in the header name filter
									if (head.toLowerCase().includes(columnsFilter.toLowerCase())) {
										//Header Name
										acc.push(
											<li key={head + "_dropdown"} className="form-control">
												<label className="label cursor-pointer justify-start p-1">
													<input
														type="checkbox"
														checked={!headersFilter[head]}
														onChange={() => {
															const temp = { ...headersFilter };
															if (headersFilter[head]) {
																delete temp[head];
															} else {
																temp[head] = true;
															}
															setHeadersFilter(temp);
														}}
														className="checkbox checkbox-xs"
													/>
													<span className="label-text pl-2">{head}</span>
												</label>
											</li>
										);
									}

									return acc;
								}, [])}
							</ul>
						</div>
					</div>
				</div>
			</div>
			<div className="overflow-auto scrollbar scrollbar-thumb-accent scrollbar-track-base-100">
				<table className="table table-xs table-pin-rows table-pin-cols">
					{/* Headers */}
					<thead>
						<tr>
							{/* Title Header Cell */}
							<th className="p-0 pr-2 z-40">
								<label className="form-control w-full max-w-xs">
									<div>
										<span>{title}</span>
									</div>
									{/* Value Filter */}
									<label className="input input-bordered input-xs flex items-center gap-2">
										<input
											name={title}
											defaultValue={!!whereFilter[title] ? whereFilter[title].contains : ""}
											type="text"
											className="grow"
										/>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 16 16"
											fill="currentColor"
											className="h-4 w-4 opacity-70"
										>
											<path
												fillRule="evenodd"
												d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
												clipRule="evenodd"
											/>
										</svg>
									</label>
								</label>
							</th>
							{headers.reduce((acc: ReactNode[], head) => {
								//only render the header if it is selected in the header filter
								if (!headersFilter[head]) {
									//Header
									acc.push(
										<td key={head}>
											<label className="form-control w-full max-w-xs">
												<div>
													<span>{head}</span>
												</div>
												{/* Value Filter */}
												<label className="input input-bordered input-xs flex items-center gap-2">
													<input
														name={head}
														defaultValue={!!whereFilter[head] ? whereFilter[head].contains : ""}
														type="text"
														className="grow"
													/>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														viewBox="0 0 16 16"
														fill="currentColor"
														className="h-4 w-4 opacity-70"
													>
														<path
															fillRule="evenodd"
															d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
															clipRule="evenodd"
														/>
													</svg>
												</label>
											</label>
										</td>
									);
								}

								return acc;
							}, [])}
							<th></th>
						</tr>
					</thead>
					<tbody>
						{/* Value Cell */}
						{data.result.reduce((acc: ReactNode[], row: any, i: number) => {
							//node to render
							acc.push(
								<tr key={i} className="border-base-100 border-b-2">
									<th>{row[title]}</th>
									{headers.reduce((acc: ReactNode[], head, i) => {
										if (!headersFilter[head]) {
											//cell
											acc.push(
												<td
													className={`whitespace-nowrap ${i ? "border-base-100 border-l-2" : ""} ${
														row[head] !== null ? "" : "bg-base-300"
													}`}
													key={row[head] + "child" + i}
												>
													{row[head] in DeadValueEnum && typeof row[head] === "number"
														? DeadValueEnum[row[head]]
														: row[head]}
												</td>
											);
										}

										return acc;
									}, [])}
									<th>{i + 1 + (page - 1) * take}</th>
								</tr>
							);

							return acc;
						}, [])}
					</tbody>
				</table>
			</div>
		</form>
	);
}
