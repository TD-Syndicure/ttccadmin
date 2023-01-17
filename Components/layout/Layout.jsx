import React from "react";
import styles from "../../styles/Background.module.css";
import { useRouter } from "next/router";

export default function Layout({ children }) {

  const { pathname } = useRouter();
  if (pathname === '/') {
    styles.landing = styles.gallery;
  }
  if (pathname === '/home') {
    styles.landing = styles.gallery;
  }
  if (pathname === '/admin/inventory' || '/admin/fix') {
    styles.landing = styles.gallery;
  }

 
  return (
    <main className={styles.landing} style={{height: "100vh"}}>
      <div className="body z-[1200]">
        <main className="p-0 flex justify-center">{children}</main>
      </div>
    </main>
  );
}
