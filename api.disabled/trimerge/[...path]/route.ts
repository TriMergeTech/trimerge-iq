import { NextRequest, NextResponse } from "next/server";

const DEFAULT_PROJECTS_API_BASE_URL = "https://trimerge-iq.onrender.com";

type RouteContext = {
  params: {
    path?: string[];
  };
};

function buildUpstreamUrl(pathSegments: string[], search: string) {
  const baseUrl = (process.env.TRIMERGE_PROJECTS_API_BASE_URL ?? DEFAULT_PROJECTS_API_BASE_URL).replace(/\/+$/, "");
  const path = pathSegments.map(encodeURIComponent).join("/");
  return `${baseUrl}/${path}${search}`;
}

async function proxyProjectsRequest(request: NextRequest, context: RouteContext) {
  const upstreamUrl = buildUpstreamUrl(context.params.path ?? [], request.nextUrl.search);
  const authorization = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");
  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.text();

  const upstreamResponse = await fetch(upstreamUrl, {
    method: request.method,
    headers: {
      ...(contentType ? { "Content-Type": contentType } : {}),
      ...(authorization ? { Authorization: authorization } : {}),
    },
    body,
    cache: "no-store",
  });

  const responseBody = upstreamResponse.status === 204 ? null : await upstreamResponse.text();
  const responseHeaders = new Headers();
  const upstreamContentType = upstreamResponse.headers.get("content-type");

  if (upstreamContentType) {
    responseHeaders.set("Content-Type", upstreamContentType);
  }

  return new NextResponse(responseBody, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyProjectsRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyProjectsRequest(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyProjectsRequest(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyProjectsRequest(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyProjectsRequest(request, context);
}
