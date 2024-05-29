import React from "react";
import TiktokIcon from "~/components/icons/TiktokIcon";
import YoutubeIcon from "~/components/icons/YoutubeIcon";

interface NavigationItem {
  name: string;
  href: string;
  icon?: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
}

const navigation: {
  main: NavigationItem[];
  social: NavigationItem[];
} = {
  main: [
    { name: "Support", href: "/support" },
    { name: "Downloads", href: "/downloads" },
    { name: "Sign In", href: "/sign-in" },
    { name: "Sign Up", href: "/sign-up" },
  ],
  social: [
    {
      name: "YouTube",
      href: "https://www.youtube.com/@playportalapp",
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <YoutubeIcon {...props} fill="currentColor" />
      ),
    },
    {
      name: "TikTok",
      href: "https://www.tiktok.com/@playportal.app",
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <TiktokIcon fill="currentColor" {...props} />
      ),
    },
  ],
};

const Footer: React.FC = () => {
  return (
    <footer className="w-full">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap justify-center">
          {navigation.main.map((item) => (
            <div key={item.name} className="px-5 py-2">
              <a
                href={item.href}
                className="text-sm text-gray-100 hover:text-gray-400 dark:text-gray-100"
              >
                {item.name}
              </a>
            </div>
          ))}
        </nav>
        <div className="mt-5 flex justify-center space-x-6">
          {navigation.social.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className=" text-gray-100 hover:text-gray-400"
            >
              <span className="sr-only">{item.name}</span>
              {item.icon && (
                <item.icon className="h-5 w-5" aria-hidden="true" />
              )}
            </a>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-gray-100">
          &copy; {new Date().getFullYear()} Playportal. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
