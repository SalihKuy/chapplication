import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import * as signalR from "@microsoft/signalr";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PropTypes from "prop-types";
import logoutImg from "./assets/logout.png";
import API_BASE_URL from "./config.js";
import "./Interface.css";

function Interface() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [connection, setConnection] = useState(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const previousScrollHeightRef = useRef(0);
  const userRef = useRef(null);

  const CustomCloseButton = ({ closeToast }) => (
    <button onClick={closeToast} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
      ✕
    </button>
  );

  CustomCloseButton.propTypes = {
    closeToast: PropTypes.func.isRequired,
  };
  useEffect(() => {
    async function fetchUser() {
      try {
        const userId = localStorage.getItem("id");
        const response = await axios.get(`${API_BASE_URL}/api/User/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            'ngrok-skip-browser-warning': 'true'
          }
        });

        if (response.data.success === true) {
          userRef.current = response.data.data;

          if (userRef.current) {
            setIsLoggedIn(true);
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
        const userId = localStorage.getItem("id");
        const response = await axios.get(`${API_BASE_URL}/api/User/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            'ngrok-skip-browser-warning': 'true'
          }
        });

        if (response.data.success === true) {
          userRef.current = response.data.data;

          if (userRef.current) {
            setIsLoggedIn(true);
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
      .withUrl(`${API_BASE_URL}/chathub`)
      .withAutomaticReconnect()
      .build();

    setConnection(connection);

    connection.on("ReceiveMessage", (userId, message) => {
      if (userId === "2147483647") {
        fetchUser();
      }

      if (userId === userRef.current.id && activeChat && activeChat.id === message.ChatId) {
        return;
      } else if (!activeChat) {
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
      } else if (userId !== userRef.current.id && activeChat && activeChat.id !== message.ChatId) {
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
        let newmessage = {
          id: message.Id,
          chatId: message.ChatId,
          content: message.Content,
          date: message.Date,
          userId: message.UserId
        }
        if (prevChat && prevChat.id === message.ChatId) {
          const updatedMessages = [...prevChat.recentMessages, newmessage];
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
          });
          connection.invoke("JoinChatGroup", "2147483647")
            .catch(err => console.error("Error joining group:", err.toString()));
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
        startSignalRConnection();
      }
    }
  }, [connection, startSignalRConnection]);

  function getName(chatId) {
    const ch = chats.find(chat => chat.id === chatId);
    if (userRef.current.id === ch.recentMessages[ch.recentMessages.length - 1].userId) {
      return userRef.current.name;
    } else {
      if (ch.name.split(" ")[0] === userRef.current.name) {
        return ch.name.split(" ")[2];
      } else {
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
      scrollToBottom();
    }, 0);
  }

  function getChat() {
    if (!userRef.current || typeof userRef.current.id === "undefined") {
      console.error("User ID is not found in the stored user object:", userRef.current);
      return;
    }

    setIsLoading(true);
    const userId = userRef.current.id;

    axios.post(`${API_BASE_URL}/api/Chat?userId=${userId}`, {}, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    })
      .then(response => {
        if (response.data && response.data.success) {
          const chat = response.data.data;
          setChats(prevChats => [...prevChats, chat]);
          userRef.current.chats = [...chats, chat];
        } else {
          console.error("Invalid chat data received:", response.data);
        }
      })
      .catch(error => {
        if (error.response && error.response.data && error.response.data.message === "Chat already exists") {
          toast.info("You are already looking for a new chat, please wait until you are matched with someone.", {
            style: { backgroundColor: "#667eea", color: "white" }
          });
        } else {
          console.error("Error fetching chat:", error);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function sortChats(chx) {
    const sortedChats = [...chx].sort((a, b) => {
      const aLastMsgTime = a.recentMessages.length > 0 ? new Date(a.recentMessages[a.recentMessages.length - 1].date) : new Date(0);
      const bLastMsgTime = b.recentMessages.length > 0 ? new Date(b.recentMessages[b.recentMessages.length - 1].date) : new Date(0);
      return bLastMsgTime - aLastMsgTime;
    });
    return sortedChats;
  }

  function handleSend(e) {
    e.preventDefault();
    if (messageInput.trim() === "") return;
    
    setIsLoading(true);
    const newMessage = { Content: messageInput, ChatId: activeChat.id, UserId: userRef.current.id };
    
    axios.post(`${API_BASE_URL}/api/Message`, newMessage, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    })
      .then(response => {
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
        setMessageInput("");
        scrollToBottom();
      })
      .catch(error => {
        console.error("Error sending message:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function getMoreMessages(e) {
    e.preventDefault();
    previousScrollHeightRef.current = chatContainerRef.current.scrollHeight;

    axios.get(`${API_BASE_URL}/api/Message`, { 
      params: { id: activeChat.recentMessages[0].id - 1, chatId: activeChat.id, userId: userRef.current.id },
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    })
      .then(response => {
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
    axios.delete(`${API_BASE_URL}/api/Chat/${id}`).then(response => {
      if (response.data.success) {
        let updatedChats = userRef.current.chats.filter(chat => chat.id !== id);
        setChats(sortChats(updatedChats));
        userRef.current.chats = updatedChats;
        handleClose();
      }
    }).catch(error => {
      console.error("Error leaving chat:", error);
    });
  }

  function handleLogout() {
    setIsLoggedIn(false);
    localStorage.clear();
    window.location.reload();
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} />
      
      {!isLoggedIn && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h1 className="modal-title">Not Logged In</h1>
            <p className="modal-text">
              Please <a href="/login" className="modal-link">log in</a> to access your chats
            </p>
          </div>
        </div>
      )}

      <div className="interface-container">
        <div className="sidebar">
          <div className="sidebar-header">
            <h1 className="sidebar-title">Messages</h1>
            <div className="sidebar-controls">
              <button 
                className="btn-find-chat" 
                onClick={getChat}
                disabled={isLoading}
              >
                {isLoading ? <div className="loading-spinner"></div> : "Find Chat"}
              </button>
              <button className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
          
          <div className="chat-list">
            {chats.map(chat => (
              <div 
                key={chat.id} 
                className="chat-item"
                onClick={(e) => handleOpen(chat, e)}
              >
                <div className="chat-header">
                  <div className="chat-name">{chat.name}</div>
                  <div className="chat-date">
                    {chat.recentMessages.length > 0 ? formatDate(chat.recentMessages[chat.recentMessages.length - 1].date) : ""}
                  </div>
                </div>
                <div className="chat-preview">
                  {chat.recentMessages && chat.recentMessages.length > 0 ? (
                    chat.recentMessages[chat.recentMessages.length - 1].content.length > 30 ?
                      getName(chat.id) + ": " + chat.recentMessages[chat.recentMessages.length - 1].content.substring(0, 29 - getName(chat.id).length) + "..." :
                      getName(chat.id) + ": " + chat.recentMessages[chat.recentMessages.length - 1].content
                  ) : "No messages yet"}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="main-chat">
          {!isChatOpen ? (
            <div className="welcome-screen">
              <h1 className="welcome-title">Welcome to Chat</h1>
              <p className="welcome-subtitle">Select a conversation or start a new one</p>
              <button 
                className="btn-start-chat" 
                onClick={getChat}
                disabled={isLoading}
              >
                {isLoading ? <div className="loading-spinner"></div> : "Start New Chat"}
              </button>
            </div>
          ) : (
            <>
              <div className="chat-header-bar">
                <div className="chat-header-title">{activeChat.name}</div>
                <button 
                  className="btn-leave-chat" 
                  onClick={() => handleLeave(activeChat.id)}
                >
                  <img src={logoutImg} alt="Leave" className="logout-icon" />
                  Leave
                </button>
              </div>

              <div 
                className="messages-container"
                ref={chatContainerRef}
                onScroll={handleTopScroll}
              >
                {activeChat && activeChat.recentMessages && activeChat.recentMessages.map(message => (
                  <div 
                    key={message.id} 
                    className={`message ${message.userId === userRef.current.id ? 'own' : 'other'}`}
                  >
                    <p className="message-content">{message.content}</p>
                    <span className="message-time">{formatDate(message.date)}</span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="message-input-container">
                <form className="message-form" onSubmit={handleSend}>
                  <textarea
                    className="message-input"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type your message..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                  />
                  <button 
                    type="submit" 
                    className="btn-send"
                    disabled={isLoading || messageInput.trim() === ""}
                  >
                    {isLoading ? <div className="loading-spinner"></div> : "→"}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

Interface.propTypes = {
  closeToast: PropTypes.func,
};

export default Interface;
