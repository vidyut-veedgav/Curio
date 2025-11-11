import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>curio</h1>
        <p className={styles.subtitle}>frontend coming soon</p>
      </main>
    </div>
  );
}
