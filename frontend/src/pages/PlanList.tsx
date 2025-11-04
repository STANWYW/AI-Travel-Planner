import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Card,
  Button,
  Empty,
  message,
  Row,
  Col,
  Tag,
  Space,
  Typography,
  Input,
  Select,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  DollarOutlined,
  EyeOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getTravelPlans, deleteTravelPlan, TravelPlan } from '../services/travelPlanService';

const { Content } = Layout;
const { Title } = Typography;
const { Search } = Input;

const PlanList: React.FC = () => {
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    filterPlans();
  }, [plans, searchText, statusFilter]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await getTravelPlans();
      setPlans(data);
    } catch (error: any) {
      message.error('加载失败：' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const filterPlans = () => {
    let filtered = [...plans];

    // 搜索过滤
    if (searchText) {
      filtered = filtered.filter(
        (plan) =>
          plan.title.toLowerCase().includes(searchText.toLowerCase()) ||
          plan.destination.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // 状态过滤
    if (statusFilter !== 'all') {
      filtered = filtered.filter((plan) => plan.status === statusFilter);
    }

    setFilteredPlans(filtered);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`确定要删除"${title}"吗？`)) {
      return;
    }

    try {
      await deleteTravelPlan(id);
      message.success('删除成功');
      loadPlans();
    } catch (error: any) {
      message.error('删除失败：' + (error.response?.data?.error || error.message));
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap: { [key: string]: { color: string; text: string } } = {
      draft: { color: 'default', text: '草稿' },
      confirmed: { color: 'blue', text: '已确认' },
      completed: { color: 'green', text: '已完成' },
    };
    const statusInfo = statusMap[status] || { color: 'default', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const calculateTotalExpense = (expenses: any[] = []) => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 24 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={2} style={{ margin: 0 }}>我的旅行计划</Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => navigate('/create-plan')}
              >
                创建新计划
              </Button>
            </div>

            <Space size="middle" style={{ width: '100%' }}>
              <Search
                placeholder="搜索目的地或标题"
                allowClear
                style={{ width: 300 }}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Select
                value={statusFilter}
                style={{ width: 150 }}
                onChange={setStatusFilter}
              >
                <Select.Option value="all">全部状态</Select.Option>
                <Select.Option value="draft">草稿</Select.Option>
                <Select.Option value="confirmed">已确认</Select.Option>
                <Select.Option value="completed">已完成</Select.Option>
              </Select>
            </Space>
          </Space>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : filteredPlans.length === 0 ? (
          <Empty
            description="还没有旅行计划"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => navigate('/create-plan')}>
              创建第一个计划
            </Button>
          </Empty>
        ) : (
          <Row gutter={[16, 16]}>
            {filteredPlans.map((plan) => {
              const totalExpense = calculateTotalExpense(plan.expenses);
              const budgetUsed = (totalExpense / plan.budget) * 100;

              return (
                <Col xs={24} sm={24} md={12} lg={8} key={plan.id}>
                  <Card
                    hoverable
                    actions={[
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/plans/${plan.id}`)}
                      >
                        查看详情
                      </Button>,
                      <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(plan.id, plan.title)}
                      >
                        删除
                      </Button>,
                    ]}
                  >
                    <Space direction="vertical" style={{ width: '100%' }} size="small">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Title level={4} style={{ margin: 0 }}>{plan.title}</Title>
                        {getStatusTag(plan.status)}
                      </div>

                      <Space>
                        <EnvironmentOutlined />
                        <span>{plan.destination}</span>
                      </Space>

                      <Space>
                        <CalendarOutlined />
                        <span>
                          {dayjs(plan.startDate).format('YYYY-MM-DD')} ~{' '}
                          {dayjs(plan.endDate).format('YYYY-MM-DD')}
                          <Tag style={{ marginLeft: 8 }}>{plan.days} 天</Tag>
                        </span>
                      </Space>

                      <Space>
                        <UserOutlined />
                        <span>{plan.travelers} 人</span>
                      </Space>

                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                          <DollarOutlined />
                          <span>
                            预算：¥{plan.budget.toLocaleString()} 
                            {totalExpense > 0 && (
                              <span style={{ marginLeft: 8, color: budgetUsed > 100 ? '#ff4d4f' : '#52c41a' }}>
                                （已用 {budgetUsed.toFixed(0)}%）
                              </span>
                            )}
                          </span>
                        </Space>
                      </Space>

                      {plan.itinerary && (
                        <Tag color="success">AI 已生成行程</Tag>
                      )}
                    </Space>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Content>
    </Layout>
  );
};

export default PlanList;

