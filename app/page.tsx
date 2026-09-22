import { redirect } from "next/navigation";

/**
 * Marketing sahifasi yo'q — bu ichki analitika paneli. Ildiz manzil to'g'ridan
 * to'g'ri boshqaruv paneliga olib boradi (sessiyasi bo'lmasa middleware login
 * sahifasiga yo'naltiradi).
 */
export default function Home() {
  redirect("/dashboard");
}
