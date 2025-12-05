// Mock data for finance
export const finance = {
  summary: {
    totalRevenue: 1250000000,
    totalOrders: 15420,
    totalCommission: 125000000,
    pendingPayouts: 25000000,
    thisMonth: {
      revenue: 125000000,
      orders: 1542,
      commission: 12500000,
      growth: 15.5
    },
    lastMonth: {
      revenue: 108000000,
      orders: 1320,
      commission: 10800000
    }
  },
  transactions: [
    {
      id: "TXN001",
      date: "2024-12-01",
      type: "order_payment",
      amount: 150000,
      status: "completed",
      restaurant: "Pizza Palace",
      orderId: "ORD-2024-001"
    },
    {
      id: "TXN002",
      date: "2024-12-01",
      type: "commission",
      amount: 15000,
      status: "completed",
      restaurant: "Pizza Palace",
      orderId: "ORD-2024-001"
    },
    {
      id: "TXN003",
      date: "2024-12-02",
      type: "payout",
      amount: 5000000,
      status: "pending",
      restaurant: "Burger King",
      orderId: null
    },
    {
      id: "TXN004",
      date: "2024-12-02",
      type: "order_payment",
      amount: 250000,
      status: "completed",
      restaurant: "Sushi Tokyo",
      orderId: "ORD-2024-002"
    },
    {
      id: "TXN005",
      date: "2024-12-03",
      type: "refund",
      amount: -50000,
      status: "completed",
      restaurant: "Thai Express",
      orderId: "ORD-2024-003"
    }
  ],
  restaurantPayouts: [
    {
      id: 1,
      restaurant: "Pizza Palace",
      pendingAmount: 5000000,
      lastPayout: "2024-11-30",
      status: "ready"
    },
    {
      id: 2,
      restaurant: "Burger King",
      pendingAmount: 3500000,
      lastPayout: "2024-11-28",
      status: "processing"
    },
    {
      id: 3,
      restaurant: "Pho 24",
      pendingAmount: 7500000,
      lastPayout: "2024-11-25",
      status: "ready"
    },
    {
      id: 4,
      restaurant: "Sushi Tokyo",
      pendingAmount: 4200000,
      lastPayout: "2024-11-20",
      status: "ready"
    },
    {
      id: 5,
      restaurant: "Thai Express",
      pendingAmount: 2800000,
      lastPayout: "2024-11-22",
      status: "ready"
    }
  ],
  revenueByMonth: [
    { month: "Jan", revenue: 85000000, orders: 1050 },
    { month: "Feb", revenue: 92000000, orders: 1120 },
    { month: "Mar", revenue: 98000000, orders: 1200 },
    { month: "Apr", revenue: 105000000, orders: 1280 },
    { month: "May", revenue: 110000000, orders: 1350 },
    { month: "Jun", revenue: 115000000, orders: 1400 },
    { month: "Jul", revenue: 108000000, orders: 1320 },
    { month: "Aug", revenue: 112000000, orders: 1380 },
    { month: "Sep", revenue: 118000000, orders: 1450 },
    { month: "Oct", revenue: 120000000, orders: 1480 },
    { month: "Nov", revenue: 108000000, orders: 1320 },
    { month: "Dec", revenue: 125000000, orders: 1542 }
  ]
};

export default finance;
