import { DeadValueEnum } from "@/types/enums";
import Link from "next/link";
import { ReactNode } from "react";

export default function DataDisplay({
	data,
	omit = ["id"]
}: {
	data: Record<string, string | number | boolean | Date | null>;
	omit?: (keyof typeof data)[];
}) {
	return (
		<div className="overflow-x-hidden overflow-y-auto scrollbar scrollbar-thumb-accent scrollbar-track-base-100 w-full h-full pr-3 flex flex-col gap-5">
			{Object.entries(data).reduce((acc: ReactNode[], [field, value]) => {
				if (!omit.includes(field)) {
					const fieldNode = <div className="text-sm font-medium text-base-content/70 break-all">{field}</div>;
					let valueNode;

					if (value === null) {
						valueNode = <div className="bg-base-300">{"\u200b"}</div>;
					} else if (URL.canParse(value.toString())) {
						valueNode = (
							<Link
								href={value.toString()}
								className="text-primary hover:underline break-words"
								target="_blank"
								rel="noreferrer"
							>
								{value.toString()}
							</Link>
						);
					} else if (typeof value === "number" && value in DeadValueEnum) {
						valueNode = <div className="break-words">{DeadValueEnum[value]}</div>;
					} else {
						valueNode = <div className="break-words">{value.toString()}</div>;
					}

					acc.push(
						<div className="flex flex-col gap-1" key={field}>
							{fieldNode}
							{valueNode}
						</div>
					);
				}

				return acc;
			}, [])}
		</div>
	);
}
