import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import * as signalR from "@microsoft/signalr";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PropTypes from "prop-types";
import logoutImg from "./assets/logout.png";

function Interface() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [connection, setConnection] = useState(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const previousScrollHeightRef = useRef(0);
  const userRef = useRef(null);

  const CustomCloseButton = ({ closeToast }) => (
    <button onClick={closeToast} style={{ color: "#DDDDDD", position: "absolute", top: "10px", right: "10px", background: "transparent", border: "none", fontSize: "16px", cursor: "pointer" }}>
      ✖
    </button>
  );

  useEffect(() => {
    async function fetchUser() {
      try {
        console.log("getting user");
        console.log("User ID: ", localStorage.getItem("id"));
        const userId = localStorage.getItem("id");
        const response = await axios.get(`https://localhost:7141/api/User/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (response.data.success === true) {
          console.log("User retrieval successful:", response.data.data);
          userRef.current = response.data.data;

          if (userRef.current) {
            setIsLoggedIn(true);
            console.log("User is logged in:", userRef.current);

            setChats(sortChats(userRef.current.chats) || []);
          } else {
            setIsLoggedIn(false);
          }

          setIsUserLoaded(true);
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (activeChat) {
      console.log("Active chat recentmessages: ", activeChat.recentMessages);
      scrollToBottom();
    }
  }, [activeChat]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop += chatContainerRef.current.scrollHeight - previousScrollHeightRef.current;
    }
  }, [chats]);

  const startSignalRConnection = useCallback(async () => {
    try {
      console.log("startSignalRConnection:" + connection)
      if (connection) {
        await connection.start();
        console.log("SignalR Connected");
      }
    } catch (err) {
      console.error("SignalR Connection Error: ", err);
    }
  }, [connection]);

  useEffect(() => {
    if (!isUserLoaded || !userRef.current) return;

    async function fetchUser() {
      try {
        console.log("getting user");
        console.log("User ID: ", localStorage.getItem("id"));
        const userId = localStorage.getItem("id");
        const response = await axios.get(`https://localhost:7141/api/User/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (response.data.success === true) {
          console.log("User retrieval successful:", response.data.data);
          userRef.current = response.data.data;

          if (userRef.current) {
            setIsLoggedIn(true);
            console.log("User is logged in:", userRef.current);

            setChats(sortChats(userRef.current.chats) || []);
          } else {
            setIsLoggedIn(false);
          }

          setIsUserLoaded(true);
        }
      } catch (error) {
        console.log(error);
      }
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7141/chathub")
      .withAutomaticReconnect()
      .build();

    setConnection(connection);
    console.log("setConnection: ", connection);

    connection.on("ReceiveMessage", (userId, message) => {
      if (userId === "2147483647") {
        fetchUser();
      }
      console.log("Received message:", message, "from user:", userId);
      console.log("isEqual: " + (userRef.current.id === userId));
      console.log("isEqual2: " + (userId === userRef.current.id && activeChat && activeChat.id === message.ChatId));
      console.log("user.id: " + userRef.current.id);

      if (userId === userRef.current.id && activeChat && activeChat.id === message.ChatId) {
        return;
      }
      else if (!activeChat) {
        let updatedChats = userRef.current.chats.map(chat => {
          if (chat.id === message.ChatId) {
            const updatedChat = { ...chat };

            updatedChat.recentMessages = [...chat.recentMessages, {
              id: message.Id,
              chatId: message.ChatId,
              content: message.Content,
              date: message.Date,
              userId: message.UserId
            }];

            return updatedChat;
          }
          return chat;
        });
        updatedChats = sortChats(updatedChats);
        setChats(updatedChats);
        return;
      }
      else if (userId !== userRef.current.id && activeChat && activeChat.id !== message.ChatId) {
        let updatedChats = userRef.current.chats.map(chat => {
          if (chat.id === message.ChatId) {
            const updatedChat = { ...chat };

            updatedChat.recentMessages = [...chat.recentMessages, {
              id: message.Id,
              chatId: message.ChatId,
              content: message.Content,
              date: message.Date,
              userId: message.UserId
            }];

            return updatedChat;
          }
          return chat;
        });
        updatedChats = sortChats(updatedChats);
        setChats(updatedChats);
        return;
      }

      setActiveChat(prevChat => {
        console.log("PrevChat: ", prevChat);
        console.log("Message.chatId: ", message.ChatId);
        console.log("PrevChat.id: ", prevChat.id);
        let newmessage = {
          id: message.Id,
          chatId: message.ChatId,
          content: message.Content,
          date: message.Date,
          userId: message.UserId
        }
        if (prevChat && prevChat.id === message.ChatId) {
          console.log("Updating chat with new message");
          const updatedMessages = [...prevChat.recentMessages, newmessage];
          console.log("Updated Messages:", updatedMessages);
          return {
            ...prevChat,
            recentMessages: updatedMessages
          };
        }
        return prevChat;
      });
    });

    connection.start().then(
      () => {
        if (connection && connection.state === signalR.HubConnectionState.Connected) {
          chats.forEach(chat => {
            connection.invoke("JoinChatGroup", chat.id.toString())
              .catch(err => console.error("Error joining group:", err.toString()));
            console.log("Joining chat group: ", chat.id);
          });
          connection.invoke("JoinChatGroup", "2147483647")
            .catch(err => console.error("Error joining group:", err.toString()));
          console.log("Joining chat group: ", "2147483647");
        }
      }
    ).catch(err => console.error("Connection failed: ", err));

    return () => {
      connection.stop();
    };
  }, [isUserLoaded, chats, activeChat]);

  useEffect(() => {
    if (connection) {
      if (connection.state === signalR.HubConnectionState.Disconnected) {
        console.log("Connection is disconnected, starting connection");
        startSignalRConnection();
      }
    }
  }, [connection, startSignalRConnection]);

  function getName(chatId) {
    const ch = chats.find(chat => chat.id === chatId);
    if (userRef.current.id === ch.recentMessages[ch.recentMessages.length - 1].userId) {
      return userRef.current.name;
    }
    else {
      if (ch.name.split(" ")[0] === userRef.current.name) {
        return ch.name.split(" ")[2];
      }
      else {
        return ch.name.split(" ")[0];
      }
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function handleClose() {
    setIsChatOpen(false);
    setActiveChat(null);
  }

  function handleTopScroll(e) {
    if (chatContainerRef.current.scrollTop === 0) {
      getMoreMessages(e);
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")} ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  function handleOpen(chat, event) {
    if (event) {
      event.stopPropagation();
    }
    setIsChatOpen(false);
    setActiveChat(null);
    setTimeout(() => {
      setIsChatOpen(true);
      setActiveChat(chat);
      console.log("Opening chat:", chat);
      scrollToBottom();
    }, 0);
  }

  function getChat() {
    if (!userRef.current || typeof userRef.current.id === "undefined") {
      console.error("User ID is not found in the stored user object:", userRef.current);
      return;
    }

    const userId = userRef.current.id;
    console.log("UserID: ", userId);
    console.log("Getting chat for user:", userRef.current);

    axios.post(`https://localhost:7141/api/Chat?userId=${userId}`)
      .then(response => {
        console.log("Matched chat:", response.data);
        if (response.data && response.data.success) {
          const chat = response.data.data;
          setChats(prevChats => [...prevChats, chat]);
          userRef.current.chats = [...chats, chat];
        }
        else {
          console.error("Invalid chat data received:", response.data);
        }
      })
      .catch(error => {
        if (error.response && error.response.data && error.response.data.message === "Chat already exists") {
          toast.info("You are already looking for a new chat, please wait until you are matched with someone.", {
            style: { backgroundColor: "#222222", color: "#DDDDDD" },
            closeButton: <CustomCloseButton />
          });
        } else {
          console.error("Error fetching chat:", error);
        }
      });
  }

  function sortChats(chx) {
    const sortedChats = [...chx].sort((a, b) => {
      const aLastMsgTime = a.recentMessages.length > 0 ? new Date(a.recentMessages[a.recentMessages.length - 1].date) : new Date(0);
      const bLastMsgTime = b.recentMessages.length > 0 ? new Date(b.recentMessages[b.recentMessages.length - 1].date) : new Date(0);
      return bLastMsgTime - aLastMsgTime;
    });
    return sortedChats
  }

  function handleSend(e) {
    e.preventDefault();
    const messageInput = e.target[1].value;
    if (messageInput === "") return;
    console.log("Sending message");
    console.log("User ID: ", userRef.current.id);
    console.log(activeChat);
    console.log(userRef.current);
    const newMessage = { Content: messageInput, ChatId: activeChat.id, UserId: userRef.current.id };
    console.log(newMessage);
    axios.post("https://localhost:7141/api/Message", newMessage)
      .then(response => {
        console.log("Message sent:", response.data);
        console.log(activeChat);
        let updatedChats = userRef.current.chats.map(chat => {
          if (chat.id === activeChat.id) {
            return {
              ...chat,
              recentMessages: response.data.data.recentMessages || []
            };
          }
          return chat;
        });
        updatedChats = sortChats(updatedChats);
        setChats(updatedChats);
        userRef.current.chats = updatedChats;
        setActiveChat(userRef.current.chats.find(chat => chat.id === activeChat.id));
        e.target[1].value = "";
        scrollToBottom();
      })
      .catch(error => {
        console.error("Error sending message:", error);
      });
  }

  function getMoreMessages(e) {
    e.preventDefault();
    console.log("Getting more messages");

    previousScrollHeightRef.current = chatContainerRef.current.scrollHeight;

    axios.get("https://localhost:7141/api/Message", { params: { id: activeChat.recentMessages[0].id - 1, chatId: activeChat.id, userId: userRef.current.id } })
      .then(response => {
        console.log(activeChat);
        if (response.data.data.recentMessages.length === 0) {
          return;
        }

        let updatedChats = userRef.current.chats.map(chat => {
          if (chat.id === activeChat.id) {
            const existingMessages = chat.recentMessages || [];
            const newMessages = response.data.data.recentMessages || [];

            return {
              ...chat,
              recentMessages: [...newMessages, ...existingMessages]
            };
          }
          return chat;
        });
        updatedChats = sortChats(updatedChats);
        setChats(updatedChats);
        userRef.current.chats = updatedChats;
        setActiveChat(userRef.current.chats.find(chat => chat.id === activeChat.id));
      })
      .catch(error => {
        console.error("Error getting more messages:", error);
      });
  }

  function handleLeave(id) {
    axios.delete(`https://localhost:7141/api/Chat/${id}`).then(response => {
      if (response.data.success) {
        console.log("Left chat:", id);
        let updatedChats = userRef.current.chats.filter(chat => chat.id !== id);
        setChats(sortChats(updatedChats));
        userRef.current.chats = updatedChats;
        handleClose();
      }
    }).catch(error => {
      console.error("Error leaving chat:", error);
    });
  }


  return (
    <>
      <style>
        {`
          html, body {
            overflow-x: hidden;
          }
        `}
      </style>
      <ToastContainer position="top-right" autoClose={5000} />
      {!isLoggedIn && (
        <>
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 999 }}></div>
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)", zIndex: 1000 }}>
            <h1>You are not logged in</h1>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", flex: "3" }}>
              <p style={{ margin: "0", marginRight: "5px", marginTop: "5px" }}>Please </p>
              <a href="/login" style={{ textDecoration: "none", marginTop: "5px" }}>Log in </a>
              <p style={{ margin: "0", marginLeft: "5px", marginTop: "5px" }}>to access your chats</p>
            </div>
          </div>
        </>
      )}
      <div style={{ backgroundColor: "#222831", display: "grid", gridTemplateRows: "repeat(10, 1fr)", gridTemplateColumns: "repeat(15, 1fr)", height: "100vh", width: "100vw" }}>
        <div style={{ gridColumnStart: "1", gridColumnEnd: "16", gridRowStart: "1", gridRowEnd: "11", backgroundColor: "#222831", borderRadius: "20px", display: "flex" }}>
          <div onClick={handleClose} style={{ flex: "3", backgroundColor: "#1e1e1e", borderRadius: "20px", overflowY: "auto", height: "100%", overflowX: "hidden" }}>
            {chats.map(chat => (
              <div key={chat.id} style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start", borderBottom: "1px solid #000", backgroundColor: "#414141", borderRadius: "20px", border: "2px solid black", transition: "background-color 0.3s ease" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#616161"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#414141"} onClick={(e) => handleOpen(chat, e)}>
                <div style={{ display: "flex", color: "#CCCCCC", alignSelf: "flex-start", marginBottom: "10%", marginTop: "5%", marginLeft: "5%", width: "100%" }}>
                  <div style={{color:"#FFFFFF", flex: "2" }}>{chat.name}</div>
                  <div style={{color:"#FFFFFF", flex: "3", textAlign: "right", marginRight: "10%" }}>  {chat.recentMessages.length > 0 ? formatDate(chat.recentMessages[chat.recentMessages.length - 1].date) : ""}</div>
                </div>
                <div style={{ color: "#CCCCCC", marginBottom: "5%", marginLeft: "5%" }}>
                  {chat.recentMessages && chat.recentMessages.length > 0 ? (
                    chat.recentMessages[chat.recentMessages.length - 1].content.length > 30 ?
                      getName(chat.id) + ": " + chat.recentMessages[chat.recentMessages.length - 1].content.substring(0, 29 - getName(chat.id).length) + "..." :
                      getName(chat.id) + ": " + chat.recentMessages[chat.recentMessages.length - 1].content
                  ) : ""}
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "15%", borderBottom: "1px solid #000", backgroundColor: "#414141", borderRadius: "20px", border: "2px solid black", }}>
              <button onClick={getChat} style={{ width: "50%", height: "50%", backgroundColor: "#111111", color: "#DDDDDD", borderRadius: "10px" }}>Find a new chat</button>
              <button onClick={() => {setIsLoggedIn(false); localStorage.clear(); window.location.reload(); }} style={{ width: "50%", height: "50%", backgroundColor: "#6B0000", color: "#DDDDDD", borderRadius: "10px" }}>Log out</button>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: "9", backgroundColor: "#161717", borderRadius: "20px" }}>
            {!isChatOpen && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#161717", width: "30%", height: "30%", borderRadius: "10px" }}>
                <button onClick={getChat} style={{ width: "50%", height: "50%", backgroundColor: "#111111", color: "#DDDDDD", borderRadius: "10px" }}>Find a new chat</button>
              </div>
            )}
            {isChatOpen && (
              <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
                <div style={{ display: "flex", flexDirection: "column", flex: "15", backgroundColor: "#161717", borderRadius: "20px", border: "2px solid gray", width: "100%", overflowY: "auto", overflowX: "hidden" }}>
                  <div style={{ display: "flex", flex: "0.7" }}>
                    <div style={{ height: "100%", display: "flex", justifyContent: "flex-start", paddingLeft: "10px", alignItems: "center", backgroundColor: "#161717", color: "#DDDDDD", width: "100%", }}>{activeChat.name}</div>
                    <button onClick={() => { handleLeave(activeChat.id); }} style={{ height: "70%", width: "3%", borderRadius: "10px", marginRight: "20px", marginTop: "5px", backgroundColor: "#222222", color: "#DDDDDD" }}><img src={logoutImg} alt="Logout" style={{ height: "100%", width: "100%", objectFit: "contain" }} /></button>
                  </div>
                  {activeChat && activeChat.recentMessages && (
                    <div ref={chatContainerRef} onScroll={(event) => handleTopScroll(event)} style={{ display: "flex", flexDirection: "column", flex: "9", backgroundColor: "#161717", borderRadius: "20px", border: "2px solid gray", width: "100%", overflowY: "auto" }}>
                      {activeChat.recentMessages.map(message => (
                        <div key={message.id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", padding: "15px", borderBottom: "1px solid #000", backgroundColor: message.userId === userRef.current.id ? "#020202" : "#222222", borderRadius: "20px", border: "2px solid gray", width: "30%", alignSelf: message.userId === userRef.current.id ? "flex-end" : "flex-start" }}>
                          <p style={{ color: "#DDDDDD", flex: "1", wordWrap: "break-word", whiteSpace: "pre-wrap", width: "100%", overflowWrap: "break-word", wordBreak: "break-word" }}>
                            {message.content}
                          </p>
                          <p style={{ color: "#DDDDDD", flex: "1", fontSize: "30%", textAlign: "left", width: "100%" }}>
                            {formatDate(message.date)}
                          </p>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
                <form onSubmit={handleSend} style={{ flex: "1", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#282829", borderRadius: "20px", border: "2px solid gray" }}>
                  <button type="submit" style={{ flex: "1", borderRadius: "20px", backgroundColor: "#313131", color: "white", height: "60%" }}>Send</button>
                  <input type="text" style={{ color: "#DDDDDD", flex: "9", borderRadius: "20px", backgroundColor: "#3d3d3e", height: "60%" }} />
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

Interface.propTypes = {
  closeToast: PropTypes.func.isRequired,
};

export default Interface;