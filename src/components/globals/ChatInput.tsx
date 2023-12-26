"use client";

import { FC,useRef, useState } from 'react';
import ReactTextareaAutosize from 'react-textarea-autosize';
import Button from './Button';
import axios from 'axios';
import toast from 'react-hot-toast';
interface ChatInputProps{
    chatPartner: User,
    chatId: string;
}

const ChatInput: FC<ChatInputProps> = ({chatPartner,chatId}) => {
  const textAreaRef = useRef<HTMLTextAreaElement|null>(null)
  const[input,setInput] = useState<string>("");
  const [isLoading,setIsLoading] = useState<boolean>(false);
  const sendMessage = async() => {
    if(!input || input.length === 0)
    {
        toast.error("Empty Message");
        return;
    }
    setIsLoading(true);
    try {
        const response = await axios.post(`/api/message/send`,{
            text: input,
            chatId
        });
        if( response.data?.status && response.data.status !== 500 || response.data.status !== 401 || response.status !== 404){
            toast.success("Message sent");
        }
        setInput("");
        textAreaRef.current?.focus();
    } catch (error) {
        toast.error("Something went wrong");
        setInput("");
    }finally{
        setIsLoading(false);
    }
  }

  return(
    <div className='border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0'>
        <div className='relative flex-1 overflow-hiddent rounded-lg shadow-sm ring-inset ring-1 ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600'>
            <ReactTextareaAutosize ref={textAreaRef} onKeyDown={(e) => {
                if(e.key === "Enter" && !e.shiftKey){
                    e.preventDefault();
                    sendMessage()
                }
            }}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${chatPartner.name}`}
            className='block w-full resize-none border-0 bg-transparent text-white placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6'/>

            <div onClick={() => textAreaRef.current?.focus()} className='py-2' aria-hidden='true'>
                <div className='py-px'>
                    <div className='h-9'/>
                </div>

            </div>

            <div className='absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2'>
                <div className='flex-shrink-0'>
                    <Button onClick={sendMessage} type='submit' isLoading={isLoading}>Post</Button>
                </div>
            </div>
        </div>
    </div>
  );
}

export default ChatInput;