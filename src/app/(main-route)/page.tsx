import Link from "next/link";

export default function Home() {
  return (
    <div className="h-[70vh] bg-[url()]">
      <h1>HELLO WORD</h1>
      <Link href={"/about"}>About</Link>
    </div>
  );
}
