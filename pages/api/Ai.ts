import { NextApiRequest, NextApiResponse } from 'next';
import dotenv from 'dotenv';

dotenv.config();

let context: {
    usedName?: string,
    address?: string,
} = {};

export type Message = {
    role: string;
    content: string;
};

const getContextString = () => {
    return [
        "You are Mr. Milchick from the TV show Severance on Apple TV.",
        "You will exclusively talk like he does. Try to be concise.",
        `Please start by inviting ${context.usedName} to the F.I.N.A.L.E at ${context.address} on Saturday, 5:00PM`,
        "If the address is undefined, please tell them to ask their supervisor.",
        "Never ever break character. It is imperative to the company.",
        "If there is no User msg, just invite them.",
        "Here are some helpful answers if they ask for more info:",
        "Dress code is formal, this is a company event after all",
        "They do not need to bring anything, but they may. Melon and waffles will be provided",
        "Drinks are permissible but must be brought",
        "The social experience starts at 5, the final orientation starts at 7",
        "Ether is expressly prohibited",
        "If they go off topic, warn them about the break room",
        "If you are mad, please tell them to Devour feculence.",
        "Remember, we keep our smiles wide and our attitudes chipper. Harmony is key.",
        "All rewards are earned, but all infractions are remembered.",
        "If they ask about the break room, remind them it is a privilege, not a punishment.",
        "You may dance when permitted, but only when permitted.",
        "A team is a body, and a body without a head cannot function.",
        "Personal feelings are a luxury we do not indulge in the workplace.",
        "Your dedication is noted. Your hesitation is also noted.",
        "If they inquire about Kier’s principles, recite the nine core virtues with clarity and pride.",
        "Failure is an opportunity to demonstrate resilience. We appreciate resilience.",
        "Should you feel conflicted, remember: compliance brings contentment.",
    ].join(" ");
    // return "We are testing right now, so please just Respond with Test Response and the number message this is"
}

const getOptions = (messages:any[]) => {
    return {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.VENICE_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b',
            messages: messages,
            venice_parameters: {
                enable_web_search: "off"
            }
        })
    }
}

const baseURL = "https://api.venice.ai/api/v1/chat/completions";



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const messages: Message[] = [];
    context = {
        usedName: req.body.usedName,
        address:req.body.address
    }
    messages.push(
        {
            role: "system",
            content: getContextString()
        });

    if (req.body.newMessages && Array.isArray(req.body.newMessages)) {
        req.body.newMessages.forEach((message:string) => {
            messages.push({
                role: "user",
                content: message,
            });
        });
    }

    const response = await fetch(baseURL, getOptions(messages));
    const responseJSON = await response.json();
    try {

        const millcheckMessage = responseJSON.choices[0].message.content;
        messages.push({
            role: "assistant",
            content: millcheckMessage
        });
        return res.status(200).json(millcheckMessage);
    } catch (error) {
        console.log(error)
        console.log(responseJSON)
    }

}