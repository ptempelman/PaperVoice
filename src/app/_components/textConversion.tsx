"use client";

import { useUser } from '@clerk/nextjs';
import * as pdfjs from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
pdfjs.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.js';

import { useCallback, useRef, useState } from 'react';
import { api } from '~/trpc/react';

async function parsePdf(file: File) {
    const fileURL = URL.createObjectURL(file);
    const pdf = await pdfjs.getDocument(fileURL).promise;
    URL.revokeObjectURL(fileURL); // Clean up the URL object after use
    const numPages = pdf.numPages;
    const allText = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const textItems = textContent.items
            .filter((item): item is TextItem => (item as TextItem).str !== undefined)
            .map((item) => item.str);
        allText.push(textItems.join(' '));
    }

    return allText.join('\n');
}



export const PdfTextExtractor = () => {
    const { isLoaded: userLoaded, isSignedIn, user } = useUser();

    const [textToConvert, setTextToConvert] = useState<string>('');

    const [audioSrc, setAudioSrc] = useState('');

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file) { // Check if 'file' is not undefined
                setIsLoading(true); // Set loading state to true
                try {
                    const text = await parsePdf(file); // 'file' is guaranteed to be not undefined here
                    setTextToConvert(text);
                } catch (error) {
                    console.error('Error parsing PDF:', error);
                    setTextToConvert(''); // Reset the text on error
                } finally {
                    setIsLoading(false); // Set loading state to false
                }
            }
        }
    };


    const handleDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file) { // Ensure file is not undefined before calling parsePdf
                setIsLoading(true);
                try {
                    // const text = await parsePdf(file);
                    const text = "hello test from pdf.js"
                    setTextToConvert(text);
                } catch (error) {
                    console.error('Error parsing PDF:', error);
                    setTextToConvert('');
                } finally {
                    setIsLoading(false);
                }
            }
        }
    }, []);



    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const handleDropAreaClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const convertTextToSpeechMutation = api.convert.convertTextToSpeech.useMutation();

    const { data: credits, refetch: refetchCredits } = api.user.credits.useQuery({ id: user?.id ?? "" });
    const creditsRemaining = credits?.credits ?? 0;

    // When the subtractCreditMutation is used, we also refetch the credits remaining
    const subtractCreditMutation = api.user.subtractCredits.useMutation({
        onSuccess: () => {
            void refetchCredits();
        },
    })


    const convertTextToSpeech = async () => {

        if (!user) {
            console.log("User not signed in")
            return;
        }

        if ((textToConvert.length / 100) < creditsRemaining) {
            console.log("Not enough credits")
            return;
        }

        await subtractCreditMutation.mutateAsync({ id: user.id, amount: textToConvert.length / 100 });

        const shortenedText = textToConvert.slice(0, 100);
        console.log(shortenedText)

        convertTextToSpeechMutation.mutate({ text: shortenedText }, {
            onSuccess: (data) => {
                // Handle success, `data` contains the mutation result
                if (data.audio) {
                    // Convert the Base64 string back to binary and create an audio source
                    const binaryStr = window.atob(data.audio);
                    const len = binaryStr.length;
                    const bytes = new Uint8Array(len);
                    for (let i = 0; i < len; i++) {
                        bytes[i] = binaryStr.charCodeAt(i);
                    }
                    const blob = new Blob([bytes], { type: 'audio/mp3' }); // Adjust the MIME type if necessary
                    const audioUrl = URL.createObjectURL(blob);
                    // Assuming setAudioSrc is a useState hook to set the audio source
                    setAudioSrc(audioUrl);
                }
            },
            onError: (error) => {
                // Handle error
                console.error('Error converting text to speech:', error);
            }
        });
    };

    return (
        <div className="flex flex-col items-center justify-center">

            {/* Resizable text input */}
            <textarea
                className="resize border rounded-md p-4 mb-4 w-full text-gray-700"
                placeholder="Enter text here or upload a PDF below..."
                value={textToConvert}
                onChange={(e) => setTextToConvert(e.target.value)}
            ></textarea>

            {/* Buttons container */}
            <div className="flex items-center mb-4">
                <p className='mr-4'>Cost: {textToConvert.length / 100} credits</p>
                {/* <button onClick={() => window.location.href = 'https://buy.stripe.com/dR66qh5eF83lbh6aEJ'} className='border-2 border-dashed rounded-md p-1'>Buy Credits</button> */}
                <button onClick={() => window.location.href = 'https://buy.stripe.com/test_4gwdU44dNbz75UY9AE'} className='border-2 border-dashed rounded-md p-1'>Buy Credits</button>
            </div>
            <div className="flex justify-center items-center gap-4 mb-4">
                <div
                    onClick={handleDropAreaClick}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="flex justify-center items-center border-2 border-dashed rounded-md cursor-pointer p-2"
                    style={{ cursor: 'pointer' }}
                >
                    Upload PDF
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        onClick={(e) => e.stopPropagation()} // Prevent click from propagating to parent
                    />
                </div>
                <button
                    className="border-2 rounded-md p-2 bg-black text-white hover:bg-gray-400 hover:text-black transition-colors"
                    onClick={convertTextToSpeech}
                >
                    Generate Speech
                </button>
            </div>

            {/* Loading indicator and audio player */}
            {isLoading && <p>Loading...</p>}
            {audioSrc && (
                <audio controls src={audioSrc}>
                    Your browser does not support the audio element.
                </audio>
            )}
        </div>

    );
};
