export type AppRoute = {
  href: string;
  label: string;
  ariaLabel?: string;
};

export const appRoutes: AppRoute[] = [
  {
    href: "/",
    label: "Home",
    ariaLabel: "Go to home page",
  },
  {
    href: "/?createUser=true",
    label: "New user",
    ariaLabel: "Create user form",
  },
  {
    href: "/login",
    label: "Login",
    ariaLabel: "Open login page",
  },
  {
    href: "/logout",
    label: "Logout",
    ariaLabel: "Log out from the application",
  },
];
