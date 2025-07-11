// src/pages/Employees.jsx
import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { jsPDF } from "jspdf";          // 👈 تأكّد من تنصيب jspdf
import "jspdf-autotable";               // 👈 تأكّد من تنصيب jspdf‑autotable
import { useNavigate } from "react-router-dom";
import "../GlobalStyles.css";

const Employees = () => {
  /* ----- state ----- */
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState("");
  const [job, setJob] = useState("");
  const [role, setRole] = useState("موظف");
  const [salary, setSalary] = useState("");
  const [idImage, setIdImage] = useState(null);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  /* ----- تحميل البيانات مرة واحدة ----- */
  useEffect(() => {
    fetchEmployees();
  }, []);

  /* ----- جلب جميع الموظفين من Firestore ----- */
  const fetchEmployees = async () => {
    const snapshot = await getDocs(collection(db, "employees"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setEmployees(data);
  };

  /* ----- إضافة موظف جديد ----- */
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!name || !job) return alert("يرجى إدخال الاسم والوظيفة");

    let idImageUrl = "";

    // رفع صورة البطاقة إلى Firebase Storage
    if (idImage) {
      const imageRef = ref(storage, `idCards/${Date.now()}_${idImage.name}`);
      const snapshot = await uploadBytes(imageRef, idImage);
      idImageUrl = await getDownloadURL(snapshot.ref);
    }

    await addDoc(collection(db, "employees"), {
      name,
      job,
      role,
      salary,
      idImageUrl,
      createdAt: new Date(),
    });

    // إعادة الضبط
    setName("");
    setJob("");
    setRole("موظف");
    setSalary("");
    setIdImage(null);

    fetchEmployees();
  };

  /* ----- تصدير الجدول إلى PDF ----- */
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("قائمة الموظفين", 14, 10);
    doc.autoTable({
      startY: 20,
      head: [["الاسم", "الوظيفة", "الصلاحية", "الراتب"]],
      body: employees.map((emp) => [
        emp.name,
        emp.job,
        emp.role,
        emp.salary || "-",
      ]),
    });
    doc.save("الموظفين.pdf");
  };

  /* ----- البحث / الفلترة ----- */
  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.job.toLowerCase().includes(search.toLowerCase())
  );

  /* ----- JSX ----- */
  return (
    <div className="factory-page">
      {/* زر الرجوع */}
      <button className="back-button" onClick={() => navigate(-1)}>
        ⬅️ رجوع
      </button>

      <h2 className="page-title">إدارة الموظفين</h2>

      {/* نموذج إضافة موظف */}
      <form onSubmit={handleAddEmployee} className="form-row">
        <input
          type="text"
          placeholder="اسم الموظف"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="الوظيفة"
          value={job}
          onChange={(e) => setJob(e.target.value)}
        />
        <input
          type="number"
          placeholder="الراتب"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="موظف">موظف</option>
          <option value="مشرف">مشرف</option>
        </select>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setIdImage(e.target.files[0])}
        />
        <button type="submit">➕ إضافة</button>
      </form>

      {/* البحث والطباعة */}
      <div className="form-row">
        <input
          type="text"
          placeholder="بحث بالاسم أو الوظيفة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={exportToPDF}>🖨️ تصدير PDF</button>
      </div>

      {/* جدول البيانات */}
      <table className="styled-table">
        <thead>
          <tr>
            <th>الاسم</th>
            <th>الوظيفة</th>
            <th>الصلاحية</th>
            <th>الراتب</th>
            <th>البطاقة</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.name}</td>
              <td>{emp.job}</td>
              <td>{emp.role}</td>
              <td>{emp.salary || "-"}</td>
              <td>
                {emp.idImageUrl ? (
                  <a href={emp.idImageUrl} target="_blank" rel="noreferrer">
                    عرض الصورة
                  </a>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Employees;
