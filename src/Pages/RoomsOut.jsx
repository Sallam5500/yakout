import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection, collectionGroup, doc, addDoc, onSnapshot,
  deleteDoc, getDoc, setDoc, serverTimestamp, runTransaction
} from "firebase/firestore";
import "../GlobalStyles.css";

const normalize = (s="") => s.trim().replace(/\\s+/g," ").toLowerCase();

const BASE_ITEMS = [
  "بيض","مانجا فليت","فرولة فليت","كيوي فليت","مربي مشمش","لباني",
  "جبنه تشيز كيك","رومانتك ابيض","رومانتك اسمر","بشر اسمر","بشر ابيض",
  "لوتس","نوتيلا","جناش جديد","جناش","أدخل صنف جديد"
];
const UNIT_MAP = ["كيس","جردل","برنيكه","عدد"];

export default function RoomsOut(){
  const nav=useNavigate();

  const [date,setDate]         = useState(new Date().toISOString().split("T")[0]);
  const [name,setName]         = useState("");
  const [custom,setCustom]     = useState("");
  const [qty,setQty]           = useState("");
  const [unit,setUnit]         = useState("كيس");

  const [opts,setOpts]         = useState([]);
  const [flt,setFlt]           = useState([]);
  const [recs,setRecs]         = useState([]);

  const outsCol = d=>collection(db,"rooms-store",d,"outs");     // مجموعة الخصم
  const outLog  = d=>collection(db,"rooms-out",d,"items");      // سجل عام (اختياري)
  const rootRef = k=>doc(db,"rooms-store",k);

  /* تحميل الأصناف */
  useEffect(()=>{
    const u=onSnapshot(collectionGroup(db,"items"),s=>{
      const set=new Set(BASE_ITEMS);
      s.docs.forEach(d=>{
        if(d.ref.path.includes("rooms-store")) set.add(d.data().name);
      });
      const arr=[...set];
      setOpts(arr); setFlt(arr);
    });
    return ()=>u();
  },[]);

  /* تحميل سجلات الصادر العام */
  useEffect(()=>{
    const u=onSnapshot(outLog(date),s=>{
      setRecs(s.docs.map(d=>({id:d.id,...d.data()})));
    });
    return ()=>u();
  },[date]);

  const onNameChange=v=>{
    setName(v);
    const t=v.toLowerCase().trim();
    setFlt(opts.filter(o=>o.toLowerCase().includes(t)));
  };

  /* تسجيل الصادر */
  const handleSubmit=async()=>{
    const final = name==="أدخل صنف جديد"? custom.trim(): name.trim();
    const amount = +qty;
    if(!final||!amount) return alert("أدخل الاسم والكمية");
    const key=normalize(final);

    try{
      /* تأكد من وجود مستند الرصيد */
      const root=rootRef(key);
      if(!(await getDoc(root)).exists())
        await setDoc(root,{quantity:0,unit});

      /* خصم داخل معاملة */
      await runTransaction(db,async t=>{
        const snap=await t.get(root);
        const bal=snap.data();
        if(amount>bal.quantity) throw Error(`❌ الكمية غير كافية (المتاح ${bal.quantity})`);
        t.update(root,{quantity:bal.quantity-amount});
      });

      /* سجل rooms‑out (للمراجعة فقط) */
      await addDoc(outLog(date),{
        name:final,nameKey:key,quantity:amount,unit,date,
        createdAt:serverTimestamp()
      });

      /* صف سالـب فى مجموعة outs اليوميّة */
      await addDoc(outsCol(date),{
        name:final,nameKey:key,quantity:-amount,unit,
        source:"rooms-out",createdAt:serverTimestamp()
      });

      setName("");setCustom("");setQty("");
    }catch(e){alert(e.message);}
  };

  const delRec=async id=>{
    if(prompt("كلمة المرور؟")!=="2991034") return;
    await deleteDoc(doc(outLog(date),id));
  };

  return(
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={()=>nav(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📤 الصادر من الغرف</h2>

      <div className="form-row">
        <label>📅</label>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
      </div>

      <div className="form-row">
        <input list="list" placeholder="اسم الصنف"
               value={name} onChange={e=>onNameChange(e.target.value)} />
        <datalist id="list">{flt.map(o=><option key={o} value={o} />)}</datalist>
        {name==="أدخل صنف جديد" && (
          <input placeholder="الصنف الجديد" value={custom} onChange={e=>setCustom(e.target.value)} />
        )}
        <input type="number" placeholder="الكمية" value={qty} onChange={e=>setQty(e.target.value)} />
        <select value={unit} onChange={e=>setUnit(e.target.value)}>
          {UNIT_MAP.map(u=><option key={u}>{u}</option>)}
        </select>
        <button onClick={handleSubmit}>➕ تسجيل</button>
      </div>

      <div className="table-container">
        <table className="styled-table">
          <thead><tr><th>الصنف</th><th>الكمية</th><th>الوحدة</th><th>التاريخ</th><th>🗑️</th></tr></thead>
          <tbody>{recs.map(r=>(
            <tr key={r.id}>
              <td>{r.name}</td><td>{r.quantity}</td><td>{r.unit}</td><td>{r.date}</td>
              <td><button onClick={()=>delRec(r.id)}>🗑️</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
