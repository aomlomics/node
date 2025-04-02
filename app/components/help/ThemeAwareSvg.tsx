import Image from "next/image";
import { ImageProps } from "next/image";

interface ThemeAwareSvgProps extends Omit<ImageProps, "className" | "src"> {
	lightSrc: string;
	darkSrc: string;
	className?: string;
}

export default function ThemeAwareSvg(props: ThemeAwareSvgProps) {
	const { className = "", lightSrc, darkSrc, ...imageProps } = props;

	return (
		<div className="relative w-full h-full" style={{ backgroundColor: "inherit" }}>
			<Image
				{...imageProps}
				src={darkSrc}
				className={`
          absolute inset-0
          transition-opacity duration-200
          [html[data-theme='dark']_&]:opacity-100
          [html[data-theme='light']_&]:opacity-0
          ${className}
        `}
				style={{ backgroundColor: "transparent" }}
			/>
			<Image
				{...imageProps}
				src={lightSrc}
				className={`
          absolute inset-0
          transition-opacity duration-200
          [html[data-theme='dark']_&]:opacity-0
          [html[data-theme='light']_&]:opacity-100
          ${className}
        `}
				style={{ backgroundColor: "transparent" }}
			/>
		</div>
	);
}
