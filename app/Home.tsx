"use client";

import { useState, useRef, useEffect, RefObject } from "react";
import { useSearchParams } from 'next/navigation';

type interaction = {
    sender: senderType;
    textValue: string;
}

enum senderType {
    USER,
    BOT
}

export default function Home() {
    const searchParams = useSearchParams();
    const first = searchParams?.get('first');
    const last = searchParams?.get('last');
    const rawAddress = searchParams?.get('address');
    const address = decodeURIComponent(rawAddress || "");

    let usedName = "New Employee";
    if (first && last) {
        usedName = `${first[0].toUpperCase() + first.slice(1).toLowerCase()} ${last[0].toUpperCase()}`
    }

    const [isPlaying, setIsPlaying] = useState(false);
    const [isManuallyStopped, setIsManuallyStopped] = useState(false);
    const audioRef: RefObject<HTMLAudioElement | null> = useRef(null);
    const interactiveBoxRef: RefObject<HTMLDivElement | null> = useRef(null);

    const [dialogBox, setDialogBox] = useState<interaction[]>([]);
    const [displayedText, setDisplayedText] = useState("");
    const [inputValue, setInputValue] = useState("");

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsManuallyStopped(true);
        } else {
            audioRef.current.play();
            setIsManuallyStopped(false);
        }
        setIsPlaying(!isPlaying);
    };

    const handleUserInteraction = async (userText: string) => {
        const userInteraction: interaction = { sender: senderType.USER, textValue: userText };
        setDialogBox((prevDialogBox) => [...prevDialogBox, userInteraction]);

        const response = await fetch('/api/Ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newMessage: userText }),
        });

        const result = await response.json();
        const resultText = result;

        let currentIndex = 0;
        const intervalId = setInterval(() => {
            if (currentIndex < resultText.length) {
                setDialogBox((prevDialogBox) => {
                    const updatedDialogBox = [...prevDialogBox];
                    const currentText = resultText.substring(0, currentIndex + 1);
                    // If there's no last BOT message, add one.
                    if (
                        updatedDialogBox.length === 0 ||
                        updatedDialogBox[updatedDialogBox.length - 1].sender !== senderType.BOT
                    ) {
                        updatedDialogBox.push({ sender: senderType.BOT, textValue: currentText });
                    } else {
                        // Otherwise, update the last BOT message.
                        updatedDialogBox[updatedDialogBox.length - 1].textValue = currentText;
                    }
                    return updatedDialogBox;
                });
                currentIndex++;
            } else {
                clearInterval(intervalId);
            }
        }, 10); // Adjust the interval time as needed
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
        if (!isPlaying && audioRef.current && !isManuallyStopped) {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleUserInteraction(inputValue);
            setInputValue("");
        }
    }

    useEffect(() => {
        if (dialogBox.length > 1) {
            const newInteraction = dialogBox[dialogBox.length - 1].textValue;
            setDisplayedText((prev) => prev + "\n" + newInteraction);
        }
    }, [dialogBox]);

    useEffect(() => {
        async function fetchData() {
            const response = await fetch('/api/Ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usedName, address }),
            });
            const result = await response.json();
            const resultText = result;

            let currentIndex = 0;
            const intervalId = setInterval(() => {
                setDialogBox((prevDialogBox) => {
                    const updatedDialogBox = [...prevDialogBox];
                    const currentText = resultText.substring(0, currentIndex + 1);
                    // If there's no last BOT message, add one.
                    if (
                        updatedDialogBox.length === 0 ||
                        updatedDialogBox[updatedDialogBox.length - 1].sender !== senderType.BOT
                    ) {
                        updatedDialogBox.push({ sender: senderType.BOT, textValue: currentText });
                    } else {
                        // Otherwise, update the last BOT message.
                        updatedDialogBox[updatedDialogBox.length - 1].textValue = currentText;
                    }
                    return updatedDialogBox;
                });
                currentIndex++;
                if (currentIndex >= resultText.length) {
                    clearInterval(intervalId);
                }
            }, 20); // Adjust the interval time as needed
        }

        fetchData();
    }, []);

    useEffect(() => {
        if (interactiveBoxRef.current) {
            interactiveBoxRef.current.scrollTop = interactiveBoxRef.current.scrollHeight;
        }
    }, [dialogBox]);

    return (
        <div className="background-image">
            <audio ref={audioRef} src="/SeverencePiano.mp3" loop>
                Your browser does not support the audio element.
            </audio>
            <div className="interactive-box" ref={interactiveBoxRef}>
                {dialogBox.map((interaction, index) => (
                    <p key={index} className={interaction.sender === senderType.USER ? 'USER' : 'BOT'}>
                        {interaction.sender === senderType.BOT ? `Mr. Milchick: ${interaction.textValue}` : interaction.textValue}
                    </p>
                ))}
            </div>
            <div className="input-box">
                <div className="input-wrapper">
                    <input value={inputValue} onChange={handleInputChange} onKeyDown={handleKeyDown}/>
                    <span className="blinking-cursor">&lt;</span>
                </div>
            </div>
            <button className={"music-exp"} onClick={togglePlay}>{isPlaying ? 'Stop the Music Experience' : 'Resume the Music Experience'}</button>
        </div>
    );
}