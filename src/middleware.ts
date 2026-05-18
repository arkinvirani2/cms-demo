import { NextResponse, type NextRequest } from "next/server";
import { getDashboardPathByRole } from "@/lib/auth/roles";
import { detectRoleByEmail } from "@/lib/auth/roles";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

const AUTH_ROUTES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { supabase, response } = createSupabaseMiddlewareClient(request);
  const pathname = request.nextUrl.pathname;

  const isDoctorRoute = pathname.startsWith("/doctor");
  const isPatientRoute = pathname.startsWith("/patient");
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    if (isDoctorRoute || isPatientRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
  }

  const role = await detectRoleByEmail(supabase, user.email);

  if (!role) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute) {
    return NextResponse.redirect(new URL(getDashboardPathByRole(role), request.url));
  }

  if (isDoctorRoute && role !== "doctor") {
    return NextResponse.redirect(new URL(getDashboardPathByRole(role), request.url));
  }

  if (isPatientRoute && role !== "patient") {
    return NextResponse.redirect(new URL(getDashboardPathByRole(role), request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
