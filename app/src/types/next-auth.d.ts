import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      managerId: string;
      agencyId: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    agencyId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    managerId?: string;
    agencyId?: string;
  }
}
