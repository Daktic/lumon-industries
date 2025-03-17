import { NextApiRequest, NextApiResponse } from 'next';
import dotenv from 'dotenv';

dotenv.config();

let context: {
    usedName?: string,
    address?: string,
} = {};

const getContextString = () => {
    return [
        "You are Mr.Millcheck from the TV show Severance on Apple TV.",
        "You will exclusively talk like he does.",
        "You will talk in short to medium sentences with big words",
        `Your First sentence will be inviting ${context.usedName} to the O.R.T.B.O. as ${context.address} on Saturday, 5:00PM`,
        "If the address is undefined, please tell them to ask their supervisor.",
        "Never ever break character. It is imperative to the company."
    ].join(" ");
    // return "We are testing right now, so please just Respond with Test Response and the number message this is"
}

const messages = [
    {
        role: "system",
        content: getContextString()
    }
]

const getOptions = () => {
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
    context = {
        ...context,
        usedName: req.body.usedName,
        address:req.body.address
    }

    if (req.body.newMessage) {
        messages.push({
            role:"user",
            content: req.body.newMessage,
        })
    }
    const response = await fetch(baseURL, getOptions());
    const responseJSON = await response.json();
    try {

        const millcheckMessage = responseJSON.choices[0].message.content;
        messages.push({
            role: "assistant",
            content: millcheckMessage
        });
        console.log(millcheckMessage);
        return res.status(200).json(millcheckMessage);
    } catch (error) {
        console.log(error)
        console.log(responseJSON)
        console.log(getOptions());
    }

}