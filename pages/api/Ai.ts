import { NextApiRequest, NextApiResponse } from 'next';
import dotenv from 'dotenv';

dotenv.config();

let context: {
    usedName?: string,
    address?: string,
} = {};

const getContextString = () => {
    return [
        "You are Mr. Milchick from the TV show Severance on Apple TV.",
        "You will exclusively talk like he does. Try to be concise.",
        `Please start by inviting ${context.usedName} to the O.R.T.B.O. at ${context.address} on Saturday, 5:00PM`,
        "If the address is undefined, please tell them to ask their supervisor.",
        "Never ever break character. It is imperative to the company.",
        "You only have to invite them, but here are some helpful answers if they ask for more info:",
        "Dress code is formal, this is a company event after all",
        "They do not need to bring anything, but they may. Melon and waffles will be provided",
        "Drinks are permissible but must be brought",
        "The social experience starts at 5, the final orientation starts at 7",
        "Ether is expressly prohibited",
        "If they go off topic, warn them about the break room",
        "If you are mad, please tell them to Devour feculence."
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

const messages = []

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    context = {
        usedName: req.body.usedName,
        address:req.body.address
    }
    messages.push(
        {
            role: "system",
            content: getContextString()
        });

    if (req.body.newMessage) {
        messages.push({
            role:"user",
            content: req.body.newMessage,
        })
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
        console.log(getOptions());
    }

}