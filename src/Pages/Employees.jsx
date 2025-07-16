// src/pages/Employees.jsx
import React, { useState, useEffect } from "react";
import {
  collection, addDoc, getDocs,
  query, orderBy, serverTimestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "../GlobalStyles.css";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState("");
  const [job, setJob] = useState("");
  const [role, setRole] = useState("موظف");
  const [salary, setSalary] = useState("");
  const [idImage, setIdImage] = useState(null);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    const q = query(collection(db, "employees"), orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    setEmployees(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!name || !job) return alert("يرجى إدخال الاسم والوظيفة");

    let idImageUrl = "";
    if (idImage) {
      const imageRef = ref(storage, `idCards/${Date.now()}_${idImage.name}`);
      const snap = await uploadBytes(imageRef, idImage);
      idImageUrl = await getDownloadURL(snap.ref);
    }

    await addDoc(collection(db, "employees"), {
      name,
      job,
      role,
      salary,
      idImageUrl,
      createdAt: serverTimestamp(),
    });

    setName(""); setJob(""); setRole("موظف");
    setSalary(""); setIdImage(null);
    fetchEmployees();
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      employees.map((e) => ({
        الاسم: e.name,
        الوظيفة: e.job,
        الصلاحية: e.role,
        الراتب: e.salary || "-",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "الموظفين");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "قائمة_الموظفين.xlsx");
  };

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.job.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="factory-page">
      <button className="back-button" onClick={() => navigate(-1)}>⬅️ رجوع</button>
      <h2 className="page-title">إدارة الموظفين</h2>

      {/* نموذج إضافة موظف */}
      <form onSubmit={handleAddEmployee} className="form-row">
        <input type="text" placeholder="اسم الموظف" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="text" placeholder="الوظيفة" value={job} onChange={(e) => setJob(e.target.value)} />
        <input type="number" placeholder="الراتب" value={salary} onChange={(e) => setSalary(e.target.value)} />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="موظف">موظف</option>
          <option value="مشرف">مشرف</option>
        </select>
        <input type="file" accept="image/*" onChange={(e) => setIdImage(e.target.files[0])} />
        <button type="submit">➕ إضافة</button>
      </form>

      {/* البحث / التصدير */}
      <div className="form-row">
        <input type="text" placeholder="بحث بالاسم أو الوظيفة..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <button onClick={exportToExcel}>📥 تصدير Excel</button>
      </div>

      {/* جدول البيانات */}
      <table className="styled-table">
        <thead>
          <tr><th>الاسم</th><th>الوظيفة</th><th>الصلاحية</th><th>الراتب</th><th>البطاقة</th></tr>
        </thead>
        <tbody>
          {filtered.map((e) => (
            <tr key={e.id}>
              <td>{e.name}</td><td>{e.job}</td><td>{e.role}</td><td>{e.salary || "-"}</td>
              <td>{e.idImageUrl ? <a href={e.idImageUrl} target="_blank" rel="noreferrer">عرض</a> : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Employees;
