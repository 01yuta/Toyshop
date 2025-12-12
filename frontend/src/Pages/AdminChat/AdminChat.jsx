import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  List,
  Typography,
  Input,
  Button,
  Tag,
  Spin,
  Empty,
  message,
  Space,
} from "antd";
import { MessageOutlined, SendOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import {
  fetchConversations,
  fetchConversationMessages,
  sendSupportMessage,
} from "../../api/supportApi";

const { Title, Text } = Typography;

const AdminChat = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!user) {
      navigate("/login?returnUrl=/admin/chat");
      return;
    }
    if (!user.isAdmin) {
      message.error("Bạn không có quyền truy cập trang này");
      navigate("/");
      return;
    }
    loadConversations();
  }, [user, navigate, authLoading]);

  const loadConversations = async () => {
    try {
      setLoadingConversations(true);
      const data = await fetchConversations();
      setConversations(data);
      if (data?.length && !selected) {
        handleSelectConversation(data[0]);
      }
    } catch (error) {
      message.error("Không thể tải danh sách hội thoại");
    } finally {
      setLoadingConversations(false);
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelected(conversation);
    if (conversation?._id) {
      loadMessages(conversation._id);
    } else {
      setMessages([]);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      setLoadingMessages(true);
      const data = await fetchConversationMessages(conversationId);
      setMessages(data || []);
    } catch (error) {
      message.error("Không thể tải tin nhắn");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = async () => {
    if (!messageInput.trim() || !selected?._id) return;
    try {
      setSending(true);
      await sendSupportMessage({
        conversationId: selected._id,
        message: messageInput.trim(),
        senderName: user?.username || user?.email || "Admin",
      });
      setMessageInput("");
      await loadMessages(selected._id);
      await loadConversations();
    } catch (error) {
      message.error("Không thể gửi tin nhắn");
    } finally {
      setSending(false);
    }
  };

  const conversationTitle = useMemo(() => {
    if (!selected) return "Chọn khách hàng";
    return selected.customerName || selected.customerEmail || selected._id;
  }, [selected]);

  return (
    <div style={{ width: "100%", padding: 16 }}>
      <Title level={3} style={{ marginBottom: 16 }}>
        Trung tâm hỗ trợ khách hàng
      </Title>
      <div
        style={{
          display: "flex",
          gap: 16,
          flexDirection: "column",
        }}
      >
        <Button icon={<ReloadOutlined />} onClick={loadConversations} style={{ alignSelf: "flex-end" }}>
          Làm mới
        </Button>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "320px 1fr",
            gap: 16,
            width: "100%",
          }}
        >
          <Card
            title="Khách hàng"
            bodyStyle={{ padding: 0 }}
            style={{ minHeight: 480 }}
          >
            {loadingConversations ? (
              <div style={{ textAlign: "center", padding: 24 }}>
                <Spin />
              </div>
            ) : (
              <List
                dataSource={conversations}
                locale={{ emptyText: "Chưa có hội thoại" }}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      cursor: "pointer",
                      background:
                        selected?._id === item._id ? "#eef2ff" : "transparent",
                      borderLeft:
                        selected?._id === item._id ? "3px solid #6366f1" : "3px solid transparent",
                    }}
                    onClick={() => handleSelectConversation(item)}
                  >
                    <Space direction="vertical" size={2} style={{ width: "100%" }}>
                      <Text strong>{item.customerName || item.customerEmail || item._id}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.lastMessage?.slice(0, 60) || "—"}
                      </Text>
                      <Space size={8}>
                        {item.unreadCount > 0 && <Tag color="red">{item.unreadCount} chưa đọc</Tag>}
                        <Tag color="default">
                          {new Date(item.lastMessageAt).toLocaleString("vi-VN")}
                        </Tag>
                      </Space>
                    </Space>
                  </List.Item>
                )}
              />
            )}
          </Card>
          <Card
            title={
              <Space>
                <MessageOutlined />
                <span>{conversationTitle}</span>
              </Space>
            }
            style={{ minHeight: 480, display: "flex", flexDirection: "column" }}
            bodyStyle={{ display: "flex", flexDirection: "column", flex: 1, paddingBottom: 0 }}
          >
            {selected ? (
              <>
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    paddingRight: 8,
                    marginBottom: 16,
                  }}
                >
                  {loadingMessages ? (
                    <div style={{ textAlign: "center", padding: 24 }}>
                      <Spin />
                    </div>
                  ) : messages.length ? (
                    messages.map((msg) => {
                      const isAdmin = msg.senderType === "admin";
                      return (
                        <div
                          key={msg._id}
                          style={{
                            marginBottom: 12,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: isAdmin ? "flex-end" : "flex-start",
                          }}
                        >
                          <div
                            style={{
                              background: isAdmin ? "#4f46e5" : "#f3f4f6",
                              color: isAdmin ? "#fff" : "#111827",
                              padding: "8px 12px",
                              borderRadius: 12,
                              maxWidth: "80%",
                            }}
                          >
                            {msg.message}
                          </div>
                          <Text type="secondary" style={{ fontSize: 11, marginTop: 4 }}>
                            {msg.senderName || (isAdmin ? "Admin" : "Khách hàng")} •{" "}
                            {new Date(msg.createdAt).toLocaleString("vi-VN")}
                          </Text>
                        </div>
                      );
                    })
                  ) : (
                    <Empty description="Chưa có tin nhắn" />
                  )}
                </div>
                <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 12 }}>
                  <Input.TextArea
                    rows={3}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Nhập tin nhắn trả lời khách hàng..."
                  />
                  <div style={{ textAlign: "right", marginTop: 8 }}>
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleSend}
                      loading={sending}
                      disabled={!messageInput.trim()}
                    >
                      Gửi
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Empty description="Chọn một khách hàng để bắt đầu chat" />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;

