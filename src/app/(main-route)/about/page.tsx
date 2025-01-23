import Spotlight from "@/src/components/spotLight";
import Link from "next/link";

export default function About() {
  return (
    <div className="h-screen lg:mx-36   mx-5 max-w-full  pt-44 pb-8 flex flex-col gap-20 overflow-hidden px-5">
      <h1>About Us</h1>
      <Spotlight />
      <p>
        Welcome to the About page. Here you can learn more about our mission and
        values.
      </p>
      <Link href="/">Go back to Home</Link>
    </div>
  );
}
