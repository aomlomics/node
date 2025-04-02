import { apiSections } from "@/app/components/help/ApiSections";
import { ActiveSectionTracker } from "@/app/components/help/ActiveSectionTracker";

export default function API() {
	return (
		<div className="flex min-h-screen">
			{/* Invisible component that handles scroll tracking */}
			<ActiveSectionTracker />

			{/* Sidebar navigation - Add min-width to prevent squishing */}
			<aside className="w-64 min-w-[16rem] border-r border-base-300 pt-9 p-6 sticky top-0 h-screen overflow-y-auto">
				<nav>
					<h2 className="text-xl mb-6 px-2">Contents</h2>
					<ul className="space-y-5">
						{/* Map through sections to generate navigation */}
						{apiSections.map((section, index) => (
							<li key={section.id} className="mb-1">
								<a
									href={`#${section.id}`}
									className="block py-1 px-2 hover:text-primary transition-colors main-section-link"
									data-section-index={index}
								>
									{section.title}
								</a>

								{/* Render subsection navigation if they exist */}
								{section.subsections && section.subsections.length > 0 && (
									<ul className="mt-2 mb-1 ml-2 space-y-1 border-l border-base-300 pl-2">
										{section.subsections.map((subsection) => (
											<li key={subsection.id}>
												<a
													href={`#${subsection.id}`}
													className="block py-1 px-2 text-sm hover:text-primary transition-colors"
												>
													{subsection.title}
												</a>
											</li>
										))}
									</ul>
								)}
							</li>
						))}
					</ul>
				</nav>
			</aside>

			{/* Main content area - Add overflow handling */}
			<main className="flex-1 p-6 md:p-8 overflow-x-auto">
				{/* Map through sections to generate content */}
				{apiSections.map((section, index) => (
					<section key={section.id} id={section.id} data-section-index={index} className="mb-24">
						<h2 className="text-3xl font-semibold text-primary mb-6">{section.title}</h2>
						<div className="prose max-w-none">{section.content}</div>

						{/* Render subsections if they exist */}
						{section.subsections && section.subsections.length > 0 && (
							<div className="space-y-12 mt-8">
								{section.subsections.map((subsection) => (
									<div key={subsection.id} id={subsection.id}>
										<h3 className="text-2xl font-semibold text-base-content mb-4">{subsection.title}</h3>
										<div className="prose max-w-none">{subsection.content}</div>
									</div>
								))}
							</div>
						)}
					</section>
				))}
			</main>
		</div>
	);
}
