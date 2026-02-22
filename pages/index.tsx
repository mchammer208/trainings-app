import type { NextPage } from "next";
import Link from "next/link";
import { Layout } from "../components/Layout";

const HomePage: NextPage = () => {
  return (
    <Layout>
      <h2>Start</h2>
      <p>Willkommen in der Trainingsentscheidungs-App.</p>
      <ul>
        <li>
          <Link href="/checkin">Zum Check-in</Link>
        </li>
        <li>
          <Link href="/decision">Zur Entscheidung</Link>
        </li>
      </ul>
    </Layout>
  );
};

export default HomePage;
