"use client";

import { useEffect, useState } from "react";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export default function MemberRequestsPage() {
    const [updatesData, setUpdatesData] = useState(null);
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [updatesRes, statusRes] = await Promise.all([
                    ApiService.get(API_ENDPOINTS.MEMBER.REQ_EMPLOYEE_UPDATES),
                    ApiService.get(API_ENDPOINTS.MEMBER.REQ_STATUS_CHANGES)
                ]);
                setUpdatesData(updatesRes);
                setStatusData(statusRes);
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
            <h1 className="text-2xl font-bold text-gray-900">Requests</h1>
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-500">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {updatesData && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="font-bold mb-4">Employee Updates</h2>
                        <pre className="text-sm bg-gray-50 p-4 rounded overflow-auto">{JSON.stringify(updatesData, null, 2)}</pre>
                    </div>
                )}
                {statusData && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="font-bold mb-4">Status Changes</h2>
                        <pre className="text-sm bg-gray-50 p-4 rounded overflow-auto">{JSON.stringify(statusData, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}
