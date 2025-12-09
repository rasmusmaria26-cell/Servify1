import { useState, useEffect } from "react";
import { Wallet, TrendingUp, CreditCard, Calendar, ArrowUpRight, ArrowDownRight, Loader2, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";

interface VendorEarningsProps {
    vendorId: string;
}

const VendorEarnings = ({ vendorId }: VendorEarningsProps) => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEarnings: 0,
        monthEarnings: 0,
        pendingPayout: 0,
    });
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        fetchEarnings();
    }, [vendorId]);

    const fetchEarnings = async () => {
        try {
            setIsLoading(true);

            // Fetch completed bookings for earnings
            const { data, error } = await supabase
                .from("bookings")
                .select("*")
                .eq("vendor_id", vendorId)
                .eq("status", "completed")
                .order("scheduled_date", { ascending: false });

            if (error) throw error;

            const completedBookings = data || [];

            // Calculate totals
            const total = completedBookings.reduce((sum, b) => sum + (b.final_cost || b.estimated_cost || 0), 0);

            // Current month earnings
            const now = new Date();
            const monthStart = startOfMonth(now);
            const monthEnd = endOfMonth(now);

            const monthTotal = completedBookings
                .filter(b => {
                    const date = new Date(b.scheduled_date);
                    return isWithinInterval(date, { start: monthStart, end: monthEnd });
                })
                .reduce((sum, b) => sum + (b.final_cost || b.estimated_cost || 0), 0);

            setStats({
                totalEarnings: total,
                monthEarnings: monthTotal,
                pendingPayout: 0, // Placeholder logic for now
            });

            setTransactions(completedBookings);

            // Prepare chart data (last 7 days)
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = subDays(new Date(), 6 - i);
                return {
                    date: format(d, "MMM dd"),
                    fullDate: format(d, "yyyy-MM-dd"),
                    amount: 0
                };
            });

            completedBookings.forEach(booking => {
                const bookingDate = format(new Date(booking.scheduled_date), "yyyy-MM-dd");
                const dayStat = last7Days.find(d => d.fullDate === bookingDate);
                if (dayStat) {
                    dayStat.amount += (booking.final_cost || booking.estimated_cost || 0);
                }
            });

            setChartData(last7Days);

        } catch (err: any) {
            console.error("Error fetching earnings:", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card p-6 rounded-2xl border border-border">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <Wallet className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-xs font-medium bg-success/10 text-success px-2 py-1 rounded-full flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> +12%
                        </span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-1">Total Earnings</p>
                    <h3 className="text-3xl font-display font-bold">₹{stats.totalEarnings.toLocaleString()}</h3>
                </div>

                <div className="bg-card p-6 rounded-2xl border border-border">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-secondary rounded-xl">
                            <Calendar className="w-6 h-6 text-muted-foreground" />
                        </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-1">This Month</p>
                    <h3 className="text-3xl font-display font-bold">₹{stats.monthEarnings.toLocaleString()}</h3>
                </div>

                <div className="bg-card p-6 rounded-2xl border border-border">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-warning/10 rounded-xl">
                            <CreditCard className="w-6 h-6 text-warning" />
                        </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-1">Pending Payout</p>
                    <h3 className="text-3xl font-display font-bold">₹{stats.pendingPayout.toLocaleString()}</h3>
                </div>
            </div>

            {/* Chart Section */}
            <div className="bg-card p-6 rounded-2xl border border-border">
                <h3 className="text-lg font-semibold mb-6">Earnings Overview</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                tickFormatter={(value) => `₹${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    borderColor: 'hsl(var(--border))',
                                    borderRadius: '8px',
                                    color: 'hsl(var(--foreground))'
                                }}
                                formatter={(value: number) => [`₹${value}`, "Amount"]}
                            />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="#8B5CF6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorEarnings)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-card rounded-2xl border border-border">
                <div className="p-6 border-b border-border">
                    <h3 className="text-lg font-semibold">Recent Transactions</h3>
                </div>
                <div className="divide-y divide-border">
                    {transactions.length > 0 ? (
                        transactions.map((tx) => (
                            <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                                        <ArrowDownRight className="w-5 h-5 text-success" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">Service Payment</p>
                                        <p className="text-sm text-muted-foreground">{format(new Date(tx.scheduled_date), "MMM d, yyyy")}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-success">+₹{(tx.final_cost || tx.estimated_cost || 0).toLocaleString()}</span>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-muted-foreground">
                            No transactions found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorEarnings;
