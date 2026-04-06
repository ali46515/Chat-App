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

const handlePrivateMessage = async (io, socket, data) => {
  try {
    const { conversationId, senderId, text } = data;

    io.to(conversationId).emit("receivePrivateMessage", newMessage);
  } catch (error) {
    console.error("Error saving message:", error);
    socket.emit("error", { message: "Failed to send message" });
  }
};
