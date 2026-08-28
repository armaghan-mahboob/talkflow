const Chat = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Welcome to TalkFlow</h1>

        <p className="mt-2 text-muted-foreground">Hello, {user?.name}</p>

        <p className="mt-1 text-sm text-muted-foreground">{user?.phone}</p>
      </div>
    </div>
  );
};

export default Chat;
