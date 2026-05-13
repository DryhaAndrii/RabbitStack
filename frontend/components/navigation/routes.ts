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
    href: "/users",
    label: "Users",
    ariaLabel: "Go to users page",
  },
  {
    href:"/createUser",
    label:"New user",
    ariaLabel:"Create user form"
  }
];
