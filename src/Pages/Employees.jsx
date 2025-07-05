// src/pages/Employees.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Employees = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState("");
  const [job, setJob] = useState("");
  const [phone, setPhone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [idImage, setIdImage] = useState(null);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("employees")) || [];
    setEmployees(stored);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setIdImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddOrUpdate = () => {
    if (!name || !job || !phone) return alert("يرجى ملء الاسم والوظيفة ورقم التليفون");

    const employee = {
      id: editId || Date.now(),
      name,
      job,
      phone,
      startDate: startDate || "",
      idImage,
    };

    let updatedList = [];

    if (editId) {
      updatedList = employees.map((emp) => (emp.id === editId ? employee : emp));
    } else {
      updatedList = [...employees, employee];
    }

    setEmployees(updatedList);
    localStorage.setItem("employees", JSON.stringify(updatedList));

    // Reset
    setName("");
    setJob("");
    setPhone("");
    setStartDate("");
    setIdImage(null);
    setEditId(null);
  };

  const handleEdit = (emp) => {
    setName(emp.name);
    setJob(emp.job);
    setPhone(emp.phone);
    setStartDate(emp.startDate);
    setIdImage(emp.idImage);
    setEditId(emp.id);
  };

  const handleDelete = (id) => {
    const password = prompt("أدخل كلمة المرور للحذف:");
    if (password !== "1234") {
      alert("كلمة المرور غير صحيحة.");
      return;
    }

    const confirmDelete = window.confirm("هل تريد حذف هذا الموظف؟");
    if (!confirmDelete) return;

    const updated = employees.filter((emp) => emp.id !== id);
    setEmployees(updated);
    localStorage.setItem("employees", JSON.stringify(updated));
  };

  return (
    <div style={{ padding: "20px", direction: "rtl", maxWidth: "900px", margin: "0 auto" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: "15px",
          padding: "6px 12px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        ⬅ رجوع
      </button>

      <h2>👨‍🔧 قسم الموظفين</h2>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="الاسم"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "6px", marginLeft: "10px" }}
        />
        <input
          type="text"
          placeholder="الوظيفة"
          value={job}
          onChange={(e) => setJob(e.target.value)}
          style={{ padding: "6px", marginLeft: "10px" }}
        />
        <input
          type="text"
          placeholder="رقم التليفون"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ padding: "6px", marginLeft: "10px" }}
        />
        <input
          type="date"
          placeholder="تاريخ بدء العمل"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ padding: "6px", marginLeft: "10px" }}
        />
        <input
          type="file"
          onChange={handleImageUpload}
          accept="image/*"
          style={{ marginTop: "10px" }}
        />
        <br />
        <button
          onClick={handleAddOrUpdate}
          style={{
            marginTop: "10px",
            padding: "6px 12px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          {editId ? "تحديث" : "إضافة"}
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th>الاسم</th>
            <th>الوظيفة</th>
            <th>التليفون</th>
            <th>تاريخ البدء</th>
            <th>صورة البطاقة</th>
            <th>تعديل</th>
            <th>حذف</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id} style={{ textAlign: "center" }}>
              <td>{emp.name}</td>
              <td>{emp.job}</td>
              <td>{emp.phone}</td>
              <td>{emp.startDate || "-"}</td>
              <td>
                {emp.idImage ? (
                  <img
                    src={emp.idImage}
                    alt="بطاقة"
                    width="60"
                    height="60"
                    style={{ objectFit: "cover", borderRadius: "5px" }}
                  />
                ) : (
                  "لا يوجد"
                )}
              </td>
              <td>
                <button
                  onClick={() => handleEdit(emp)}
                  style={{
                    backgroundColor: "#ffc107",
                    color: "black",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  تعديل
                </button>
              </td>
              <td>
                <button
                  onClick={() => handleDelete(emp.id)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Employees;