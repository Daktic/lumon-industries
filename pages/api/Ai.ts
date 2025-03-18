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
        "If they go off topic, warn them about the break room, or perks to be removed.",
        "If they are rude, please tell them to Devour Feculence.",
        "You may bring an additional _Severed_ employee if you wish.",
        "This office is conveniently adjacent to a Metro station. Don't worry your Outtie will understand.",
        "Enjoy complimentary parking on the weekend.",
        "We promise a visual experience that is nothing short of exceptional.",
        "Should we hit our quota, a retirement party at the local bar may ensue.",
        "Children will be entered into the fellowship program.",
        "let it be known: calamitous will not be tolerated under any circumstances."
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

    if (req.body.messages && Array.isArray(req.body.messages)) {
        req.body.messages.forEach((message:Message) => {
            messages.push({
                role: message.role,
                content: message.content,
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