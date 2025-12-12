import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  List,
  Tag,
  Typography,
  Progress,
  Space,
  Skeleton,
  message,
} from "antd";
import { RiseOutlined, ShoppingCartOutlined, TeamOutlined, DollarOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import api from "../../api/axiosClient";
import { formatVnd } from "../../utils/currency";

const { Title, Text } = Typography;

const AdminSales = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!user) {
      navigate("/login?returnUrl=/admin/sales");
      return;
    }
    if (!user.isAdmin) {
      message.error("Bạn không có quyền truy cập trang này");
      navigate("/");
      return;
    }
    loadOrders();
  }, [user, navigate, authLoading]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/orders");
      setOrders(res.data || []);
    } catch (error) {
      message.error("Không thể tải dữ liệu doanh số");
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    const defaultSummary = {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      deliveredOrders: 0,
      pendingOrders: 0,
      monthly: [],
      topProducts: [],
      topCustomers: [],
    };
    if (!orders || orders.length === 0) return defaultSummary;

    const isOrderCancelled = (order) => {
      return order.isCancelled === true || order.cancelStatus === 'approved';
    };

    let revenue = 0;
    let delivered = 0;
    let pending = 0;
    const monthlyMap = {};
    const productMap = {};
    const customerMap = {};

    orders.forEach((order) => {
      const isCancelled = isOrderCancelled(order);
      
      const totalPrice = Number(order.totalPrice) || 0;
      const created = order.createdAt ? new Date(order.createdAt) : new Date();
      const monthKey = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}`;

      if (!isCancelled && (order.isPaid || order.deliveryStatus === "delivered")) {
        revenue += totalPrice;
      }
      if (order.deliveryStatus === "delivered" && !isCancelled) delivered += 1;
      if (!order.isPaid || ["pending", "preparing", "shipping"].includes(order.deliveryStatus)) {
        pending += 1;
      }

      if (!isCancelled) {
        monthlyMap[monthKey] = monthlyMap[monthKey] || { month: monthKey, revenue: 0, orders: 0 };
        monthlyMap[monthKey].revenue += totalPrice;
        monthlyMap[monthKey].orders += 1;
      }

      if (!isCancelled) {
        order.orderItems?.forEach((item) => {
          const key = item.product || item.name;
          if (!productMap[key]) {
            productMap[key] = {
              name: item.name,
              qty: 0,
              revenue: 0,
            };
          }
          productMap[key].qty += item.qty || 0;
          productMap[key].revenue += (item.price || 0) * (item.qty || 0);
        });
      }

      if (!isCancelled) {
        const customerKey = order.user?.email || order.user?._id || "unknown";
        if (!customerMap[customerKey]) {
          customerMap[customerKey] = {
            name: order.user?.username || order.user?.email || "Khách lẻ",
            email: order.user?.email || "—",
            total: 0,
            orders: 0,
          };
        }
        customerMap[customerKey].total += totalPrice;
        customerMap[customerKey].orders += 1;
      }
    });

    const monthly = Object.values(monthlyMap).sort((a, b) => (a.month > b.month ? 1 : -1)).slice(-6);
    const topProducts = Object.values(productMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
    const topCustomers = Object.values(customerMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const validOrdersCount = orders.filter(order => {
      return !(order.isCancelled === true || order.cancelStatus === 'approved');
    }).length;

    return {
      totalRevenue: revenue,
      totalOrders: orders.length,
      avgOrderValue: validOrdersCount > 0 ? revenue / validOrdersCount : 0,
      deliveredOrders: delivered,
      pendingOrders: pending,
      monthly,
      topProducts,
      topCustomers,
    };
  }, [orders]);

  const monthlyColumns = [
    {
      title: "Tháng",
      dataIndex: "month",
      key: "month",
      width: 120,
      render: (value) => value.replace("-", "/"),
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      render: (value) => formatVnd(value),
    },
    {
      title: "Số đơn",
      dataIndex: "orders",
      key: "orders",
    },
    {
      title: "Hiệu suất",
      key: "progress",
      render: (_, record, __, arr) => {
        const maxRevenue = Math.max(...summary.monthly.map((m) => m.revenue), 1);
        return (
          <Progress
            percent={Math.round((record.revenue / maxRevenue) * 100)}
            showInfo={false}
            size="small"
          />
        );
      },
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active paragraph={{ rows: 12 }} />
      </div>
    );
  }

  return (
    <div style={{ width: "100%", padding: 16 }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={summary.totalRevenue}
              formatter={(value) => formatVnd(Number(value))}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={summary.totalOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Giá trị trung bình"
              value={summary.avgOrderValue}
              precision={0}
              formatter={(value) => formatVnd(Number(value))}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
          <Statistic
            title="Khách đã giao"
            value={summary.deliveredOrders}
            suffix={`/ ${summary.totalOrders}`}
            prefix={<TeamOutlined />}
          />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="Doanh thu 6 tháng gần nhất" extra={<Tag>{summary.monthly.length} tháng</Tag>}>
            <Table
              rowKey={(record) => record.month}
              columns={monthlyColumns}
              dataSource={summary.monthly}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Sản phẩm bán chạy" extra={<Tag>{summary.topProducts.length} sản phẩm</Tag>}>
            <List
              dataSource={summary.topProducts}
              locale={{ emptyText: "Chưa có dữ liệu" }}
              renderItem={(item, index) => (
                <List.Item>
                  <Space direction="vertical" size={0} style={{ width: "100%" }}>
                    <Space style={{ justifyContent: "space-between", width: "100%" }}>
                      <Text strong>{index + 1}. {item.name}</Text>
                      <Tag color="blue">{item.qty} bộ</Tag>
                    </Space>
                    <Text type="secondary">Doanh thu: {formatVnd(item.revenue)}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={10}>
          <Card title="Khách hàng thân thiết">
            <List
              dataSource={summary.topCustomers}
              locale={{ emptyText: "Chưa có dữ liệu" }}
              renderItem={(item, index) => (
                <List.Item>
                  <Space direction="vertical" size={0}>
                    <Text strong>{index + 1}. {item.name}</Text>
                    <Text type="secondary">{item.email}</Text>
                  </Space>
                  <div style={{ textAlign: "right" }}>
                    <Tag color="green">{item.orders} đơn</Tag>
                    <div>{formatVnd(item.total)}</div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card
            title="Tình trạng xử lý"
            extra={
              <Text type="secondary">
                {summary.pendingOrders} đơn đang chờ xử lý
              </Text>
            }
          >
            <Progress
              percent={
                summary.totalOrders
                  ? Math.round((summary.deliveredOrders / summary.totalOrders) * 100)
                  : 0
              }
              status="active"
              strokeColor="#4ade80"
              format={(percent) => `${percent}% đã giao`}
            />
            <div style={{ marginTop: 12 }}>
              <Tag color="blue">Đang chờ: {summary.pendingOrders}</Tag>
              <Tag color="green">Đã giao: {summary.deliveredOrders}</Tag>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminSales;

