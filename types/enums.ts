export enum DeadValueEnum {
	"not applicable: control sample" = -9999,
	"not applicable: sample group",
	"not applicable",
	"missing: not collected: synthetic construct",
	"missing: not collected: lab stock",
	"missing: not collected: third party data",
	"missing: not collected",
	"missing: not provided: data agreement established pre-2023",
	"missing: not provided",
	"missing: restricted access: endangered species",
	"missing: restricted access: human-identifiable",
	"missing: restricted access"
}

export const DeadBooleanEnum = {
	false: "false",
	"0": "false",
	true: "true",
	"1": "true",
	"not applicable: control sample": "not_applicableCOLON__control_sample",
	"not applicable: sample group": "not_applicableCOLON__sample_group",
	"not applicable": "not_applicable",
	"missing: not collected: synthetic construct": "missingCOLON__not_collectedCOLON__synthetic_construct",
	"missing: not collected: lab stock": "missingCOLON__not_collectedCOLON__lab_stock",
	"missing: not collected: third party data": "missingCOLON__not_collectedCOLON__third_party_data",
	"missing: not collected": "missingCOLON__not_collected",
	"missing: not provided: data agreement established pre-2023":
		"missingCOLON__not_providedCOLON__data_agreement_established_pre__2023",
	"missing: not provided": "missingCOLON__not_provided",
	"missing: restricted access: endangered species": "missingCOLON__restricted_accessCOLON__endangered_species",
	"missing: restricted access: human-identifiable": "missingCOLON__restricted_accessCOLON__human__identifiable",
	"missing: restricted access": "missingCOLON__restricted_access"
};
