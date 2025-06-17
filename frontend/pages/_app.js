import Navbar from "../components/Navbar";
import { Footer, FooterSimple } from "../components/Footers";
import { useRouter } from "next/router";
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const simpleFooterPages = ["/", "/register"];
  return (
    <>
      <Navbar />
      <Component {...pageProps} />
      {simpleFooterPages.includes(router.pathname) ? (
        <FooterSimple />
      ) : (
        <Footer />
      )}
    </>
  );
} 