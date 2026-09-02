import { Search, SquarePen, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const chats = [
  {
    id: 1,
    name: "Armaghan Mahboob",
    time: "3:07 AM",
    message: "Sounds good!",
    unread: 2,
  },
  {
    id: 2,
    name: "Muhammad Riaz",
    time: "10:30 AM",
    message: "Sent a file: project_brief.pdf",
    unread: 0,
  },
  {
    id: 3,
    name: "Haris Mirza",
    time: "12:08 AM",
    message: "Sent a file: project_brief.pdf",
    unread: 2,
  },
  {
    id: 4,
    name: "Shumail",
    time: "12:38 AM",
    message: "Sent a file: project_brief.pdf",
    unread: 0,
  },
  {
    id: 5,
    name: "Sadaqat",
    time: "11:51 AM",
    message: "Sounds good!",
    unread: 2,
  },
  {
    id: 6,
    name: "Aryaan",
    time: "12:59 AM",
    message: "Sent a file: project_brief.pdf",
    unread: 0,
  },
  {
    id: 7,
    name: "Ayehsa",
    time: "9:07 PM",
    message: "Sent a file: project_brief.pdf",
    unread: 0,
  },
  { id: 8, name: "Sana", time: "", message: "Sounds good!", unread: 0 },
];
const Chat = () => {
  const navigate = useNavigate();
  const [showCompose, setShowCompose] = useState(false);
  const [composeEmail, setComposeEmail] = useState("");
  const [composeError, setComposeError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/signin");
  };

  const handleStartChat = async () => {
    setComposeError("");

    if (!composeEmail.trim()) {
      setComposeError("Please enter an email");
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem("user"));

    if (composeEmail.trim().toLowerCase() === currentUser.email.toLowerCase()) {
      setComposeError("You can't start a chat with yourself");
      return;
    }

    try {
      // Look up the user by email
      const lookupResponse = await fetch(
        `http://localhost:5000/api/users/lookup?email=${encodeURIComponent(
          composeEmail.trim(),
        )}`,
      );

      const lookupData = await lookupResponse.json();

      if (!lookupResponse.ok) {
        setComposeError(lookupData.message);
        return;
      }

      // Create (or get existing) conversation between the two users
      const conversationResponse = await fetch(
        "http://localhost:5000/api/conversations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participants: [currentUser.id, lookupData.data.id],
          }),
        },
      );

      const conversationData = await conversationResponse.json();

      if (!conversationResponse.ok) {
        setComposeError(conversationData.message);
        return;
      }

      console.log("Conversation ready:", conversationData.data);

      setShowCompose(false);
      setComposeEmail("");
    } catch (error) {
      console.error(error);
      setComposeError("Unable to connect to the server");
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="shrink-0 border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-foreground">TalkFlow</h1>

          <div className="flex items-center gap-4">
            <Search className="size-5 text-muted-foreground" />
            <LogOut
              className="size-5 cursor-pointer text-muted-foreground"
              onClick={handleLogout}
            />
            <div className="size-8 rounded-full bg-muted" />
          </div>
        </div>

        <div className="flex px-4">
          <button className="border-b-2 border-primary px-3 py-2 text-sm font-medium text-foreground">
            CHATS
          </button>
          {/* <button className="px-3 py-2 text-sm font-medium text-muted-foreground">
            GROUPS
          </button>
          <button className="px-3 py-2 text-sm font-medium text-muted-foreground">
            CALLS
          </button> */}
        </div>
      </header>

      {/* Chat list region - scrollable */}
      <main className="relative flex-1 overflow-y-auto">
        <ul className="divide-y divide-border">
          {chats.map((chat) => (
            <li key={chat.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar size="lg">
                <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate font-medium text-foreground">
                    {chat.name}
                  </p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {chat.time}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="truncate text-sm text-muted-foreground">
                    {chat.message}
                  </p>
                  {chat.unread > 0 && <Badge>{chat.unread}</Badge>}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <button
          onClick={() => setShowCompose(true)}
          className="absolute bottom-6 right-6 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
        >
          <SquarePen className="size-6" />
        </button>

        {showCompose && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-sm rounded-xl bg-background p-4 shadow-lg">
              <h2 className="mb-3 text-lg font-semibold">Start a new chat</h2>

              <Input
                type="email"
                placeholder="Enter friend's email"
                value={composeEmail}
                onChange={(e) => setComposeEmail(e.target.value)}
              />

              {composeError && (
                <p className="mt-2 text-sm text-destructive">{composeError}</p>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCompose(false)}>
                  Cancel
                </Button>
                <Button onClick={handleStartChat}>Start Chat</Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;
