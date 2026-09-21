import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { socket } from "@/lib/socket";
import {
  encryptMessage,
  decryptMessage,
  getStoredPrivateKey,
} from "@/lib/crypto";

const decryptIncomingMessage = (message, otherPublicKey, myPrivateKey) => {
  if (!message.encrypted) {
    return {
      ...message,
      decryptedContent: message.content,
      decryptionFailed: false,
    };
  }

  if (!otherPublicKey || !myPrivateKey) {
    return { ...message, decryptedContent: null, decryptionFailed: true };
  }

  const plaintext = decryptMessage(
    message.ciphertext,
    message.nonce,
    otherPublicKey,
    myPrivateKey,
  );

  if (plaintext === null) {
    return { ...message, decryptedContent: null, decryptionFailed: true };
  }

  return { ...message, decryptedContent: plaintext, decryptionFailed: false };
};

const getOtherParticipant = (conversation, userId) => {
  if (!conversation?.participants) return null;
  return conversation.participants.find(
    (participant) => participant._id !== userId,
  );
};

const Conversation = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const conversationRef = useRef(null);

  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  useEffect(() => {
    socket.emit("join-conversation", conversationId);
  }, [conversationId]);

  useEffect(() => {
    const handleReceiveMessage = (newMessage) => {
      if (newMessage.conversation !== conversationId) return;

      const otherParticipant = getOtherParticipant(
        conversationRef.current,
        user.id,
      );
      const myPrivateKey = getStoredPrivateKey();

      const decrypted = decryptIncomingMessage(
        newMessage,
        otherParticipant?.publicKey,
        myPrivateKey,
      );

      setMessages((prev) => [...prev, decrypted]);
    };

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [conversationId, user?.id]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    const otherParticipant = getOtherParticipant(conversation, user.id);
    const myPrivateKey = getStoredPrivateKey();

    if (!otherParticipant?.publicKey || !myPrivateKey) {
      setError("Cannot send — encryption keys are not available.");
      return;
    }

    const { ciphertext, nonce } = encryptMessage(
      trimmedMessage,
      otherParticipant.publicKey,
      myPrivateKey,
    );

    socket.emit("send-message", {
      conversation: conversationId,
      sender: user.id,
      ciphertext,
      nonce,
    });

    setMessage("");
    setError("");
  };

  useEffect(() => {
    const loadConversation = async () => {
      try {
        setLoading(true);

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

        const otherParticipant = getOtherParticipant(
          currentConversation,
          user.id,
        );
        const myPrivateKey = getStoredPrivateKey();

        const messagesResponse = await fetch(
          `http://localhost:5000/api/messages/${conversationId}`,
        );

        const messagesData = await messagesResponse.json();

        if (!messagesResponse.ok) {
          throw new Error(messagesData.message || "Failed to load messages");
        }

        const decryptedMessages = messagesData.data.map((item) =>
          decryptIncomingMessage(
            item,
            otherParticipant?.publicKey,
            myPrivateKey,
          ),
        );

        setMessages(decryptedMessages);
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

  const otherParticipant = getOtherParticipant(conversation, user.id);

  return (
    <div className="flex h-screen flex-col">
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
                      item.decryptionFailed
                        ? "bg-destructive/10 text-destructive italic"
                        : isOwnMessage
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                    }`}
                  >
                    {item.decryptionFailed
                      ? "🔒 Message could not be decrypted"
                      : item.decryptedContent}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

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

        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </form>
    </div>
  );
};

export default Conversation;
