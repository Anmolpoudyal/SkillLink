import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Button } from "./ui/button";
import { X, Send } from "lucide-react";
import api from "../services/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const formatTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

const DirectChatModal = ({ isOpen, onClose, peerUser }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef(null);
  const listRef = useRef(null);

  const currentUserId = localStorage.getItem("userId");
  const currentUserName = localStorage.getItem("userName") || "You";
  const peerId = peerUser?.id;

  const peerName = useMemo(() => peerUser?.name || "User", [peerUser]);

  const scrollToBottom = () => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isOpen || !peerId) return undefined;

    let isMounted = true;
    setLoading(true);
    setError("");

    const fetchHistory = async () => {
      try {
        const response = await api.chat.getDirectMessages(peerId);
        if (!isMounted) return;
        setMessages(response.messages || []);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Failed to load direct messages");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHistory();

    const socket = io(API_BASE_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("chat:join_direct", { peerId });
    });

    socket.on("chat:direct_message", (payload) => {
      const isRelevant =
        (payload.senderId === peerId || payload.receiverId === peerId);
      if (!isRelevant) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === payload.id)) return prev;
        return [...prev, payload];
      });
    });

    socket.on("chat:error", (payload) => {
      setError(payload?.message || "Chat error");
    });

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.emit("chat:leave_direct", { peerId });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isOpen, peerId]);

  const handleSend = () => {
    const text = newMessage.trim();
    if (!text || !socketRef.current || !peerId) return;
    socketRef.current.emit("chat:send_direct", {
      peerId,
      message: text,
    });
    setNewMessage("");
  };

  if (!isOpen || !peerUser) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Direct Chat with {peerName}</h3>
            <p className="text-xs text-gray-500 capitalize">{peerUser.role?.replace("_", " ")}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
          {loading && <p className="text-sm text-gray-500">Loading messages...</p>}
          {!loading && messages.length === 0 && (
            <p className="text-sm text-gray-500">No messages yet. Start the conversation.</p>
          )}

          {messages.map((message) => {
            const isOwn =
              (currentUserId && message.senderId === currentUserId) ||
              message.senderName === currentUserName;

            return (
              <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 ${
                    isOwn ? "bg-teal-500 text-white" : "bg-white border border-gray-200 text-gray-800"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                  <p className={`text-[11px] mt-1 ${isOwn ? "text-teal-100" : "text-gray-500"}`}>
                    {isOwn ? "You" : message.senderName} • {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {error && <p className="px-4 pt-2 text-sm text-red-600">{error}</p>}

        <div className="p-4 border-t border-gray-100 flex items-center gap-2">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-500"
          />
          <Button onClick={handleSend} className="bg-teal-500 hover:bg-teal-600 text-white">
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DirectChatModal;
