import React, { useState } from 'react';
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  message,
  Space,
  Tag,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Expense, CreateExpenseData } from '../services/travelPlanService';
import { createExpense, updateExpense, deleteExpense } from '../services/expenseService';
import VoiceInput from './VoiceInput';

interface ExpenseManagerProps {
  travelPlanId: string;
  expenses: Expense[];
  budget: number;
  onRefresh: () => void;
}

const ExpenseManager: React.FC<ExpenseManagerProps> = ({
  travelPlanId,
  expenses,
  budget,
  onRefresh,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const categoryOptions = [
    { label: '交通', value: 'transportation' },
    { label: '住宿', value: 'accommodation' },
    { label: '餐饮', value: 'food' },
    { label: '购物', value: 'shopping' },
    { label: '娱乐', value: 'entertainment' },
    { label: '其他', value: 'other' },
  ];

  const categoryMap: { [key: string]: string } = {
    transportation: '交通',
    accommodation: '住宿',
    food: '餐饮',
    shopping: '购物',
    entertainment: '娱乐',
    other: '其他',
  };

  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const budgetUsedPercent = (totalExpense / budget) * 100;

  const handleAdd = () => {
    setEditingExpense(null);
    form.resetFields();
    form.setFieldsValue({ date: dayjs(), currency: 'CNY' });
    setModalVisible(true);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    form.setFieldsValue({
      ...expense,
      date: dayjs(expense.date),
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);
      message.success('删除成功');
      onRefresh();
    } catch (error: any) {
      message.error('删除失败：' + (error.response?.data?.error || error.message));
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const data: CreateExpenseData = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
      };

      if (editingExpense) {
        await updateExpense(editingExpense.id, data);
        message.success('更新成功');
      } else {
        await createExpense(travelPlanId, data);
        message.success('添加成功');
      }

      setModalVisible(false);
      onRefresh();
    } catch (error: any) {
      message.error('操作失败：' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceResult = (text: string) => {
    // 简单解析语音输入
    // 例如："午餐100元" 或 "交通费50"
    message.info(`语音识别：${text}`);
    // 这里可以添加更智能的解析逻辑
  };

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color="blue">{categoryMap[category] || category}</Tag>
      ),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <span style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
          ¥{amount.toLocaleString()}
        </span>
      ),
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Expense) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button
              type="link"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <DollarOutlined />
          <span>费用管理</span>
          <Tag color={budgetUsedPercent > 100 ? 'red' : 'green'}>
            已用 {budgetUsedPercent.toFixed(1)}%
          </Tag>
        </Space>
      }
      extra={
        <Space>
          <VoiceInput onResult={handleVoiceResult} />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加费用
          </Button>
        </Space>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Space size="large">
          <span>
            总预算：<strong style={{ fontSize: 18 }}>¥{budget.toLocaleString()}</strong>
          </span>
          <span>
            已花费：
            <strong
              style={{
                fontSize: 18,
                color: budgetUsedPercent > 100 ? '#ff4d4f' : '#52c41a',
              }}
            >
              ¥{totalExpense.toLocaleString()}
            </strong>
          </span>
          <span>
            剩余：
            <strong
              style={{
                fontSize: 18,
                color: budget - totalExpense < 0 ? '#ff4d4f' : '#1890ff',
              }}
            >
              ¥{(budget - totalExpense).toLocaleString()}
            </strong>
          </span>
        </Space>
      </div>

      <Table
        dataSource={expenses}
        columns={columns}
        rowKey="id"
        pagination={false}
        locale={{ emptyText: '暂无费用记录' }}
      />

      <Modal
        title={editingExpense ? '编辑费用' : '添加费用'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ currency: 'CNY', date: dayjs() }}
        >
          <Form.Item
            label="分类"
            name="category"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select options={categoryOptions} />
          </Form.Item>

          <Form.Item
            label="金额"
            name="amount"
            rules={[{ required: true, message: '请输入金额' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={10}
              prefix="¥"
            />
          </Form.Item>

          <Form.Item
            label="日期"
            name="date"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="说明" name="description">
            <Input.TextArea rows={3} placeholder="费用说明（可选）" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingExpense ? '更新' : '添加'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ExpenseManager;

