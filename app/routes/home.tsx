import type { Route } from "./+types/home";
import { HomePage } from "~/composables/homepage/homepage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "UniChatBot" },
    { name: "description", content: "University chatbot homepage" },
  ];
}

export default function Home() {
  return <HomePage />;
}
