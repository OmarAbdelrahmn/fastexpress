"use client";

import { useEffect, useState } from "react";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export default function MemberReportsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await ApiService.get(API_ENDPOINTS.MEMBER.REPORTS_MONTHLY);
                setData(response);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-500">{error}</div>}
            {data && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <pre className="text-sm bg-gray-50 p-4 rounded">{JSON.stringify(data, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}
