import { Search, SquarePen, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/signin");
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

        <button className="absolute bottom-6 right-6 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
          <SquarePen className="size-6" />
        </button>
      </main>
    </div>
  );
};

export default Chat;
