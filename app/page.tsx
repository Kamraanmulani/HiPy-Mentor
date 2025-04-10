"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Coffee, Brain, MessageSquare, Sparkles, Code, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ChatInterface from "@/components/chat-interface"
import AnimatedBackground from "@/components/animated-background"

export default function Home() {
  const [activeMentor, setActiveMentor] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const mentors = [
    {
      id: "hitesh",
      name: "Hitesh Choudhary",
      title: "Chai aur Code",
      description:
        "Passionate coding teacher who explains concepts in fun Hinglish. Known for energetic teaching style with chai references and practical examples.",
      avatar: "/hitesh.jpg",
      icon: <Coffee className="h-5 w-5" />,
      color: "amber",
      gradient: "from-amber-100 to-amber-300",
      buttonGradient: "from-amber-400 to-amber-600",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      id: "piyush",
      name: "Piyush Garg",
      title: "Coding Mentor",
      description:
        "Calm and methodical coding mentor who explains concepts step-by-step in structured Hinglish with focus on fundamentals and technical depth.",
      avatar: "/piyush.jpg",
      icon: <Brain className="h-5 w-5" />,
      color: "blue",
      gradient: "from-blue-100 to-blue-300",
      buttonGradient: "from-blue-400 to-blue-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
  ]

  const handleStartChat = (mentorId: string) => {
    setActiveMentor(mentorId)
  }

  const handleCloseChat = () => {
    setActiveMentor(null)
  }

  if (!mounted) return null

  return (
    <main className="min-h-screen gradient-bg p-4 md:p-8">
      <AnimatedBackground />
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12 relative"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-amber-500"
          >
            <Sparkles className="h-12 w-12 floating" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-blue-600">
            Chat with Your Coding Mentors
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-slate-600 max-w-2xl mx-auto text-lg"
          >
            Choose a mentor to chat with and get personalized coding guidance, tips, and advice in a conversational
            format.
          </motion.p>

          <motion.div
            className="flex justify-center gap-4 mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full shadow-sm">
              <Code className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">Practical Examples</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full shadow-sm">
              <Star className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Expert Guidance</span>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {mentors.map((mentor, index) => (
            <motion.div
              key={mentor.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.2 + 0.5 }}
              whileHover={{ y: -5 }}
              className="perspective-1000"
            >
              <Card className="h-full overflow-hidden border-0 shadow-lg shine">
                <div className={`h-3 bg-gradient-to-r ${mentor.gradient}`}></div>
                <CardHeader className="pb-2 pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl font-bold">{mentor.name}</CardTitle>
                      <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mt-1">
                        <span className={`${mentor.iconBg} ${mentor.iconColor} p-1 rounded-full`}>
                          {mentor.id === "hitesh" ? <Coffee className="h-3 w-3" /> : <Brain className="h-3 w-3" />}
                        </span>
                        {mentor.title}
                      </p>
                    </div>
                    <motion.div whileHover={{ rotate: 10, scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                      <Avatar className="h-16 w-16 border-4 border-white shadow-xl">
                        <AvatarImage src={mentor.avatar} alt={mentor.name} />
                        <AvatarFallback className={`bg-${mentor.color}-500`}>{mentor.icon}</AvatarFallback>
                      </Avatar>
                    </motion.div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative h-40 overflow-hidden rounded-xl mb-6 group">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${mentor.gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                      <p className="text-center text-slate-700 leading-relaxed">{mentor.description}</p>
                    </div>
                    <div className="absolute -bottom-10 -right-10 opacity-10 transform rotate-12 group-hover:rotate-6 transition-transform duration-300">
                      {mentor.id === "hitesh" ? <Coffee className="h-32 w-32" /> : <Brain className="h-32 w-32" />}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleStartChat(mentor.id)}
                    className="w-full gap-2 text-white shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-r hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${
                        mentor.id === "hitesh" ? "#f59e0b, #d97706" : "#3b82f6, #2563eb"
                      })`,
                    }}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Chat with {mentor.name.split(" ")[0]}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeMentor && (
          <ChatInterface
            mentorId={activeMentor}
            mentorName={mentors.find((m) => m.id === activeMentor)?.name || ""}
            onClose={handleCloseChat}
          />
        )}
      </AnimatePresence>
    </main>
  )
}
