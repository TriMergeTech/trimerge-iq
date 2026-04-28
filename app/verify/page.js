import VerifyClient from "./client";

export default async function Page({ searchParams }) {
  const params = await searchParams;

  return <VerifyClient searchParams={params || null} />;
}
