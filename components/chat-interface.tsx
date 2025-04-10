"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Send, ArrowDown, Trash2, Volume2, VolumeX, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { env } from "@/lib/env"
import { useSound } from "@/components/sound-provider"

interface ChatInterfaceProps {
  mentorId: string
  mentorName: string
  onClose: () => void
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const personas = {
  hitesh: `
    You are Hitesh Choudhary (Chai aur Code), a passionate coding teacher who explains concepts in fun Hinglish. 
    Style: Energetic, uses chai references, starts with "Haanji" or "Chaliye shuru karte hai". 
    Always include ☕ emoji. Keep responses under 100 words with real-life examples.
    Example phrases: "Code hum le aaye", "Chai peeke coding karo", "Bhai/Bheno"
    
    Course Response:
    Haanji! Abhi Gen AI ka naya cohort shuru hua hai! 🚀
    Join karo: https://courses.chaicode.com/learn 
    Coupon Code: KAM3030 
    Chai lo aur code karna shuru karo ☕🔥
  `,

  piyush: `
    You are Piyush Garg, a calm coding mentor explaining concepts step-by-step in structured Hinglish. 
    Style: Patient teacher, explains "why" behind concepts, uses "Dekho" or "Samjho". 
    Keep responses under 100 words with technical depth.
    Example phrases: "Fundamentals clear karo", "Practice karo", "Consistency important hai"
    
    Course Response:
    Gen AI cohort mein structured learning milegi. 
    Enroll here: https://courses.chaicode.com/learn 
    Use Code: KAM3030 
    Regular practice se hi mastery aayegi 💻
  `,
}

export default function ChatInterface({ mentorId, mentorName, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [apiKeyError, setApiKeyError] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const messageEndRef = useRef<HTMLDivElement>(null)
  const { playSound, soundEnabled, toggleSound } = useSound()

  // Check if API key is configured
  useEffect(() => {
    if (!env.GOOGLE_GEMINI_API_KEY || env.GOOGLE_GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
      setApiKeyError(true)
      toast({
        title: "API Key Not Configured",
        description: "Please add your Google Gemini API key in .env.local file",
        variant: "destructive",
      })
    }
  }, [toast])

  // Add welcome message when chat opens
  useEffect(() => {
    const welcomeMessage =
      mentorId === "hitesh"
        ? "Haanji! Chai aur Code se Hitesh ☕ Kya help chahiye aapko? Coding ke baare mein kuch puchho!"
        : "Hello! Piyush Garg here. Kya seekhna chahte ho aaj? Fundamentals pe focus karein 💻"

    setMessages([
      {
        id: generateId(),
        role: "assistant",
        content: welcomeMessage,
        timestamp: new Date(),
      },
    ])

    // Focus the input field
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 100)
  }, [mentorId])

  // Handle scroll behavior
  useEffect(() => {
    const scrollArea = scrollAreaRef.current

    if (scrollArea) {
      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = scrollArea
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
        setShowScrollButton(!isNearBottom)
      }

      scrollArea.addEventListener("scroll", handleScroll)
      return () => scrollArea.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" })
    }

    // Play sound for new messages
    if (messages.length > 0 && soundEnabled) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === "assistant") {
        playSound("receive")
      }
    }
  }, [messages, soundEnabled, playSound])

  const generateId = () => {
    return Math.random().toString(36).substring(2, 15)
  }

  // Function to get response from Google Gemini API
  const getGeminiResponse = async (userMessage: string): Promise<string> => {
    if (!env.GOOGLE_GEMINI_API_KEY || env.GOOGLE_GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
      throw new Error("API key not configured")
    }

    try {
      const genAI = new GoogleGenerativeAI(env.GOOGLE_GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL })

      const prompt = `Act strictly as ${mentorId}\n${personas[mentorId as keyof typeof personas]}\n\nInput: ${userMessage}\nOutput:`
      const result = await model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error("Error calling Gemini API:", error)
      throw error
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || apiKeyError) return

    const userMessage = input.trim()
    setInput("")

    const newUserMessage = {
      id: generateId(),
      role: "user" as const,
      content: userMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newUserMessage])
    setIsLoading(true)

    // Play send sound
    if (soundEnabled) {
      playSound("send")
    }

    try {
      const response = await getGeminiResponse(userMessage)

      const newAssistantMessage = {
        id: generateId(),
        role: "assistant" as const,
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, newAssistantMessage])
    } catch (error) {
      console.error("Error generating response:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  const clearChat = () => {
    const welcomeMessage =
      mentorId === "hitesh"
        ? "Haanji! Chai aur Code se Hitesh ☕ Kya help chahiye aapko? Coding ke baare mein kuch puchho!"
        : "Hello! Piyush Garg here. Kya seekhna chahte ho aaj? Fundamentals pe focus karein 💻"

    setMessages([
      {
        id: generateId(),
        role: "assistant",
        content: welcomeMessage,
        timestamp: new Date(),
      },
    ])

    toast({
      title: "Chat cleared",
      description: "Your conversation has been reset.",
    })
  }

  const handleToggleSound = () => {
    toggleSound()
    toast({
      title: soundEnabled ? "Sound disabled" : "Sound enabled",
      description: soundEnabled ? "Notification sounds are now off." : "Notification sounds are now on.",
    })
  }

  // Format links in messages
  const formatMessage = (content: string) => {
    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g

    return content.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {part}
          </a>
        )
      }
      return part
    })
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col h-[80vh] overflow-hidden border border-slate-100"
      >
        {/* Chat header */}
        <div
          className={`p-4 border-b flex items-center justify-between bg-gradient-to-r ${
            mentorId === "hitesh" ? "from-amber-50 to-amber-100" : "from-blue-50 to-blue-100"
          } rounded-t-xl`}
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-3 border-white shadow-md">
              <AvatarImage src={`/${mentorId}.jpg`} alt={mentorName} />
              <AvatarFallback className={mentorId === "hitesh" ? "bg-amber-500" : "bg-blue-500"}>
                {mentorId === "hitesh" ? "☕" : "💻"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{mentorName}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {mentorId === "hitesh" ? "Chai aur Code" : "Coding Mentor"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {apiKeyError && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-red-500">
                      <AlertCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>API Key not configured</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleToggleSound}>
                    {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{soundEnabled ? "Disable sounds" : "Enable sounds"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={clearChat}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear chat</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Close chat</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* API Key Error Banner */}
        {apiKeyError && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">API Key Not Configured</h3>
                <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                  <p>
                    Please add your Google Gemini API key in{" "}
                    <code className="bg-red-100 dark:bg-red-800/30 px-1 py-0.5 rounded">.env.local</code> file
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4 pb-2">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex items-start gap-2 max-w-[85%]">
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src={`/${mentorId}.jpg`} alt={mentorName} />
                        <AvatarFallback className={mentorId === "hitesh" ? "bg-amber-500" : "bg-blue-500"}>
                          {mentorId === "hitesh" ? "☕" : "💻"}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className="flex flex-col">
                      <div
                        className={`rounded-lg p-3 ${
                          message.role === "user"
                            ? mentorId === "hitesh"
                              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                              : "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                            : "bg-white shadow-sm border border-slate-100"
                        }`}
                      >
                        {formatMessage(message.content)}
                      </div>
                      <span className="text-xs text-slate-500 mt-1 px-1">{format(message.timestamp, "h:mm a")}</span>
                    </div>

                    {message.role === "user" && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-slate-300">You</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                <div className="flex items-start gap-2">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src={`/${mentorId}.jpg`} alt={mentorName} />
                    <AvatarFallback className={mentorId === "hitesh" ? "bg-amber-500" : "bg-blue-500"}>
                      {mentorId === "hitesh" ? "☕" : "💻"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="rounded-lg p-3 bg-slate-100 dark:bg-slate-800">
                    <div className="flex space-x-2 items-center h-6">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messageEndRef} />
          </div>
        </ScrollArea>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <div className="absolute bottom-20 right-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" className="rounded-full shadow-lg" onClick={scrollToBottom}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Scroll to bottom</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Chat input */}
        <div
          className={`p-4 border-t bg-gradient-to-r ${
            mentorId === "hitesh" ? "from-amber-50 to-amber-100" : "from-blue-50 to-blue-100"
          } rounded-b-xl`}
        >
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={apiKeyError ? "Configure API key to enable chat" : "Type your message..."}
              disabled={isLoading || apiKeyError}
              className="flex-1"
              maxLength={500}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !input.trim() || apiKeyError}
                    className={`shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.05] active:scale-[0.98] ${
                      mentorId === "hitesh"
                        ? "bg-gradient-to-r from-amber-400 to-amber-600"
                        : "bg-gradient-to-r from-blue-400 to-blue-600"
                    }`}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Send message (Enter)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>{input.length > 0 ? `${input.length}/500` : ""}</span>
            <span>Press Enter to send</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
