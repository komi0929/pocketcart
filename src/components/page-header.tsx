type Props = {
	title: string;
	description?: string;
	actions?: React.ReactNode;
	className?: string;
};

export function PageHeader({ title, description, actions, className }: Props) {
	return (
		<div className={`flex flex-col gap-2 border-b bg-card px-6 py-5 ${className ?? ""}`}>
			<div className="mx-auto flex w-full max-w-6xl items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
					{description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
				</div>
				{actions && <div className="flex items-center gap-2">{actions}</div>}
			</div>
		</div>
	);
}




