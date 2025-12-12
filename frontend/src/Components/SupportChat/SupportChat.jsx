import React, { useEffect, useState, useRef } from "react";
import { Button, Card, Input, Space, Typography, message as antdMessage, Empty, Spin, Badge } from "antd";
import { CustomerServiceOutlined, SendOutlined, CloseOutlined } from "@ant-design/icons";
import { useAuth } from "../../Context/AuthContext";
import { fetchMySupportMessages, sendSupportMessage } from "../../api/supportApi";

const { Text } = Typography;

const SupportChat = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open && messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, open]);

  const loadMessages = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await fetchMySupportMessages();
      setMessages(data || []);
    } catch (error) {
      console.error("Failed to load support messages", error);
      antdMessage.error("Không thể tải lịch sử hỗ trợ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && user) {
      loadMessages();
    }
  }, [open, user]);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!user) {
      antdMessage.info("Vui lòng đăng nhập để chat với admin");
      return;
    }
    try {
      setSending(true);
      await sendSupportMessage({
        message: input.trim(),
        senderName: user.username || user.email || "Khách hàng",
      });
      setInput("");
      await loadMessages();
    } catch (error) {
      console.error("Failed to send support message", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể gửi tin nhắn";
      
      if (error?.response?.status === 401) {
        antdMessage.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
      } else if (error?.response?.status === 400) {
        antdMessage.error(errorMessage);
      } else {
        antdMessage.error("Không thể gửi tin nhắn, vui lòng thử lại");
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleOpen = () => {
    setOpen((prev) => !prev);
  };

  const unreadCount = messages.filter(
    (msg) => msg.senderType === "admin" && !msg.isRead
  ).length;

  return (
    <>
      <Badge count={open ? 0 : unreadCount} offset={[-5, 5]}>
        <Button
          type="primary"
          size="large"
          icon={<CustomerServiceOutlined />}
          onClick={toggleOpen}
          style={{
            position: "fixed",
            right: 24,
            bottom: 24,
            zIndex: 1000,
            borderRadius: 999,
            height: 56,
            width: 56,
            padding: 0,
            boxShadow: "0 8px 24px rgba(24, 144, 255, 0.4)",
            background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
            border: "none",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 12px 32px rgba(24, 144, 255, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(24, 144, 255, 0.4)";
          }}
        />
      </Badge>

      {open && (
        <Card
          title={
            <Space>
              <CustomerServiceOutlined style={{ color: "#1890ff", fontSize: 18 }} />
              <span style={{ fontWeight: 600 }}>Chat với admin</span>
            </Space>
          }
          extra={
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={toggleOpen}
              size="small"
              style={{ color: "#6b7280" }}
            />
          }
          style={{
            position: "fixed",
            right: 24,
            bottom: 96,
            width: 380,
            maxHeight: 600,
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
            borderRadius: 16,
            border: "none",
            animation: "slideUp 0.3s ease-out",
          }}
          bodyStyle={{
            display: "flex",
            flexDirection: "column",
            padding: "16px",
            height: "100%",
          }}
        >
          {!user && (
            <div
              style={{
                background: "#fef3c7",
                border: "1px solid #fde68a",
                borderRadius: 8,
                padding: "12px",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 13, color: "#92400e" }}>
                Bạn cần đăng nhập để trao đổi với admin.
              </Text>
            </div>
          )}

          <div
            ref={messagesContainerRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "8px 4px",
              marginBottom: 12,
              minHeight: 200,
              maxHeight: 400,
            }}
          >
            {loading ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <Spin size="large" />
              </div>
            ) : messages.length ? (
              <>
                {messages.map((msg) => {
                  const isCustomer = msg.senderType === "customer";
                  const time = new Date(msg.createdAt);
                  const isToday = time.toDateString() === new Date().toDateString();
                  const timeStr = isToday
                    ? time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
                    : time.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

                  return (
                    <div
                      key={msg._id}
                      style={{
                        marginBottom: 16,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isCustomer ? "flex-end" : "flex-start",
                        animation: "fadeIn 0.3s ease-out",
                      }}
                    >
                      <div
                        style={{
                          padding: "10px 14px",
                          borderRadius: isCustomer ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                          maxWidth: "75%",
                          fontSize: 14,
                          lineHeight: 1.5,
                          wordWrap: "break-word",
                          background: isCustomer
                            ? "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)"
                            : "#f3f4f6",
                          color: isCustomer ? "#fff" : "#1f2937",
                          boxShadow: isCustomer
                            ? "0 2px 8px rgba(24, 144, 255, 0.3)"
                            : "0 1px 3px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        {msg.message}
                      </div>
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 11,
                          marginTop: 4,
                          paddingLeft: isCustomer ? 0 : 8,
                          paddingRight: isCustomer ? 8 : 0,
                          color: "#9ca3af",
                        }}
                      >
                        {msg.senderType === "admin" ? "Admin" : "Bạn"} • {timeStr}
                      </Text>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Chưa có tin nhắn. Hãy gửi tin nhắn đầu tiên!
                  </Text>
                }
                style={{ padding: "40px 0" }}
              />
            )}
          </div>

          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              paddingTop: 12,
              background: "#fff",
            }}
          >
            <Input.TextArea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                user
                  ? "Nhập nội dung cần hỗ trợ... (Enter để gửi)"
                  : "Đăng nhập để gửi tin nhắn..."
              }
              disabled={!user || sending}
              style={{
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                fontSize: 14,
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                loading={sending}
                disabled={!user || !input.trim()}
                style={{
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                  border: "none",
                  height: 36,
                  fontWeight: 500,
                }}
              >
                Gửi
              </Button>
            </div>
          </div>
        </Card>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default SupportChat;


