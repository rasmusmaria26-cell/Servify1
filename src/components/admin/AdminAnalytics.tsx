import { useState, useEffect } from "react";
import { Loader2, TrendingUp, Users, DollarSign, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, subMonths } from "date-fns";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const AdminAnalytics = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [userGrowthData, setUserGrowthData] = useState<any[]>([]);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setIsLoading(true);

            // 1. Fetch Revenue Data (Last 7 Days)
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = subDays(new Date(), 6 - i);
                return {
                    date: format(d, "MMM dd"),
                    fullDate: format(d, "yyyy-MM-dd"),
                    revenue: 0
                };
            });

            const { data: bookings } = await supabase
                .from("bookings")
                .select("created_at, final_cost")
                .eq("status", "completed")
                .gte("created_at", subDays(new Date(), 7).toISOString());

            if (bookings) {
                bookings.forEach(booking => {
                    const date = format(new Date(booking.created_at), "yyyy-MM-dd");
                    const day = last7Days.find(d => d.fullDate === date);
                    if (day) {
                        day.revenue += (booking.final_cost || 0);
                    }
                });
            }
            setRevenueData(last7Days);

            // 2. Fetch User Growth (Last 6 Months)
            const last6Months = Array.from({ length: 6 }, (_, i) => {
                const d = subMonths(new Date(), 5 - i);
                return {
                    month: format(d, "MMM"),
                    yearMonth: format(d, "yyyy-MM"),
                    users: 0,
                    vendors: 0
                };
            });

            // Fetch users
            const { data: profiles } = await supabase
                .from("profiles")
                .select("created_at");

            // Fetch vendors
            const { data: vendors } = await supabase
                .from("vendors")
                .select("created_at");

            if (profiles) {
                profiles.forEach(p => {
                    const date = format(new Date(p.created_at), "yyyy-MM");
                    const period = last6Months.find(m => m.yearMonth === date);
                    if (period) period.users += 1;
                });
            }

            if (vendors) {
                vendors.forEach(v => {
                    const date = format(new Date(v.created_at), "yyyy-MM");
                    const period = last6Months.find(m => m.yearMonth === date);
                    if (period) period.vendors += 1;
                });
            }

            setUserGrowthData(last6Months);

        } catch (error) {
            console.error("Error loading analytics:", error);
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-card p-6 rounded-2xl border border-border">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-success" />
                                Revenue Trends
                            </h3>
                            <p className="text-sm text-muted-foreground">Income over last 7 days</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
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
                                    tickFormatter={(val) => `₹${val}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                    formatter={(val) => [`₹${val}`, "Revenue"]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#22c55e"
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* User Growth Chart */}
                <div className="bg-card p-6 rounded-2xl border border-border">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                Platform Growth
                            </h3>
                            <p className="text-sm text-muted-foreground">New users vs vendors (6 months)</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={userGrowthData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                    cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                                />
                                <Bar dataKey="users" name="Users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="vendors" name="Vendors" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
