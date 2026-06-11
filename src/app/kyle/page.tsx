'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface Message {
  id: string
  role: 'user' | 'kyle'
  content: string
  timestamp: Date
}

export default function KylePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'kyle',
      content:
        'Hi! I\'m Kyle, Ackley Hartnett\'s Machine Selection Expert. I\'m here to help you find the perfect machine for your pharmaceutical tablet and capsule identification needs. What can I help you with today?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/kyle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages
        })
      })

      const data = await response.json()

      const kyleMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'kyle',
        content: data.response || 'Sorry, I had trouble processing that. Can you ask again?',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, kyleMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'kyle',
        content:
          'Sorry, I encountered an error. Please try again or contact our sales team directly.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Kyle - Machine Selection Expert</h1>
          <p className="text-green-100">Get personalized recommendations for your pharmaceutical tablet marking needs</p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-3xl mx-auto px-4 py-8 h-screen flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-white rounded-lg p-6 shadow-md mb-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-green-500 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-200 text-gray-800 px-4 py-3 rounded-lg rounded-bl-none">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask Kyle about machine selection..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Send
          </button>
        </div>

        {/* Quick Questions */}
        <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm font-semibold text-gray-800 mb-3">Quick Questions:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => setInput('What machine can handle 500K tablets per hour?')}
              className="text-sm bg-white border border-green-300 text-green-700 hover:bg-green-100 p-2 rounded transition"
            >
              High-volume production (500K+ pph)
            </button>
            <button
              onClick={() => setInput('How does VIP compare to competitors?')}
              className="text-sm bg-white border border-green-300 text-green-700 hover:bg-green-100 p-2 rounded transition"
            >
              VIP vs. competitors
            </button>
            <button
              onClick={() => setInput('What\'s the pricing for laser drilling systems?')}
              className="text-sm bg-white border border-green-300 text-green-700 hover:bg-green-100 p-2 rounded transition"
            >
              Pricing information
            </button>
            <button
              onClick={() => setInput('Which customers use OROS technology?')}
              className="text-sm bg-white border border-green-300 text-green-700 hover:bg-green-100 p-2 rounded transition"
            >
              OROS customer references
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
