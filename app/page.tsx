"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@ai-sdk/react";

import LandingSections from "@/components/LandingSections";
import { Button } from "@/components/ui/button";
import {
  ArrowDownCircle,
  Loader2,
  MessageCircle,
  RotateCcw,
  SendIcon,
  X,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

export default function Chat() {
  const [isChatOpen, setIsChatOPen] = useState(false);
  const [showChatIcon, setShowChatIcon] = useState(true);
  const chatIconRef = useRef(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowChatIcon(true);
      } else {
        setShowChatIcon(false);
        setIsChatOPen(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleChat = () => {
    setIsChatOPen(!isChatOpen);
  };

 
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    reload,
    error,
  } = useChat({ api: "api/gemini" });
  useEffect(()=> {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  return (
    <div className="flex flex-col min-h-screen">
      <LandingSections />
      <AnimatePresence>
        {showChatIcon && (
          <motion.div
            key="chat-icon"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Button
              ref={chatIconRef}
              onClick={toggleChat}
              size="icon"
              className="rounded-full size-14"
            >
              {isChatOpen ? (
                <MessageCircle className="size-12" />
              ) : (
                <ArrowDownCircle className="size-12" />
              )}
            </Button>
          </motion.div>
        )}

        {isChatOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 right-4 z-50 w-[95%] md:w-[500px]"
          >
            <Card className="border-2">
              <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-3">
                <CardTitle className="text-lg font-bold">
                  Chat with Minet AI
                </CardTitle>
                <Button
                  onClick={toggleChat}
                  variant="ghost"
                  size="sm"
                  className="px-2 py-0"
                  // className="rounded-full size-14 p-2 shadow-lg"
                >
                  <X className="size-4" />
                  <span className="sr-only">Close chat</span>
                </Button>
              </CardHeader>
              <CardContent>
                <div ref={scrollRef}></div>
                <ScrollArea className="h-[500px] pr-4">
                  {messages.length > 0 ? (
                    messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`inline-block rounded-lg ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <ReactMarkdown 
                          children={message.content}
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({node, inline, className, children, ...props}) {
                              return inline ? (
                                <code {...props} className="bg-gray-200 p-1 rounded">
                                  {children}
                                </code>
                              ): (
                                <pre {...props} className="bg-gray-200 p-2 rounded">
                                  <code {...props} className="bg-gray-200 rounded"></code>
                                </pre>
                              )},
                              ul: ({children}) => (
                                <ul className="list-disc pl-4 space-y-1">
                                  {children}
                                </ul>
                              ),
                              ol: ({children}) => (
                                <li className="list-decimal pl-4 space-y-1">
                                  {children}
                                </li>
                              ),
                              a: ({children, ...props}) => (
                                <a
                                  {...props}
                                  className="text-blue-500 hover:underline"
                                >
                                  {children}
                                </a>
                              )
                            } }
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="w-full mt-32 text-gray-500 items-center justify-center flex gap-3">
                      No messages yet.
                    </div>
                  )}

                  {isLoading && (
                    <div className="w-full items-center justify-center flex gap-3">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                      <Button
                        onClick={() => stop()}
                        variant="ghost"
                        size="icon"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  )}
                  {error && (
                    <div className="w-full items-center justify-center flex gap-3">
                      <XCircle className="mr-2 h-4 w-4 text-red-500" />
                      <Button
                        onClick={() => reload()}
                        variant="ghost"
                        size="icon"
                      >
                        <RotateCcw className="size-4" />
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex items-center space-x-2">
                <form
                  onSubmit={handleSubmit}
                  className="flex w-full items-center space-x-2"
                >
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    className="flex-1"
                    placeholder="Type your message..."
                  />
                  <Button
                    type="submit"
                    className="size-9"
                    disabled={isLoading}
                    size="icon"
                  >
                    <SendIcon />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
