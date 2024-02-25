"use client";

import * as pdfjs from 'pdfjs-dist';
pdfjs.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.js';

import axios from 'axios';
import { useCallback, useRef, useState } from 'react';

async function parsePdf(file: File) {
    const fileURL = URL.createObjectURL(file);
    const pdf = await pdfjs.getDocument(fileURL).promise;
    URL.revokeObjectURL(fileURL); // Clean up the URL object after use
    const numPages = pdf.numPages;
    const allText = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const textItems = textContent.items.map(item => ((item as any).str));
        allText.push(textItems.join(' '));
    }

    return allText.join('\n');
}



export const PdfTextExtractor = () => {
    const [pdfText, setPdfText] = useState<string>('');
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
                    setPdfText(text);
                } catch (error) {
                    console.error('Error parsing PDF:', error);
                    setPdfText(''); // Reset the text on error
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
                    setPdfText(text);
                } catch (error) {
                    console.error('Error parsing PDF:', error);
                    setPdfText('');
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

    const convertTextToSpeech = async () => {
        const shotenedText = pdfText.slice(0, 100);

        try {
            const response = await axios.post('/api/convertTextToSpeech', { shotenedText }, { responseType: 'blob' });
            const url = URL.createObjectURL(new Blob([response.data], { type: 'audio/mpeg' }));
            setAudioSrc(url);
        } catch (error) {
            console.error('Error converting text to speech:', error);
        }
    };

    return (
        <div>
            <div
                onClick={handleDropAreaClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{ border: '2px dashed #ccc', padding: 20, cursor: 'pointer' }}
            >
                Drop PDF here or click to upload
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    onClick={(e) => e.stopPropagation()} // Prevent click from propagating to parent
                />
            </div>
            {isLoading && <p>Loading...</p>}
            <p>{pdfText}</p>
            <button onClick={convertTextToSpeech}>Convert to Speech</button>
            {audioSrc && <audio controls src={audioSrc}>Your browser does not support the audio element.</audio>}
        </div>
    );
};
