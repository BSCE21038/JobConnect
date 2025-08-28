import Link from "next/link";

export default function Home() {
  return (
    <>
      <h1>JobConnect</h1>
      <p>Job portal - Smart Job & Talent Portal</p>
      <Link href="/jobs" className="link-btn">
        Browse jobs →
      </Link>
    </>
  );
}
