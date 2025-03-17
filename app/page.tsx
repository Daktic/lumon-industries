"use client";

import { useState, useRef, useEffect } from "react";
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
    const address = searchParams?.get('address');

    let usedName = "New Employee";
    if (first && last) {
        usedName = `${first[0].toUpperCase() + first.slice(1).toLowerCase()} ${last[0].toUpperCase()}`
    }

    let greeting = "Hello new Employee!";
    if (first && last) {
        greeting = `Hello, ${usedName}.`;
    }

    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    const [dialogBox, setDialogBox] = useState([{
        sender: senderType.BOT,
        textValue: greeting
    }]);
    const [displayedText, setDisplayedText] = useState("");
    const [inputValue, setInputValue] = useState("");

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
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
        setDialogBox((prevDialogBox) => [...prevDialogBox, { sender: senderType.BOT, textValue: result }]);
    };

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            handleUserInteraction(inputValue);
            setInputValue("");
        }
    }

    useEffect(() => {
        const text = dialogBox[0].textValue;
        let index = 0;

        const interval = setInterval(() => {
            setDisplayedText((prev) => prev + text[index]);
            index++;
            if (index === text.length) {
                clearInterval(interval);
            }
        }, 100); // Adjust the interval time to control typing speed

        return () => clearInterval(interval);
    }, []);

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
                body: JSON.stringify({ usedName }),
            });
            const result = await response.json();
            const resultInteraction: interaction = { sender: senderType.BOT, textValue: result };
            setDialogBox((prevDialogBox) => [...prevDialogBox, resultInteraction]);
        }

        fetchData();
    }, []);

    return (
        <div className="background-image">
            <audio ref={audioRef} src="/SeverencePiano.mp3" loop autoPlay>
                Your browser does not support the audio element.
            </audio>
            <div className="interactive-box">
                {dialogBox.map((interaction, index) => (
                    <p key={index} className={interaction.sender === senderType.USER ? 'USER' : 'BOT'}>{interaction.textValue}</p>
                ))}
            </div>
            <div className="input-box">
                <div className="input-wrapper">
                    <input value={inputValue} onChange={handleInputChange} onKeyDown={handleKeyDown}/>
                    <span className="blinking-cursor">&lt;</span>
                </div>
            </div>
            <button onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
        </div>
    );
}