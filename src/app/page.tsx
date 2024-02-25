import { unstable_noStore as noStore } from "next/cache";
import { PdfTextExtractor } from "./_components/pdf-dropzone";


export default async function Home() {
  noStore();
  // const hello = await api.post.hello.query({ text: "from tRPC" });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#141414] to-[#787878] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        {/* <div className="border-solid border-white border-2 rounded-md">
          <h1 className="text-xl font-bold">Upload PDF</h1>
        </div> */}
        <PdfTextExtractor />

      </div>
    </main>
  );
}