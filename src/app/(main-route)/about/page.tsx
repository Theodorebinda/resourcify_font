import Link from "next/link";

export default function About() {
  return (
    <div className="hidden">
      <h1>About Us</h1>
      <p>
        Welcome to the About page. Here you can learn more about our mission and
        values.
      </p>
      <Link href="/">Go back to Home</Link>
    </div>
  );
}
