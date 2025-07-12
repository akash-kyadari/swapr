import "../styles/globals.css";
import Layout from "../components/Layout";
import useUserStore from "../store/useUserStore";
import useThemeStore from "../store/useThemeStore";
import { useEffect } from "react";
import { useRouter } from "next/router";
import ToastContainer from "../components/ToastContainer";

const protectedRoutes = ["/profile/edit"];

export default function App({ Component, pageProps }) {
  const { user, loading, init } = useUserStore();
  const router = useRouter();

  // Initialize user store on app load
  useEffect(() => {
    init();
    
    // Ensure theme class is set on initial load
    const { theme } = useThemeStore.getState();
    if (typeof document !== "undefined") {
      const html = document.documentElement;
      html.classList.add(theme);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Debug logging
    
    if (!loading && !user && protectedRoutes.includes(router.pathname)) {
      
      router.replace("/auth/login");
    }
  }, [user, loading, router.pathname]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );

  return (
    <Layout>
      <ToastContainer />
      <Component {...pageProps} />
    </Layout>
  );
}
