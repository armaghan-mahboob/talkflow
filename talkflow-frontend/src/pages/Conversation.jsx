import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { socket } from "@/lib/socket";

const Conversation = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socket.emit("join-conversation", conversationId);
  }, [conversationId]);

  useEffect(() => {
    socket.on("receive-message", (newMessage) => {
      if (newMessage.conversation === conversationId) {
        setMessages((prev) => [...prev, newMessage]);
      }
    });

    return () => {
      socket.off("receive-message");
    };
  }, [conversationId]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    socket.emit("send-message", {
      conversation: conversationId,
      sender: user.id,
      content: trimmedMessage,
    });

    setMessage("");
  };

  useEffect(() => {
    const loadConversation = async () => {
      try {
        setLoading(true);

        // Get user's conversations
        const conversationsResponse = await fetch(
          `http://localhost:5000/api/conversations/${user.id}`,
        );

        const conversationsData = await conversationsResponse.json();

        if (!conversationsResponse.ok) {
          throw new Error(
            conversationsData.message || "Failed to load conversation",
          );
        }

        const currentConversation = conversationsData.data.find(
          (item) => item._id === conversationId,
        );

        setConversation(currentConversation);

        // Get messages
        const messagesResponse = await fetch(
          `http://localhost:5000/api/messages/${conversationId}`,
        );

        const messagesData = await messagesResponse.json();

        if (!messagesResponse.ok) {
          throw new Error(messagesData.message || "Failed to load messages");
        }

        setMessages(messagesData.data);
      } catch (error) {
        console.error("Error loading conversation:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id && conversationId) {
      loadConversation();
    }
  }, [conversationId, user?.id]);

  const getOtherParticipant = () => {
    if (!conversation?.participants) return null;

    return conversation.participants.find(
      (participant) => participant._id !== user.id,
    );
  };

  const otherParticipant = getOtherParticipant();

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex h-16 items-center gap-3 border-b px-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/chat")}>
          <ArrowLeft />
        </Button>

        <div>
          <h1 className="font-semibold">
            {otherParticipant?.name || "Conversation"}
          </h1>

          <p className="text-xs text-muted-foreground">
            {otherParticipant?.email || ""}
          </p>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No messages yet. Send the first message.
            </p>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-2">
            {messages.map((item) => {
              const isOwnMessage =
                item.sender?._id === user.id || item.sender === user.id;

              return (
                <div
                  key={item._id}
                  className={`flex ${
                    isOwnMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                      isOwnMessage
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {item.content}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="border-t p-4">
        <div className="mx-auto flex max-w-3xl gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          />

          <Button type="submit" size="icon">
            <Send />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Conversation;
