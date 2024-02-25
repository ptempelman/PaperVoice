import { ClerkProvider } from '@clerk/nextjs';
import { unstable_noStore as noStore } from "next/cache";
import { PdfTextExtractor } from "./_components/textConversion";
import { TopBar } from './_components/topBar';


export default async function Home() {
  noStore();
  // const hello = await api.post.hello.query({ text: "from tRPC" });

  return (
    <ClerkProvider>
      <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#141414] to-[#787878] text-white">
        <div className="mt-20 h-30">
          <TopBar />
        </div>
        <div className="flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <PdfTextExtractor />
        </div>
      </main>
    </ClerkProvider >
  );
}