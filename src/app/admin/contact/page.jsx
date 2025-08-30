"use client";
import { useState, useEffect } from "react";
import { MessageSquare, Mail, AlertCircle, CheckCircle, Clock, Eye } from "lucide-react";
import Header from "@/components/layout/Header";

export default function ContactAdminPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState('all'); // all, new, responded
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/contact?status=${filter}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to fetch contact messages:', err);
      setError('Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsResponded = async (messageId) => {
    try {
      const response = await fetch(`/api/admin/contact/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'responded' })
      });

      if (!response.ok) {
        throw new Error(`Failed to update message: ${response.status}`);
      }

      // Refresh messages
      fetchMessages();
      
      // Update selected message if it's the one we just updated
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(prev => ({ ...prev, status: 'responded', responded_at: new Date().toISOString() }));
      }
    } catch (err) {
      console.error('Failed to mark message as responded:', err);
      alert('Failed to update message status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'responded':
        return <CheckCircle size={16} className="text-green-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'feature':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'bug':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'technical':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'pricing':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    total: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    responded: messages.filter(m => m.status === 'responded').length
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212]">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-[Inter]">
            Contact Messages Admin
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and respond to user inquiries and feature requests
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <MessageSquare size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Messages</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.new}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Needs Response</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.responded}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Responded</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Messages List */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Contact Messages
                </h2>
                <button
                  onClick={fetchMessages}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Refresh
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex space-x-1 bg-gray-100 dark:bg-[#262626] rounded-lg p-1">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'new', label: 'New' },
                  { key: 'responded', label: 'Responded' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      filter === tab.key
                        ? 'bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Loading messages...</p>
                </div>
              ) : error ? (
                <div className="p-6 text-center">
                  <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="p-6 text-center">
                  <Mail size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {filter === 'all' ? 'No messages yet' : `No ${filter} messages`}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => setSelectedMessage(message)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors ${
                        selectedMessage?.id === message.id ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(message.status)}
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {message.subject}
                          </h3>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(message.message_type)}`}>
                          {message.message_type}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        From: {message.name} ({message.email})
                      </p>
                      
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {formatDate(message.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Message Detail */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-gray-700">
            {selectedMessage ? (
              <>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedMessage.subject}
                    </h2>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getTypeColor(selectedMessage.message_type)}`}>
                      {selectedMessage.message_type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div>
                      <p><strong>From:</strong> {selectedMessage.name}</p>
                      <p><strong>Email:</strong> {selectedMessage.email}</p>
                      <p><strong>Date:</strong> {formatDate(selectedMessage.created_at)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedMessage.status)}
                      <span className="capitalize">{selectedMessage.status}</span>
                    </div>
                  </div>

                  {selectedMessage.status === 'new' && (
                    <button
                      onClick={() => markAsResponded(selectedMessage.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                      Mark as Responded
                    </button>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Message:</h3>
                  <div className="bg-gray-50 dark:bg-[#262626] rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>

                  {selectedMessage.responded_at && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Responded on: {formatDate(selectedMessage.responded_at)}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-6 text-center">
                <Eye size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Select a message to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}