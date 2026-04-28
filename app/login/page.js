import LoginClient from "./client";

export default async function Page({ searchParams }) {
  const params = await searchParams;

  return <LoginClient searchParams={params || null} />;
}
