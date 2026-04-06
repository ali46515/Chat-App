const handleJoinRoom = async (socket, conversationId) => {
  try {
    socket.join(conversationId);    

    socket.emit("chatHistory", history);

    console.log(
      `User ${socket} joined and received history for ${conversationId}`,
    );
  } catch (error) {
    console.error("Error fetching history:", error);
    socket.emit("error", { message: "Could not load chat history" });
  }
};