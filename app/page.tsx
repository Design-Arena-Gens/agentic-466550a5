'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Volume2, VolumeX, MapPin, Play, Music, Search, Phone, Mail, Calculator, Calendar, Settings, MessageSquare } from 'lucide-react'

interface Command {
  timestamp: string
  text: string
  action: string
  status: 'success' | 'error'
}

export default function Home() {
  const [isListening, setIsListening] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [commands, setCommands] = useState<Command[]>([])
  const [currentAction, setCurrentAction] = useState('')
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            }
          }
          if (finalTranscript) {
            setTranscript(finalTranscript)
            processCommand(finalTranscript)
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
        }
      }
    }
  }, [])

  const speak = (text: string) => {
    if (!isMuted && synthRef.current) {
      synthRef.current.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0
      synthRef.current.speak(utterance)
    }
  }

  const processCommand = (command: string) => {
    const lowerCommand = command.toLowerCase()
    let action = ''
    let status: 'success' | 'error' = 'success'

    try {
      // Navigation commands
      if (lowerCommand.includes('navigate') || lowerCommand.includes('directions') || lowerCommand.includes('map')) {
        const location = lowerCommand.replace(/navigate to|directions to|show map of|map of|navigate|directions|map/gi, '').trim()
        action = `Opening Google Maps for: ${location}`
        speak(`Navigating to ${location}`)
        window.open(`https://www.google.com/maps/search/${encodeURIComponent(location)}`, '_blank')
      }
      // YouTube commands
      else if (lowerCommand.includes('play video') || lowerCommand.includes('youtube')) {
        const query = lowerCommand.replace(/play video|youtube|on youtube|video/gi, '').trim()
        action = `Searching YouTube for: ${query}`
        speak(`Playing ${query} on YouTube`)
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank')
      }
      // Music commands
      else if (lowerCommand.includes('play song') || lowerCommand.includes('play music') || lowerCommand.includes('listen to')) {
        const song = lowerCommand.replace(/play song|play music|listen to|play/gi, '').trim()
        action = `Playing music: ${song}`
        speak(`Playing ${song}`)
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(song + ' song')}`, '_blank')
      }
      // Search commands
      else if (lowerCommand.includes('search for') || lowerCommand.includes('google')) {
        const query = lowerCommand.replace(/search for|google|search/gi, '').trim()
        action = `Searching for: ${query}`
        speak(`Searching for ${query}`)
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank')
      }
      // Time command
      else if (lowerCommand.includes('what time') || lowerCommand.includes('current time')) {
        const time = new Date().toLocaleTimeString()
        action = `Current time: ${time}`
        speak(`The current time is ${time}`)
      }
      // Date command
      else if (lowerCommand.includes('what date') || lowerCommand.includes('today')) {
        const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        action = `Today is: ${date}`
        speak(`Today is ${date}`)
      }
      // Weather command
      else if (lowerCommand.includes('weather')) {
        const location = lowerCommand.replace(/weather in|weather at|weather|what's the/gi, '').trim() || 'current location'
        action = `Getting weather for: ${location}`
        speak(`Opening weather information`)
        window.open(`https://www.google.com/search?q=weather+${encodeURIComponent(location)}`, '_blank')
      }
      // Email command
      else if (lowerCommand.includes('open email') || lowerCommand.includes('check email')) {
        action = 'Opening email'
        speak('Opening your email')
        window.open('https://mail.google.com', '_blank')
      }
      // Calculator command
      else if (lowerCommand.includes('calculate') || lowerCommand.includes('calculator')) {
        const expression = lowerCommand.replace(/calculate|calculator|what is|what's/gi, '').trim()
        action = `Opening calculator for: ${expression}`
        speak('Opening calculator')
        window.open(`https://www.google.com/search?q=${encodeURIComponent(expression)}`, '_blank')
      }
      // Calendar command
      else if (lowerCommand.includes('calendar') || lowerCommand.includes('schedule')) {
        action = 'Opening calendar'
        speak('Opening your calendar')
        window.open('https://calendar.google.com', '_blank')
      }
      // News command
      else if (lowerCommand.includes('news')) {
        const topic = lowerCommand.replace(/news about|news on|news/gi, '').trim()
        action = topic ? `Getting news about: ${topic}` : 'Opening news'
        speak('Opening news')
        window.open(topic ? `https://news.google.com/search?q=${encodeURIComponent(topic)}` : 'https://news.google.com', '_blank')
      }
      // Help command
      else if (lowerCommand.includes('help') || lowerCommand.includes('what can you do')) {
        action = 'Showing available commands'
        speak('I can help you navigate, play videos and music, search the web, check weather, time, date, open email, calculator, calendar, and much more. Just ask me!')
      }
      else {
        action = `Command received: ${command}`
        speak('I heard you, but I\'m not sure what to do. Try asking me to navigate, play a video, or search for something.')
      }

      setCommands(prev => [{
        timestamp: new Date().toLocaleTimeString(),
        text: command,
        action,
        status
      }, ...prev].slice(0, 10))
      setCurrentAction(action)
    } catch (error) {
      console.error('Error processing command:', error)
      setCommands(prev => [{
        timestamp: new Date().toLocaleTimeString(),
        text: command,
        action: 'Error processing command',
        status: 'error' as const
      }, ...prev].slice(0, 10))
    }
  }

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      speak('Listening stopped')
    } else {
      recognitionRef.current?.start()
      setIsListening(true)
      speak('I\'m listening')
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (!isMuted) {
      synthRef.current?.cancel()
    }
  }

  const capabilities = [
    { icon: MapPin, label: 'Navigation', example: 'Navigate to Central Park' },
    { icon: Play, label: 'Videos', example: 'Play video funny cats' },
    { icon: Music, label: 'Music', example: 'Play song Bohemian Rhapsody' },
    { icon: Search, label: 'Search', example: 'Search for best restaurants' },
    { icon: Phone, label: 'Weather', example: 'What\'s the weather today' },
    { icon: Mail, label: 'Email', example: 'Open email' },
    { icon: Calculator, label: 'Calculator', example: 'Calculate 25 times 4' },
    { icon: Calendar, label: 'Calendar', example: 'Open calendar' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            AI Personal Agent
          </h1>
          <p className="text-gray-300 text-lg">Your intelligent voice-controlled assistant</p>
        </div>

        {/* Main Control Panel */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="flex flex-col items-center gap-6">
              {/* Voice Control Button */}
              <button
                onClick={toggleListening}
                className={`relative w-32 h-32 rounded-full transition-all duration-300 transform hover:scale-105 ${
                  isListening
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-500/50 animate-pulse'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/50'
                }`}
              >
                {isListening ? (
                  <Mic className="w-16 h-16 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                ) : (
                  <MicOff className="w-16 h-16 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                )}
              </button>

              <div className="flex gap-4">
                <button
                  onClick={toggleMute}
                  className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                  <span className="text-white">{isMuted ? 'Unmute' : 'Mute'}</span>
                </button>
              </div>

              {/* Status */}
              <div className="text-center">
                <p className={`text-xl font-semibold ${isListening ? 'text-green-400' : 'text-gray-400'}`}>
                  {isListening ? '🎤 Listening...' : 'Click mic to start'}
                </p>
                {transcript && (
                  <p className="text-gray-300 mt-2 italic">"{transcript}"</p>
                )}
                {currentAction && (
                  <p className="text-blue-300 mt-2 font-medium">{currentAction}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Capabilities Grid */}
        <div className="max-w-6xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">What I Can Do</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {capabilities.map((cap, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
                onClick={() => {
                  setTranscript(cap.example)
                  processCommand(cap.example)
                }}
              >
                <cap.icon className="w-8 h-8 text-blue-400 mb-2" />
                <h3 className="text-white font-semibold mb-1">{cap.label}</h3>
                <p className="text-gray-400 text-xs">"{cap.example}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Command History */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">Recent Commands</h2>
          <div className="space-y-2">
            {commands.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center border border-white/20">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">No commands yet. Start speaking to interact!</p>
              </div>
            ) : (
              commands.map((cmd, idx) => (
                <div
                  key={idx}
                  className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 border ${
                    cmd.status === 'success' ? 'border-green-500/30' : 'border-red-500/30'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-white font-medium">{cmd.text}</p>
                      <p className="text-gray-400 text-sm mt-1">{cmd.action}</p>
                    </div>
                    <span className="text-gray-500 text-xs">{cmd.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="max-w-4xl mx-auto mt-8 bg-blue-500/10 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30">
          <h3 className="text-xl font-bold text-blue-400 mb-3">💡 Quick Tips</h3>
          <ul className="text-gray-300 space-y-2">
            <li>• Click the microphone button and speak your command</li>
            <li>• Try: "Navigate to Times Square", "Play video cooking recipes", "Play song Hotel California"</li>
            <li>• Ask for help anytime: "What can you do?"</li>
            <li>• Click any capability card to try example commands</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
