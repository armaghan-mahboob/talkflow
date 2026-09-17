import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Search, SquarePen, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { socket, getOnlineUsers } from "@/lib/socket";
import { useChatStore } from "../store/chatStore";

const Chat = () => {
  const navigate = useNavigate();

  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCompose, setShowCompose] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [startingChat, setStartingChat] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(getOnlineUsers());

  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const unreadCounts = useChatStore((state) => state.unreadCounts);

  const incrementUnread = useChatStore((state) => state.incrementUnread);

  const clearUnread = useChatStore((state) => state.clearUnread);

  useEffect(() => {
    socket.on("online-users", setOnlineUsers);

    return () => {
      socket.off("online-users", setOnlineUsers);
    };
  }, []);

  useEffect(() => {
    socket.on("new-conversation", (conversation) => {
      setConversations((prev) => [conversation, ...prev]);
    });

    const handleNewMessageNotification = ({ conversation }) => {
      incrementUnread(conversation);
    };

    socket.on("new-message-notification", handleNewMessageNotification);

    return () => {
      socket.off("new-conversation");

      socket.off("new-message-notification", handleNewMessageNotification);
    };
  }, [incrementUnread]);

  // Load real conversations
  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;

    const loadConversations = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `http://localhost:5000/api/conversations/${user.id}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load conversations");
        }

        if (!cancelled) {
          setConversations(data.data);
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadConversations();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Fixed Debounced search effect
  useEffect(() => {
    const query = email.trim();

    // Hide dropdown if query is too short or if the email directly matches a selected suggestion
    if (!query || query.length < 2) {
      return;
    }

    let isCancelled = false;

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);

        const response = await fetch(
          `http://localhost:5000/api/users/search?q=${encodeURIComponent(query)}`,
        );
        const data = await response.json();

        if (response.ok && !isCancelled) {
          const filtered = (data.data || []).filter(
            (u) => u.email.toLowerCase() !== user?.email?.toLowerCase(),
          );

          // If the current query exactly matches one result's email (user just selected it), don't reopen dropdown
          const isExactMatch = filtered.some(
            (u) => u.email.toLowerCase() === query.toLowerCase(),
          );

          setSuggestions(filtered);
          setShowDropdown(!isExactMatch && filtered.length > 0);
        }
      } catch (err) {
        console.error("Error searching emails:", err);
      } finally {
        if (!isCancelled) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [email, user?.email]);

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
    clearUnread(conversationId);

    navigate(`/chat/${conversationId}`);
  };

  const handleSelectUser = (selectedEmail) => {
    setEmail(selectedEmail);
    setSuggestions([]);
    setShowDropdown(false);
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
      setSuggestions([]);
      setShowDropdown(false);

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

      {/* Online contacts row */}
      {!loading && conversations.length > 0 && (
        <div className="flex gap-3 overflow-x-auto border-b px-4 py-3">
          {conversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation);

            if (!otherParticipant) return null;

            const isOnline = onlineUsers.includes(otherParticipant._id);

            return (
              <div
                key={conversation._id}
                className="flex flex-col items-center gap-1"
              >
                <Avatar
                  className={
                    isOnline
                      ? "ring-2 ring-green-500 ring-offset-2 ring-offset-background"
                      : "opacity-70 grayscale"
                  }
                >
                  <AvatarFallback>
                    {otherParticipant.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                <span className="max-w-14 truncate text-[10px] text-muted-foreground">
                  {otherParticipant.name}
                </span>
              </div>
            );
          })}
        </div>
      )}

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
                    <Badge
                      variant={
                        unreadCounts[conversation._id] > 0
                          ? "default"
                          : "secondary"
                      }
                      className={
                        unreadCounts[conversation._id] > 0
                          ? "bg-green-500 text-black hover:bg-green-600"
                          : ""
                      }
                    >
                      {unreadCounts[conversation._id] || 0}
                    </Badge>
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
          setEmail("");
          setSuggestions([]);
          setShowDropdown(false);
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
              <div className="relative">
                <Input
                  type="text"
                  placeholder="friend@example.com"
                  value={email}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEmail(val);

                    if (val.trim().length < 2) {
                      setSuggestions([]);
                      setShowDropdown(false);
                    }
                  }}
                  onFocus={() =>
                    suggestions.length > 0 && setShowDropdown(true)
                  }
                  disabled={startingChat}
                />

                {isSearching && (
                  <div className="absolute right-3 top-2.5">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}

                {/* Dropdown Suggestions */}
                {showDropdown && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-md border bg-popover shadow-md">
                    {suggestions.map((sUser) => (
                      <div
                        key={sUser._id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectUser(sUser.email);
                        }}
                        className="flex cursor-pointer items-center justify-between p-2.5 hover:bg-muted"
                      >
                        <div>
                          <p className="text-sm font-medium">{sUser.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {sUser.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCompose(false);
                    setError("");
                    setEmail("");
                    setSuggestions([]);
                    setShowDropdown(false);
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
