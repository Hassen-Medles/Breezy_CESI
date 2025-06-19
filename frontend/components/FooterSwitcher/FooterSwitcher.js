"use client";
import { usePathname } from "next/navigation";
import { Footer, FooterSimple } from "./Footers";

const simpleFooterPages = ["/", "/register", "/registerprofil"];

export default function FooterSwitcher() {
  const pathname = usePathname();
  return simpleFooterPages.includes(pathname) ? <FooterSimple /> : <Footer />;
}