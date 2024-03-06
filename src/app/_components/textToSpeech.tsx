"use client";

import { useUser } from '@clerk/nextjs';

import { Snackbar } from "@mui/material";
import { useCallback, useRef, useState } from 'react';
import { parsePdf } from '~/app/api/parsePdf';
import { api } from '~/trpc/react';
import { LoadingBar } from './loadingBar';


export const MainPanel = () => {
    const { isLoaded: userLoaded, isSignedIn, user } = useUser();

    const [popupText, setPopupText] = useState('');
    const [popupOpen, openPopup] = useState(false);
    const handleOpenPopup = (text: string) => {
        setPopupText(text);
        openPopup(true);
    };
    const handleClosePopup = (event: React.SyntheticEvent | Event, reason?: string) => {
        openPopup(false);
    };

    const [textToConvert, setTextToConvert] = useState<string>('');

    const [audioSrc, setAudioSrc] = useState('');

    const [isConvertClicked, setIsConvertClicked] = useState(false);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file) { // Check if 'file' is not undefined
                setIsLoading(true); // Set loading state to true
                try {
                    const text = await parsePdf(file);
                    setTextToConvert(text);
                } catch (error) {
                    console.error('Error parsing PDF:', error);
                    setTextToConvert('');
                } finally {
                    setIsLoading(false);
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
                    const text = await parsePdf(file);
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

    const subtractCreditMutation = api.user.subtractCredits.useMutation({
        onSuccess: () => {
            void refetchCredits();
        },
    })

    const handleBuyCredits = () => {
        if (!user) {
            console.log("User not signed in")
            handleOpenPopup("You must be signed in to buy credits");
            return;
        }
        // window.location.href = 'https://buy.stripe.com/test_4gwdU44dNbz75UY9AE';
        window.location.href = 'https://buy.stripe.com/dR66qh5eF83lbh6aEJ'; // Production
    }


    const convertTextToSpeech = async () => {
        if (textToConvert.length === 0) {
            handleOpenPopup("Please enter some text first");
            return;
        }

        if (!user) {
            console.log("User not signed in")
            handleOpenPopup("Sign in for 100 free credits");
            return;
        }
        setIsConvertClicked(true);

        console.log("Credits", (textToConvert.length / 100), creditsRemaining)
        if ((textToConvert.length / 100) > creditsRemaining) {
            console.log("Not enough credits")
            handleOpenPopup("You do not have enough credits");
            return;
        }

        await subtractCreditMutation.mutateAsync({ id: user.id, amount: textToConvert.length / 100 });

        convertTextToSpeechMutation.mutate({ text: textToConvert }, {
            onSuccess: (data) => {

                if (data.audio) {
                    // Convert the Base64 string back to binary and create an audio source
                    const binaryStr = window.atob(data.audio);
                    const len = binaryStr.length;
                    const bytes = new Uint8Array(len);
                    for (let i = 0; i < len; i++) {
                        bytes[i] = binaryStr.charCodeAt(i);
                    }
                    const blob = new Blob([bytes], { type: 'audio/mp3' });
                    const audioUrl = URL.createObjectURL(blob);

                    setAudioSrc(audioUrl);
                    setIsConvertClicked(false);
                }
            },
            onError: (error) => {
                // Handle error
                console.error('Error converting text to speech:', error);
                handleOpenPopup("Something went wrong..");
                setIsConvertClicked(false);
            }
        });
    };

    return (
        <div className="flex flex-col items-center justify-center bg-[#D9E4DD]/30 backdrop-blur-lg rounded-lg p-6 border border-gray-200/50 shadow-xl">

            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}>
                <textarea
                    className="resize border rounded-md p-4 mb-4 w-full text-gray-700 bg-white/30 backdrop-blur-md border-gray-300 shadow-xl"
                    placeholder="Enter text here or drag in a PDF file..."
                    value={textToConvert}
                    onChange={(e) => setTextToConvert(e.target.value)}
                ></textarea>
            </div>

            <div className="flex items-center mb-4">
                <p className='mr-2 rounded-md p-2'>Cost: {textToConvert.length / 100} credits</p>
                <button onClick={() => handleBuyCredits()} className='ml-2 rounded-md p-2 hover:bg-white/50 hover:text-black transition-colors bg-white/30 backdrop-blur-md shadow-md'>
                    Buy Credits
                </button>
            </div>
            <div className="flex justify-center items-center gap-4 mt-8 mb-4">
                <div
                    onClick={handleDropAreaClick}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="flex justify-center items-center rounded-md cursor-pointer p-2 hover:bg-white/50 hover:text-black transition-colors bg-white/30 backdrop-blur-md shadow-md"
                    style={{ cursor: 'pointer' }}
                >
                    Upload PDF
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
                <button
                    className="rounded-md p-2 bg-gray-800 text-white hover:bg-black transition-colors shadow-xl"
                    onClick={convertTextToSpeech}
                >
                    Generate Speech
                </button>
            </div>

            {isLoading && <p className="bg-white/30 backdrop-blur-md rounded-md p-1">Loading...</p>}
            {isConvertClicked && isSignedIn && <LoadingBar duration={textToConvert.split(' ').length / 20} />}
            {audioSrc && (
                <audio controls src={audioSrc} className="mt-2">
                    Your browser does not support the audio element.
                </audio>
            )}
            <Snackbar
                open={popupOpen}
                autoHideDuration={4000}
                onClose={handleClosePopup}
                message={popupText}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                className="mt-20 backdrop-blur-md rounded-md shadow-xl text-gray-200"
            />
        </div>

    );
};
