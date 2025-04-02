import { ReactNode } from "react";
import CodeBlock from "./CodeBlock";
import InlineCode from "./InlineCode";
import SchemaDisplay from "../SchemaDisplay";
import ThemeAwareSvg from "./ThemeAwareSvg";

// Define types for our content structure
export type Subsection = {
	id: string; // Used for anchor links and React keys
	title: string; // Display text in navigation and headings
	content: ReactNode; // Allows JSX content
};

export type Section = {
	id: string;
	title: string;
	content: ReactNode;
	subsections?: Subsection[]; // Optional array of subsections
};

export const apiSections: Section[] = [
	{
		id: "introduction",
		title: "Introduction",
		content: (
			<>
				<p className="mb-4">
					The NODE API provides programmatic access to marine genomic data. This documentation will help you understand
					how to use the API to query and retrieve data from the NODE platform.
				</p>
			</>
		),
		subsections: [
			{
				id: "overview",
				title: "Overview",
				content: (
					<>
						<p className="mb-4">
							NODE provides a RESTful API allows you to access all available data in the database through HTTP requests.
							The API has several{" "}
							<a href="#api-endpoints" className="text-primary">
								endpoints
							</a>{" "}
							and{" "}
							<a href="#query-parameter-syntax" className="text-primary">
								parameters
							</a>
							, allowing you to parse through our data with flexible queries.
						</p>
						<p className="mb-4">
							You can use this API to query the entire database for projects, samples, analyses, features, and taxonomic
							information for integration into your own applications, data analysis workflows, or visualizations.
						</p>
						<p className="mb-4">
							The API is public and requires no authentication or API keys to use. GET requests are the only type
							supported.
						</p>
					</>
				)
			},
			{
				id: "quick-start",
				title: "Quick Start",
				content: (
					<>
						<div className="mb-4">Here are some examples of how to get data in various environments:</div>

						<div className="mb-4">Raw JSON responses in browser:</div>
						<InlineCode code={`${process.env.NEXT_PUBLIC_URL}/api/tables`} />

						<div className="mb-4 mt-4">Python (+ Pandas) example:</div>
						<CodeBlock
							language="python"
							code={`import requests
import json
import pandas as pd

# Make API request to desired endpoint
url = "${process.env.NEXT_PUBLIC_URL}/api/project"
response = requests.get(url)

# Check if request was successful
if response.status_code == 200:
    # Parse JSON response and print it
    data = response.json()
    results = data['result']
    print("JSON Response:")
    print(json.dumps(results, indent=2))

    # Convert to DataFrame and print it
    df = pd.DataFrame(results)
    print("--------------------")
    print("DataFrame:")
    print(df)
else:
    print(f"Error: {response.status_code}")
    if response.content:
        print(f"Error message: {response.json()['error']}")`}
						/>

						<div className="mb-4 mt-4">R example:</div>
						<CodeBlock
							language="r"
							code={`library(httr)
library(jsonlite)

# Make API request
url <- "${process.env.NEXT_PUBLIC_URL}/api/project"
response <- GET(url)

# Check if request was successful
if (http_status(response)$category == "Success") {
  # Parse JSON response
  data <- content(response, "text") %>% fromJSON()
  results <- data$result
  print(results)
} else {
  print(paste("Error:", http_status(response)$reason))
  if (length(content(response)) > 0) {
    print(paste("Error message:", content(response)$error))
  }
}`}
						/>
					</>
				)
			}
		]
	},
	{
		id: "database-schema",
		title: "Database Schema",
		content: (
			<>
				<p className="mb-4">
					This section shows the relationships between tables in the database, and what fields are available for each
					table. This will help you effectively{" "}
					<a href="#relations" className="text-primary">
						query relations
					</a>{" "}
					and
					<a href="#query-parameter-syntax" className="text-primary">
						{" "}
						filter by fields
					</a>
					.
				</p>
			</>
		),
		subsections: [
			{
				id: "entity-relationship-diagram",
				title: "Entity Relationship Diagram",
				content: (
					<>
						<p className="mb-4">The following diagram shows the relationships between tables in the database:</p>

						<div className="p-4 rounded-md mb-4 bg-base-200">
							<div className="relative w-full aspect-[640/338]">
								<ThemeAwareSvg
									lightSrc="/images/NODE_Relations_Light.svg"
									darkSrc="/images/NODE_Relations_Dark.svg"
									alt="Database entity relationship diagram"
									fill
									sizes="(max-width: 768px) 100vw, 768px"
									priority
								/>
							</div>
						</div>

						<p className="mb-4">
							Use this diagram as a reference when constructing queries with the{" "}
							<a href="#relations" className="text-primary">
								relations
							</a>{" "}
							parameter.
						</p>
					</>
				)
			},
			{
				id: "table-definitions",
				title: "Table Definitions",
				content: (
					<>
						<p className="mb-4">
							The dropdown menus below show the fields available for each table in NODE. You can use this information in
							your API requests to query and filter on specific fields.
						</p>
						<SchemaDisplay />
					</>
				)
			}
		]
	},
	{
		id: "query-construction",
		title: "Query Construction Guide",
		content: (
			<>
				<p className="mb-4">
					This section explains how to construct API queries to retrieve data from the NODE database.
				</p>
			</>
		),
		subsections: [
			{
				id: "url-structure",
				title: "URL Structure",
				content: (
					<>
						<p className="mb-4">API requests follow this general pattern:</p>
						<div className="p-4 my-6 bg-base-200 border-l-4 border-primary rounded-md shadow-sm">
							<div className="text-xl break-all">
								{process.env.NEXT_PUBLIC_URL}/api/[endpoint]?[parameter]&[parameter]&...
							</div>
						</div>

						<p className="mb-4">Where:</p>
						<ul className="list-disc ml-6 mb-4">
							<li>[endpoint] is the name of the API endpoint</li>
							<li>[parameters] are optional query parameters</li>
						</ul>
					</>
				)
			},
			{
				id: "query-parameter-syntax",
				title: "Query Parameter Syntax",
				content: (
					<>
						<p className="mb-4">Query parameters follow this format: parameter=value</p>

						<p className="mb-4">For example, to select specific fields:</p>
						<div className="mb-4">
							<InlineCode code="/api/project?fields=id,project_name" />
						</div>
					</>
				)
			},
			{
				id: "multiple-parameters",
				title: "Multiple Parameters",
				content: (
					<>
						<p className="mb-4">Combine multiple parameters using an ampersand:</p>
						<div className="mb-4">
							<InlineCode code="/api/project?fields=id,project_name&limit=10" />
						</div>
					</>
				)
			},
			{
				id: "example-urls",
				title: "Example URLs",
				content: (
					<>
						<p className="mb-4">Here are some example URLs to help you understand query construction:</p>

						<h4 className="font-medium mb-2">Basic query:</h4>
						<div className="mb-4">
							<InlineCode code="/api/project?fields=id,project_name" />
						</div>

						<h4 className="font-medium mb-2">With relations:</h4>
						<div className="mb-4">
							<InlineCode code="/api/project?fields=id,project_name&relations=samples" />
						</div>

						<h4 className="font-medium mb-2">With filtering:</h4>
						<div className="mb-4">
							<InlineCode code="/api/project?project_name=Gomecc4&limit=5" />
						</div>

						<p className="mb-4">
							These examples demonstrate different ways to query the API. You can adjust them to suit your specific
							needs.
						</p>
					</>
				)
			}
		]
	},
	{
		id: "api-endpoints",
		title: "API Endpoints",
		content: (
			<>
				<p className="mb-4">This section documents all available API endpoints and their functionality.</p>
			</>
		),
		subsections: [
			{
				id: "get-all-tables",
				title: "Get All Tables",
				content: (
					<>
						<div className="mb-4">Endpoint: /api/tables</div>

						<p className="mb-4">
							Returns a list of all available tables in the database. Use this to discover what data is available
							through the API.
						</p>

						<div className="mb-4">
							Example URL: <InlineCode code={`${process.env.NEXT_PUBLIC_URL}/api/tables`} />
						</div>

						<div className="mb-4">Example Response:</div>

						<CodeBlock
							language="json"
							code={`{
  "message": "Success",
  "result": [
    "project",
    "sample",
    "assay",
    "library",
    "analysis",
    "occurrence",
    "feature",
    "assignment",
    "taxonomy"
  ]
}`}
						/>
					</>
				)
			},
			{
				id: "get-table-fields",
				title: "Get Table Fields",
				content: (
					<>
						<div className="mb-4">Endpoint: /api/[table]/fields</div>

						<div className="mb-4 mt-4">
							Example URL: <InlineCode code="/api/project" />
						</div>

						<div className="mb-4">Example Response:</div>
						<CodeBlock
							language="json"
							code={`{
  "message": "Success",
  "result": [{
    "id": 1,
    "project_id": "noaa-aoml-gomecc4",
    "userId": "user_2de7fXfAmCCpbB6yr6PbK0Esc9f",
    "dateSubmitted": "2025-03-03T16:26:52.455Z",
    "recordedBy": "Luke Thompson",
    "recordedByID": "https://orcid.org/0000-0002-3911-1280",
    "project_contact": "Luke Thompson",
    "institution": "NOAA/AOML",
    "institutionID": "https://www.aoml.noaa.gov/omics",
    "project_name": "eDNA from Gulf of Mexico Ecosystems and Carbon Cruise 2021 (GOMECC-4)",
    "study_factor": "water column spatial series",
    "detection_type": "multi taxon detection",
    "license": "http://creativecommons.org/publicdomain/zero/1.0/legalcode",
    "rightsHolder": "US Government",
    "accessRights": "no rights reserved",
    "informationWithheld": "no information withheld",
    "dataGeneralizations": "no data generalizations",
    "bibliographicCitation": "https://doi.org/10.1101/2024.07.30.605667",
    "associated_resource": "http://www.earthmicrobiome.org/",
    "mod_date": "2024-10-31T04:00:00.000Z",
    "checkls_ver": "1.1",
    "seq_archive": "PRJNA887898",
    "code_repo": "https://github.com/aomlomics/gomecc",
    "expedition_id": "GOMECC-4 (2021)"
  }]
}`}
						/>
					</>
				)
			},
			{
				id: "query-table-data",
				title: "Query Table Data",
				content: (
					<>
						<div className="mb-4">Endpoint: /api/[table]</div>

						<p className="mb-4">
							Returns multiple records from a specific table. This endpoint supports various query parameters for
							filtering, selecting fields, including relations, and limiting results.
						</p>

						<div className="mb-4">
							Example URL: <InlineCode code="/api/project?fields=id,project_name" />
						</div>

						<div className="mb-4">Example Response:</div>

						<CodeBlock
							language="json"
							code={`{
  "message": "Success",
  "result": [
    { "id": 1, "project_name": "eDNA from Gulf of Mexico Ecosystems and Carbon Cruise 2021 (GOMECC-4)" }
  ]
}`}
						/>
					</>
				)
			},
			{
				id: "get-single-record",
				title: "Get Single Record",
				content: (
					<>
						<div className="mb-4">Endpoint: /api/[table]/[id]</div>

						<div className="mb-4 mt-4">
							Example URL: <InlineCode code="http://localhost:3000/api/taxonomy/22" />
						</div>

						<div className="mb-4 mt-4">
							Returns a single record from a table based on its ID. This endpoint supports parameters for selecting
							specific fields and including related data.
						</div>

						<div className="mb-4">Example Response:</div>

						<CodeBlock
							language="json"
							code={`{
  "message": "Success",
  "result": {
    "id": 22,
    "taxonomy": "Eukaryota;Obazoa;Opisthokonta;Metazoa;Arthropoda;Crustacea;Maxillopoda;Centropages;Centropages_furcatus;",
    "verbatimIdentification": "Eukaryota;Obazoa;Opisthokonta;Metazoa;Arthropoda;Crustacea;Maxillopoda;Centropages;Centropages_furcatus;",
    "domain": null,
    "kingdom": "Eukaryota",
    "supergroup": "Obazoa",
    "division": "Opisthokonta",
    "subdivision": "Metazoa",
    "phylum": null,
    "class": "Arthropoda",
    "order": "Crustacea",
    "family": "Maxillopoda",
    "genus": "Centropages",
    "species": "Centropages furcatus"
  }
}`}
						/>
					</>
				)
			}
		]
	},
	{
		id: "query-parameters",
		title: "Query Parameters",
		content: (
			<>
				<p className="mb-4">
					Query parameters allow you to customize your API requests. This section details all available parameters and
					how to use them.
				</p>
			</>
		),
		subsections: [
			{
				id: "field-selection",
				title: "Field Selection",
				content: (
					<>
						<div className="mb-4">Parameter: fields=field1,field2,field3</div>

						<p className="mb-4">
							Specifies which fields to include in the response. When omitted, all fields are returned.
						</p>

						<div className="mb-4">
							Example URL: <InlineCode code="/api/project?fields=id,project_name,dateSubmitted" />
						</div>

						<p className="mb-4">
							This example returns only the <code className="px-1 py-0.5 bg-base-200 rounded">id</code>,{" "}
							<code className="px-1 py-0.5 bg-base-200 rounded">project_name</code>, and{" "}
							<code className="px-1 py-0.5 bg-base-200 rounded">dateSubmitted</code> fields for each project.
						</p>
					</>
				)
			},
			{
				id: "field-filtering",
				title: "Field Filtering",
				content: (
					<>
						<div className="mb-4">Parameter: fieldName=value</div>

						<p className="mb-4">
							Filters results to return only records where the specified field contains the provided value.
						</p>

						<div className="mb-4">
							Example URL: <InlineCode code="/api/project?project_name=Test" />
						</div>

						<p className="mb-4">
							This example returns all projects where the{" "}
							<code className="px-1 py-0.5 bg-base-200 rounded">project_name</code> field contains "Test".
						</p>
					</>
				)
			},
			{
				id: "relations",
				title: "Relations",
				content: (
					<>
						<div className="mb-4">Parameter: relations=relation1,relation2</div>

						<p className="mb-4">
							Includes related data from other tables in the response. The relation names can be lowercase or
							capitalized and must be plural, separated by commas.
						</p>

						<div className="mb-4">
							Example URL: <InlineCode code="/api/project?relations=samples,analyses" />
						</div>

						<p className="mb-4">
							This example returns all projects along with their related samples and analyses. By default, only the ID
							field is included for related records.
						</p>
					</>
				)
			},
			{
				id: "relation-field-options",
				title: "Relation Field Options",
				content: (
					<>
						<div className="mb-4">Parameter: relationsAllFields=true or relationsAllFields=false</div>

						<p className="mb-4">
							Controls whether to include only the ID field on relations (default), or to include all fields.
						</p>

						<div className="mb-4">
							Example URL: <InlineCode code="/api/project?relations=samples&relationsAllFields=true" />
						</div>

						<p className="mb-4">
							This example returns all projects along with all fields from their related samples, not just the sample
							IDs.
						</p>
					</>
				)
			},
			{
				id: "id-filtering",
				title: "ID Filtering",
				content: (
					<>
						<div className="mb-4">Parameter: ids=1,2,4,7</div>

						<p className="mb-4">
							Filters results to return only records with the specified IDs. IDs must be numbers greater than 0,
							separated by commas.
						</p>

						<div className="mb-4">
							Example URL: <InlineCode code="/api/project?ids=1,2,3" />
						</div>

						<p className="mb-4">This example returns only projects with IDs 1, 2, and 3.</p>
					</>
				)
			},
			{
				id: "result-limiting",
				title: "Result Limiting",
				content: (
					<>
						<div className="mb-4">Parameter: limit=number</div>

						<p className="mb-4">Limits the number of results returned. Must be a positive number.</p>

						<div className="mb-4">
							Example URL:{" "}
							<span className="inline-block" style={{ minWidth: "auto" }}>
								<InlineCode code="/api/project?limit=20" />
							</span>
						</div>

						<p className="mb-4">This example limits the results to 20 projects.</p>
					</>
				)
			}
		]
	},
	{
		id: "complete-examples",
		title: "Complete Examples",
		content: (
			<>
				<p className="mb-4">
					This section provides complete example queries to help you understand how to combine various parameters.
				</p>
			</>
		),
		subsections: [
			{
				id: "basic-query",
				title: "Basic Query",
				content: (
					<>
						<div className="mb-4">
							Example URL: <InlineCode code="/api/project?fields=id,project_name" />
						</div>

						<p className="mb-4">This simple query returns just the ID and name of all projects.</p>

						<div className="mb-4">Example Response:</div>

						<CodeBlock
							language="json"
							code={`{
  "message": "Success",
  "result": [
    { "id": 1, "project_name": "Gulf of Mexico Metabarcoding" },
    { "id": 2, "project_name": "Atlantic Coastal eDNA Survey" }
  ]
}`}
						/>
					</>
				)
			},
			{
				id: "with-relations",
				title: "With Relations",
				content: (
					<>
						<p className="mb-4">
							Example URL: <InlineCode code="/api/project?relations=samples&relationsAllFields=true" />
						</p>

						<p className="mb-4">
							This query returns all projects along with complete information about their related samples.
						</p>

						<p className="mb-4">Example Response:</p>

						<CodeBlock
							language="json"
							code={`{
  "message": "Success",
  "result": [
    {
      "id": 1,
      "project_name": "Gulf of Mexico Metabarcoding",
      "description": "Metabarcoding study of the Gulf of Mexico",
      "samples": [
        {
          "id": 1,
          "sample_id": "GOM-001",
          "collection_date": "2022-05-15",
          "location": "Gulf of Mexico"
        },
        {
          "id": 2,
          "sample_id": "GOM-002",
          "collection_date": "2022-05-16",
          "location": "Gulf of Mexico"
        }
      ]
    }
  ]
}`}
						/>
					</>
				)
			},
			{
				id: "with-filtering",
				title: "With Filtering",
				content: (
					<>
						<p className="mb-4">
							Example URL: <InlineCode code="/api/project?project_name=Test&institution=University" />
						</p>

						<p className="mb-4">
							This query returns projects where the project_name contains "Test" AND the institution contains
							"University".
						</p>

						<p className="mb-4">Example Response:</p>

						<CodeBlock
							language="json"
							code={`{
  "message": "Success",
  "result": [
    {
      "id": 10,
      "project_name": "Test Project",
      "description": "A test project",
      "institution": "University of Marine Science"
    }
  ]
}`}
						/>
					</>
				)
			},
			{
				id: "combined-parameters",
				title: "Combined Parameters",
				content: (
					<>
						<p className="mb-4">
							Example URL: <InlineCode code="/api/project?fields=id,project_name&relations=samples&limit=5" />
						</p>

						<p className="mb-4">This query combines field selection, relations, and a result limit.</p>

						<p className="mb-4">Example Response:</p>

						<CodeBlock
							language="json"
							code={`{
  "message": "Success",
  "result": [
    {
      "id": 1,
      "project_name": "Gulf of Mexico Metabarcoding",
      "samples": [
        { "id": 1 },
        { "id": 2 }
      ]
    },
    {
      "id": 2,
      "project_name": "Atlantic Coastal eDNA Survey",
      "samples": [
        { "id": 3 },
        { "id": 4 }
      ]
    }
  ]
}`}
						/>
					</>
				)
			},
			{
				id: "single-record",
				title: "Single Record",
				content: (
					<>
						<p className="mb-4">
							Example URL: <InlineCode code="/api/project/5?fields=id,project_name&relations=samples" />
						</p>

						<p className="mb-4">
							This query retrieves a single project by ID, with selected fields and related samples.
						</p>

						<p className="mb-4">Example Response:</p>

						<CodeBlock
							language="json"
							code={`{
  "message": "Success",
  "result": {
    "id": 5,
    "project_name": "Caribbean Coral Microbiome Study",
    "samples": [
      { "id": 15 },
      { "id": 16 },
      { "id": 17 }
    ]
  }
}`}
						/>
					</>
				)
			}
		]
	},
	{
		id: "response-format",
		title: "Response Format",
		content: (
			<>
				<p className="mb-4">
					This section explains the structure of API responses so you can properly parse and use the returned data.
				</p>
			</>
		),
		subsections: [
			{
				id: "success-structure",
				title: "Success Structure",
				content: (
					<>
						<p className="mb-4">Successful API responses have a consistent structure:</p>

						<div className="bg-base-200 p-3 rounded-md font-mono text-sm mb-4 inline-block min-w-[200px] max-w-full">
							{`{
  "message": "Success",
  "result": [
    // Array of results or single object
  ]
}`}
						</div>

						<p className="mb-4">
							The <code className="px-1 py-0.5 bg-base-200 rounded">message</code> field will always contain "Success"
							for successful requests.
						</p>

						<p className="mb-4">
							The <code className="px-1 py-0.5 bg-base-200 rounded">result</code> field will contain either:
						</p>
						<ul className="list-disc ml-6 mb-4">
							<li>An array of objects (for multiple results)</li>
							<li>A single object (for single record requests)</li>
						</ul>

						<p className="mb-4">[Additional response format details coming soon]</p>
					</>
				)
			},
			{
				id: "error-structure",
				title: "Error Structure",
				content: (
					<>
						<p className="mb-4">Error responses follow this structure:</p>

						<div className="bg-base-200 p-3 rounded-md font-mono text-sm mb-4 inline-block min-w-[200px] max-w-full">
							{`{
  "message": "Error",
  "error": "Description of what went wrong"
}`}
						</div>

						<p className="mb-4">
							The <code className="px-1 py-0.5 bg-base-200 rounded">message</code> field will always contain "Error"
							when something goes wrong.
						</p>

						<p className="mb-4">
							The <code className="px-1 py-0.5 bg-base-200 rounded">error</code> field contains a human-readable
							description of the error.
						</p>

						<p className="mb-4">[Additional error response details coming soon]</p>
					</>
				)
			}
		]
	},
	{
		id: "faq",
		title: "FAQ",
		content: (
			<>
				<div className="space-y-6">
					<p className="mb-4">Frequently asked questions about using the NODE API.</p>

					<div>
						<h4 className="font-medium mb-2">Q: Do I need an API key to use the NODE API?</h4>
						<p>A: No, the NODE API is currently open and does not require authentication or API keys.</p>
					</div>

					<div>
						<h4 className="font-medium mb-2">Q: Are there rate limits for API usage?</h4>
						<p>
							A: While there are no strict rate limits currently in place, we ask that you be considerate with your API
							usage. For applications requiring high-volume requests, please contact us.
						</p>
					</div>

					<div>
						<h4 className="font-medium mb-2">Q: I'm not familiar with APIs. How do I get started?</h4>
						<p>
							A: An API (Application Programming Interface) allows computers to talk to each other. To use our API,
							you'll need to make HTTP requests to our endpoints. The simplest way to start is by pasting one of our
							example URLs into your browser's address bar to see the raw JSON response. For more advanced usage, you
							can use programming languages like Python, R, or JavaScript.
						</p>
					</div>

					<div>
						<h4 className="font-medium mb-2">Q: How do I report issues with the API?</h4>
						<p>A: Please submit any API issues through our GitHub repository's issue tracker.</p>
					</div>

					<div>
						<h4 className="font-medium mb-2">Q: How do I cite data obtained through the API?</h4>
						<p>
							A: Please cite the NODE platform and the specific projects from which you obtained data. Each project has
							citation information available through the web interface.
						</p>
					</div>
				</div>
			</>
		)
	}
];
