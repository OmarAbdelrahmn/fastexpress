"use client";

import { useState } from "react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <aside
      style={{
        width: "220px",
        backgroundColor: "#f2f2f2",
        padding: "20px",
        borderLeft: "3px solid #ff8800",
      }}
    >
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        <li
          style={{
            marginBottom: "15px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          <a href="/" style={{ textDecoration: "none", color: "#333" }}>
            الصفحة الرئيسية
          </a>
        </li>

        <li
          style={{
            marginBottom: "15px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          <a href="/employees" style={{ textDecoration: "none", color: "#333" }}>
            الموظفين
          </a>
        </li>

        {/* Dropdown */}
        <li
          style={{
            marginBottom: "15px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          <button
            onClick={() => setOpen(!open)}
            style={{
              background: "none",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
              textAlign: "right",
              width: "100%",
              color: "#333",
              padding: 0,
            }}
          >
            الإدارات ▾
          </button>

          {open && (
            <ul
              style={{
                listStyle: "none",
                paddingRight: "10px",
                marginTop: "10px",
                borderRight: "2px solid #ff8800",
              }}
            >
              <li style={{ marginBottom: "10px" }}>
                <a
                  href="/departments/hr"
                  style={{ color: "#333", textDecoration: "none" }}
                >
                  الموارد البشرية
                </a>
              </li>
              <li style={{ marginBottom: "10px" }}>
                <a
                  href="/departments/finance"
                  style={{ color: "#333", textDecoration: "none" }}
                >
                  المالية
                </a>
              </li>
              <li style={{ marginBottom: "10px" }}>
                <a
                  href="/departments/it"
                  style={{ color: "#333", textDecoration: "none" }}
                >
                  تقنية المعلومات
                </a>
              </li>
              <li style={{ marginBottom: "10px" }}>
                <a
                  href="/departments/operations"
                  style={{ color: "#333", textDecoration: "none" }}
                >
                  العمليات
                </a>
              </li>
            </ul>
          )}
        </li>

        <li
          style={{
            marginBottom: "15px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          <a href="#" style={{ textDecoration: "none", color: "#333" }}>
            الإعدادات
          </a>
        </li>
        <li
          style={{
            marginBottom: "15px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          <a href="/employees" style={{ textDecoration: "none", color: "#333" }}>
            الموظفين
          </a>
        </li>

        {/* Dropdown */}
        <li
          style={{
            marginBottom: "15px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          <button
            onClick={() => setOpen(!open)}
            style={{
              background: "none",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
              textAlign: "right",
              width: "100%",
              color: "#333",
              padding: 0,
            }}
          >
            الإدارات ▾
          </button>

          {open && (
            <ul
              style={{
                listStyle: "none",
                paddingRight: "10px",
                marginTop: "10px",
                borderRight: "2px solid #ff8800",
              }}
            >
              <li style={{ marginBottom: "10px" }}>
                <a
                  href="/departments/hr"
                  style={{ color: "#333", textDecoration: "none" }}
                >
                  الموارد البشرية
                </a>
              </li>
              <li style={{ marginBottom: "10px" }}>
                <a
                  href="/departments/finance"
                  style={{ color: "#333", textDecoration: "none" }}
                >
                  المالية
                </a>
              </li>
              <li style={{ marginBottom: "10px" }}>
                <a
                  href="/departments/it"
                  style={{ color: "#333", textDecoration: "none" }}
                >
                  تقنية المعلومات
                </a>
              </li>
              <li style={{ marginBottom: "10px" }}>
                <a
                  href="/departments/operations"
                  style={{ color: "#333", textDecoration: "none" }}
                >
                  العمليات
                </a>
              </li>
            </ul>
          )}
        </li>

        <li
          style={{
            marginBottom: "15px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          <a href="#" style={{ textDecoration: "none", color: "#333" }}>
            الدراجات
          </a>
        </li>
      </ul>
    </aside>
  );
}
