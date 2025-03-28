"use client";

import { DeadBooleanEnum, DeadValueEnum, TableToSchema } from "@/types/enums";
import { Prisma } from "@prisma/client";
import { ReactNode, useRef } from "react";
import { getZodType } from "../helpers/utils";
import InfoButton from "./InfoButton";
import { EditAction } from "@/types/types";

export default function SubmissionEditButton({
	table,
	titleField,
	data,
	action,
	noDisplay,
	noEdit
}: {
	table: Uncapitalize<Prisma.ModelName>;
	titleField: string;
	data: Record<string, any>;
	action: EditAction;
	noDisplay?: string[];
	noEdit?: string[];
}) {
	const modalRef = useRef<HTMLDialogElement>(null);

	const shape = TableToSchema[table].shape;

	//TODO: add x button to modal
	function onClose(e: React.MouseEvent<HTMLButtonElement>) {
		e.preventDefault();
		modalRef.current?.close();
	}

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);

		//check if data has been changed
		const submitFormData = new FormData();
		for (const [field, value] of formData.entries()) {
			if (value && !(value instanceof File)) {
				const type = getZodType(shape[field as keyof typeof shape]).type;

				if (field.startsWith("userDefined")) {
					const userDefinedField = field.split(":")[1];
					if (data.userDefined[userDefinedField] && value != data.userDefined[userDefinedField]) {
						submitFormData.append(field, value);
					}
				} else if (data[field]) {
					if (type === "boolean" && value in DeadBooleanEnum) {
						if (DeadBooleanEnum[value as keyof typeof DeadBooleanEnum] != data[field]) {
							submitFormData.append(field, DeadBooleanEnum[value as keyof typeof DeadBooleanEnum]);
						}
					} else {
						if (value in DeadValueEnum) {
							if (DeadValueEnum[value as keyof typeof DeadValueEnum] != data[field]) {
								//@ts-ignore Typescript thinks you can only index enums with a number, value is a string, this works fine
								submitFormData.append(field, DeadValueEnum[value]);
							}
						} else if (value != data[field]) {
							submitFormData.append(field, value);
						}
					}
				}
			}
		}

		if (submitFormData.entries().next().done) {
			//TODO: set error
			console.log("nothing changed");
			return;
		}

		submitFormData.append("target", data[titleField]);

		for (const [k, v] of submitFormData.entries()) {
			console.log(k, v);
		}

		try {
			//TODO: display loading
			const result = await action(submitFormData);
			if (result.message === "Success") {
				console.log("success");
				modalRef.current?.close();
			} else {
				//TODO: set error
				console.log(result.error);
			}
		} catch {
			//TODO: set error
			console.log("error");
		}
	}

	return (
		<>
			<button
				className="btn btn-sm bg-primary text-neutral-content hover:bg-info"
				onClick={() => modalRef.current?.showModal()}
			>
				Edit
			</button>
			<dialog ref={modalRef} className="modal">
				<div className="modal-box">
					<form onSubmit={onSubmit} className="flex flex-col gap-3">
						<h2>Edit {table}</h2>
						{Object.entries(data).reduce((acc, [field, value]) => {
							if (noDisplay && !noDisplay.includes(field)) {
								const type = getZodType(shape[field as keyof typeof shape]).type;
								if (!type) {
									throw new Error(`Could not find type of '${field}'.`);
								}

								if (type === "string") {
									acc.push(
										<fieldset key={field} className="fieldset">
											<legend className="fieldset-legend flex gap-2">
												<h2>{field}</h2>
												<InfoButton infoText={type} />
											</legend>
											{value && value.length > 100 ? (
												<textarea
													name={field}
													className="textarea textarea-primary w-full"
													disabled={noEdit && noEdit.includes(field)}
													defaultValue={value}
												/>
											) : (
												<input
													name={field}
													type="text"
													className="input input-primary w-full"
													disabled={noEdit && noEdit.includes(field)}
													defaultValue={value}
												/>
											)}
										</fieldset>
									);
								} else if (type === "boolean") {
									acc.push(
										<fieldset key={field} className="fieldset">
											<legend className="fieldset-legend flex gap-2">
												<h2>{field}</h2>
												<InfoButton infoText={type} />
											</legend>
											<input
												name={field}
												type="text"
												className="input input-primary w-full"
												disabled={noEdit && noEdit.includes(field)}
												defaultValue={
													value in DeadBooleanEnum ? DeadBooleanEnum[value as keyof typeof DeadBooleanEnum] : value
												}
											/>
										</fieldset>
									);
								} else if (type === "float" || type === "integer") {
									acc.push(
										<fieldset key={field} className="fieldset">
											<legend className="fieldset-legend flex gap-2">
												<h2>{field}</h2>
												<InfoButton infoText={type} />
											</legend>
											<input
												name={field}
												type="text"
												className="input input-primary w-full"
												disabled={noEdit && noEdit.includes(field)}
												defaultValue={value in DeadValueEnum ? DeadValueEnum[value] : value}
											/>
										</fieldset>
									);
								} else if (type === "date") {
									//TODO: make date default value work
									// acc.push(
									// 	<fieldset key={field} className="fieldset">
									// 		<legend className="fieldset-legend flex gap-2">
									// 			<h2>{field}</h2>
									// 			<InfoButton infoText={type} />
									// 		</legend>
									// 		<input
									// 			name={field}
									// 			type="datetime-local"
									// 			className="input input-primary w-full"
									// 			disabled={noEdit && noEdit.includes(field)}
									// 			defaultValue={value}
									// 		/>
									// 	</fieldset>
									// );
								} else if (type === "json") {
									//TODO: add indicator for user defined section
									for (const userDefinedField in value) {
										acc.push(
											<fieldset key={userDefinedField} className="fieldset">
												<legend className="fieldset-legend flex gap-2">
													<h2>{userDefinedField}</h2>
													<InfoButton infoText="string" />
												</legend>
												{value[userDefinedField] && value[userDefinedField].length > 100 ? (
													<textarea
														name={"userDefined:" + userDefinedField}
														className="textarea textarea-primary w-full"
														disabled={noEdit && noEdit.includes(userDefinedField)}
														defaultValue={value[userDefinedField]}
													/>
												) : (
													<input
														name={"userDefined:" + userDefinedField}
														type="text"
														className="input input-primary w-full"
														disabled={noEdit && noEdit.includes(userDefinedField)}
														defaultValue={value[userDefinedField]}
													/>
												)}
											</fieldset>
										);
									}
								}
							}

							return acc;
						}, [] as ReactNode[])}
						<button type="submit" className="btn">
							Submit
						</button>
					</form>
				</div>
				<form method="dialog" className="modal-backdrop">
					<button>close</button>
				</form>
			</dialog>
		</>
	);
}
