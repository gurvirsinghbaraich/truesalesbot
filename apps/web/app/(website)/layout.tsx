import Link from "next/link";

export default function MainWebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="mx-auto w-full max-w-7xl text-accent-white p-4 flex items-center justify-between">
        <div>
          <p>TrueSalesBot</p>
        </div>

        <div className="flex gap-4 items-center">
          <Link href="#pricing">Pricing</Link>
          <Link href="/login">
            <button className="bg-accent-white text-accent-background p-2 rounded-md">
              Login
            </button>
          </Link>
        </div>
      </header>
      <main className="flex flex-grow">{children}</main>
      <footer className="text-accent-white p-4 max-w-7xl mx-auto w-full">
        <p>Copyright © 2024 TrueSalesBot.</p>
      </footer>
    </>
  );
}
