import { ClerkProvider } from '@clerk/nextjs';
import { unstable_noStore as noStore } from "next/cache";
import { MainPanel } from "./_components/textToSpeech";
import { TopBar } from './_components/topBar';


export default async function Home() {
  noStore();
  // const hello = await api.post.hello.query({ text: "from tRPC" });
  // bg-gradient-to-b from-[#141414] to-[#787878] text-white">
  return (
    <ClerkProvider>
      <main className="flex min-h-screen flex-col items-center bg-gray-300">
        <div className="mt-20 h-30">
          <TopBar />
        </div>
        <div className="flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <MainPanel />
          <div className="bg-black text-white shadow-xl drop-shadow-xl p-2">P a p e r / V o i c e </div>
        </div>
      </main>
    </ClerkProvider >
  );
}