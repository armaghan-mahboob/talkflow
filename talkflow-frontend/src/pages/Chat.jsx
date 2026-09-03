import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Search, SquarePen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { socket } from "@/lib/socket";

const Chat = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCompose, setShowCompose] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [startingChat, setStartingChat] = useState(false);

  // Load real conversations
  const fetchConversations = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/conversations/${user.id}`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load conversations");
      }

      setConversations(data.data);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchConversations();
    }
  }, [user?.id]);

  const handleLogout = () => {
    console.log("Before disconnect:", socket.connected);

    socket.disconnect();

    console.log("After disconnect:", socket.connected);

    localStorage.removeItem("user");

    navigate("/signin");
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(
      (participant) => participant._id !== user.id,
    );
  };

  const handleOpenConversation = (conversationId) => {
    navigate(`/chat/${conversationId}`);
  };

  const handleStartChat = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

    setError("");

    if (!trimmedEmail) {
      setError("Please enter an email.");
      return;
    }

    if (trimmedEmail === user.email.toLowerCase()) {
      setError("You cannot start a conversation with yourself.");
      return;
    }

    try {
      setStartingChat(true);

      // Find user
      const lookupResponse = await fetch(
        `http://localhost:5000/api/users/lookup?email=${encodeURIComponent(
          trimmedEmail,
        )}`,
      );

      const lookupData = await lookupResponse.json();

      if (!lookupResponse.ok) {
        throw new Error(lookupData.message || "User not found.");
      }

      // Create or get conversation
      const conversationResponse = await fetch(
        "http://localhost:5000/api/conversations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            participants: [user.id, lookupData.data.id],
          }),
        },
      );

      const conversationData = await conversationResponse.json();

      if (!conversationResponse.ok) {
        throw new Error(
          conversationData.message || "Failed to create conversation.",
        );
      }

      const conversation = conversationData.data;

      // Close compose
      setShowCompose(false);
      setEmail("");

      // Open actual conversation
      navigate(`/chat/${conversation._id}`);
    } catch (error) {
      console.error("Error starting chat:", error);
      setError(error.message);
    } finally {
      setStartingChat(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b px-4">
        <h1 className="text-xl font-bold">TalkFlow</h1>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Search />
          </Button>

          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut />
          </Button>

          <Avatar>
            <AvatarFallback>
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Chats tab */}
      <div className="border-b px-4">
        <div className="py-3 text-sm font-semibold">CHATS</div>
      </div>

      {/* Conversation list */}
      <main className="pb-24">
        {loading ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Loading conversations...
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No conversations yet.
          </div>
        ) : (
          conversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation);

            if (!otherParticipant) return null;

            return (
              <button
                key={conversation._id}
                onClick={() => handleOpenConversation(conversation._id)}
                className="flex w-full items-center gap-3 border-b p-4 text-left transition-colors hover:bg-muted/50"
              >
                <Avatar>
                  <AvatarFallback>
                    {otherParticipant.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="font-medium">{otherParticipant.name}</h2>

                    <Badge variant="secondary">0</Badge>
                  </div>

                  <p className="truncate text-sm text-muted-foreground">
                    {otherParticipant.email}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </main>

      {/* Compose button */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full"
        size="icon"
        onClick={() => {
          setShowCompose(true);
          setError("");
        }}
      >
        <SquarePen />
      </Button>

      {/* Compose overlay */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Start a conversation</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Enter the other user's email address.
            </p>

            <form onSubmit={handleStartChat} className="mt-4 space-y-3">
              <Input
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={startingChat}
              />

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCompose(false);
                    setError("");
                  }}
                  disabled={startingChat}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={startingChat}>
                  {startingChat ? "Opening..." : "Start Chat"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
