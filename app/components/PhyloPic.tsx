import { Taxonomy } from "@prisma/client";
import Image from "next/image";

export default async function PhyloPic({ taxonomy }: { taxonomy: Taxonomy }) {
	const errorImg = <>No Image</>;

	const ranksBySpecificity = ["species", "genus", "family", "order", "taxonClass", "phylum", "kingdom"] as Array<
		keyof typeof taxonomy
	>;

	let gbifTaxonomy;
	let imageDetails = { rank: "", title: "" };
	for (const rank of ranksBySpecificity) {
		if (taxonomy[rank] && /^[a-zA-Z]+$/.test(taxonomy[rank].toString())) {
			//retrieve suggested taxonomies from GBIF
			//TODO: split more logically
			const gbifTaxaRes = await fetch(`https://api.gbif.org/v1/species/suggest?q=${taxonomy[rank]}`);
			const gbifTaxa = await gbifTaxaRes.json();
			//get only the taxonomies that match the specific rank
			//TODO: check GBIF API docs to do this step in the previous fetch
			//have to replace our database class field with the proper keyword
			if (rank === "taxonClass") {
				gbifTaxonomy = gbifTaxa.filter((taxa: Record<string, any>) => taxa.rank.toLowerCase() === "class")[0];
			} else {
				gbifTaxonomy = gbifTaxa.filter((taxa: Record<string, any>) => taxa.rank.toLowerCase() === rank)[0];
			}
			if (gbifTaxonomy) {
				imageDetails.rank = rank;
				break;
			}
		}
	}
	if (!gbifTaxonomy) {
		return errorImg;
	}

	//use result of GBIF API to query PhyloPics for the vector image
	const objectIDs =
		`${gbifTaxonomy.speciesKey ? gbifTaxonomy.speciesKey + "," : ""}` +
		`${gbifTaxonomy.genus ? gbifTaxonomy.genus + "," : ""}` +
		`${gbifTaxonomy.familyKey ? gbifTaxonomy.familyKey + "," : ""}` +
		`${gbifTaxonomy.orderKey ? gbifTaxonomy.orderKey + "," : ""}` +
		`${gbifTaxonomy.classKey ? gbifTaxonomy.classKey + "," : ""}` +
		`${gbifTaxonomy.phylumKey ? gbifTaxonomy.phylumKey + "," : ""}` +
		`${gbifTaxonomy.kingdomKey ? gbifTaxonomy.kingdomKey : ""}`;
	const phyloPicRes = await fetch(
		`https://api.phylopic.org/resolve/gbif.org/species?embed_primaryImage=true&objectIDs=${objectIDs}`
	);
	const phyloPic = await phyloPicRes.json();
	if (phyloPic.errors) {
		return errorImg;
	}
	const imageUrl = phyloPic._embedded.primaryImage._links.vectorFile.href;
	imageDetails.title = phyloPic._embedded.primaryImage._links.self.title;

	//TODO: make image not take up entire screen
	return (
		<div className="w-full h-full relative flex flex-col items-center justify-center">
			<div
				className="tooltip tooltip-bottom tooltip-primary w-full h-full"
				data-tip={`${imageDetails.rank[0].toUpperCase() + imageDetails.rank.slice(1)}: ${imageDetails.title}`}
			>
				<Image src={imageUrl} alt="Image of taxonomy" fill className="object-contain" />
			</div>
		</div>
	);
}
