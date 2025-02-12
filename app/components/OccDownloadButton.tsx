"use client";

import { Prisma } from "@prisma/client";
import occDownloadAction from "../helpers/actions/occDownloadAction";

export default function OccDownloadButton({
	text,
	filename,
	where
}: {
	text: string;
	filename: string;
	where: Prisma.OccurrenceWhereInput;
}) {
	async function download() {
		const result = await occDownloadAction(where);

		if (result.file) {
			const url = URL.createObjectURL(result.file);
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", `${filename}.tsv`);
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	}

	return (
		<button onClick={download} className="btn">
			{text}
			<svg
				className="w-8 h-8 text-primary group-hover:scale-110 transition-transform"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
					d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
				/>
			</svg>
		</button>
	);
}
