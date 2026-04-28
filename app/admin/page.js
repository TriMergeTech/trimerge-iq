import AdminClient from "./client";

export default async function Page({ searchParams }) {
  const params = await searchParams;

  return <AdminClient searchParams={params || null} />;
}
