import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  Select,
  Input,
  DatePicker,
  Space,
  Statistic,
  Progress,
  message,
  Popconfirm,
  Typography,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { expenseService, Expense, ExpenseStatistics } from '../services/expenseService';
import dayjs from 'dayjs';

const { Title } = Typography;

interface ExpenseManagerProps {
  travelPlanId: string;
  budget: number;
}

const ExpenseManager: React.FC<ExpenseManagerProps> = ({ travelPlanId, budget }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [statistics, setStatistics] = useState<ExpenseStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadExpenses();
  }, [travelPlanId]);

  const loadExpenses = async () => {
    try {
      const { expenses: expList, statistics: stats } = await expenseService.getByPlanId(
        travelPlanId
      );
      setExpenses(expList);
      setStatistics(stats);
    } catch (error) {
      message.error('加载费用失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (values: any) => {
    try {
      await expenseService.add(travelPlanId, {
        ...values,
        date: values.date.toISOString(),
      });
      message.success('费用已添加');
      setModalVisible(false);
      form.resetFields();
      loadExpenses();
    } catch (error) {
      message.error('添加失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await expenseService.delete(id);
      message.success('费用已删除');
      loadExpenses();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => {
        const categoryMap: Record<string, string> = {
          transportation: '交通',
          accommodation: '住宿',
          food: '餐饮',
          shopping: '购物',
          entertainment: '娱乐',
          other: '其他',
        };
        return categoryMap[category] || category;
      },
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `¥${amount.toLocaleString()}`,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Expense) => (
        <Popconfirm
          title="确定要删除这条费用吗？"
          onConfirm={() => handleDelete(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const usedAmount = statistics?.total || 0;
  const remaining = budget - usedAmount;
  const percent = (usedAmount / budget) * 100;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4}>费用统计</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
            >
              添加费用
            </Button>
          </div>

          <Space size="large" wrap>
            <Statistic title="总预算" value={budget} prefix="¥" />
            <Statistic title="已使用" value={usedAmount} prefix="¥" />
            <Statistic title="剩余" value={remaining} prefix="¥" valueStyle={{ color: remaining < 0 ? '#cf1322' : '#3f8600' }} />
          </Space>

          <Progress
            percent={Math.min(percent, 100)}
            status={percent > 100 ? 'exception' : 'active'}
            format={() => `${percent.toFixed(1)}%`}
            strokeColor={percent > 80 ? '#faad14' : undefined}
          />
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={expenses}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="添加费用"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdd}
          initialValues={{
            currency: 'CNY',
            category: 'food',
            date: dayjs(),
          }}
        >
          <Form.Item
            name="category"
            label="类别"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="transportation">交通</Select.Option>
              <Select.Option value="accommodation">住宿</Select.Option>
              <Select.Option value="food">餐饮</Select.Option>
              <Select.Option value="shopping">购物</Select.Option>
              <Select.Option value="entertainment">娱乐</Select.Option>
              <Select.Option value="other">其他</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label="金额"
            rules={[{ required: true, message: '请输入金额' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              prefix="¥"
              placeholder="0.00"
            />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="费用说明（可选）" />
          </Form.Item>

          <Form.Item
            name="date"
            label="日期"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              添加
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default ExpenseManager;
