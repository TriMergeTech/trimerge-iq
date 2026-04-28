import SignupClient from "./client";

export default async function Page({ searchParams }) {
  const params = await searchParams;

  return <SignupClient searchParams={params || null} />;
}
