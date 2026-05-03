type PublicPagePlaceholderProps = {
    title: string;
};

export function PublicPagePlaceholder({ title }: PublicPagePlaceholderProps) {
    return (
        <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-zinc-950 sm:text-4xl">{title}</h1>
        </main>
    );
}
