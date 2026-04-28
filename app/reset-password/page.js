import ResetClient from "./client";

export default async function Page({ searchParams }) {
  const params = await searchParams;

  return <ResetClient searchParams={params || null} />;
}
