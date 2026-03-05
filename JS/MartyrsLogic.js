const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxbbV0r7l0BYNDmdkvvOUbBDmHL6E0XBX_7d75jaF2n4TcAYPnj4akUU21Y-nwQFZ2pOg/exec";

let martyrCount = 0;
const maxMartyrs = 10;
let generalData = null;

// ==========================================
// 1️⃣ جلب بيانات رب الأسرة عند تحميل الصفحة
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const storedData = localStorage.getItem("generalData");
    if (!storedData) {
        alert("⚠️ خطأ: بيانات رب الأسرة مفقودة! يرجى العودة للصفحة الأولى.");
        window.location.href = "index.html";
        return;
    }
    generalData = JSON.parse(storedData);
});

// ==========================================
// 2️⃣ إظهار/إخفاء القسم مع إضافة تلقائية
// ==========================================
function toggleMartyrs() {
    const choice = document.getElementById("hasMartyrs").value;
    const section = document.getElementById("martyrsSection");
    
    if (choice === "yes") {
        section.style.display = "block";
        if (martyrCount === 0) addMartyr(); // حركة سحرية: فتح أول بطاقة تلقائياً
    } else {
        section.style.display = "none";
    }
}

// ==========================================
// 3️⃣ إضافة شهيد جديد
// ==========================================
function addMartyr() {
    if (martyrCount >= maxMartyrs) {
        alert("⚠️ الحد الأقصى المسموح به 10 شهداء فقط.");
        return;
    }
    martyrCount++;

    const container = document.getElementById("martyrsContainer");
    const div = document.createElement("div");
    div.className = "martyr-card";
    div.style.border = "2px solid #9e9e9e";
    div.style.padding = "20px";
    div.style.marginBottom = "20px";
    div.style.borderRadius = "8px";
    div.style.backgroundColor = "#fafafa";

    div.innerHTML = `
        <h3 style="margin-top:0; color:#424242; border-bottom: 2px solid #bdbdbd; padding-bottom: 10px;">🕊️ الشهيد رقم ${martyrCount}</h3>
        
        <label>اسم الشهيد رباعي</label>
        <input type="text" class="mName" required placeholder="الاسم رباعي">

        <label>رقم هوية الشهيد</label>
        <input type="text" class="mId" placeholder="9 أرقام" inputmode="numeric" required>

        <label>تاريخ الاستشهاد</label>
        <input type="date" class="mDate" required>

        <label>صلة القرابة برب الأسرة</label>
        <select class="mRel" required>
            <option value="" selected disabled>اختر</option>
            <option value="أب">أب</option>
            <option value="أم">أم</option>
            <option value="زوج/ة">زوج/ة</option>
            <option value="ابن/ة">ابن/ة</option>
            <option value="أخ/أخت">أخ/أخت</option>
            <option value="أقارب">أقارب</option>
        </select>

        <button type="button" class="btn-delete" onclick="removeMartyr(this)" style="background-color:#ff4d4d; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer; margin-top:15px;">🗑️ حذف الشهيد</button>
    `;
    container.appendChild(div);
}

// ==========================================
// 4️⃣ حذف شهيد
// ==========================================
function removeMartyr(btn) {
    btn.parentElement.remove();
    martyrCount--;
}

// ==========================================
// 5️⃣ الفلديشن الصارم والحفظ
// ==========================================
function saveMartyrs() {
    if (!generalData || !generalData.husbandId) {
        alert("⚠️ بيانات رب الأسرة مفقودة! لا يمكن الحفظ.");
        return;
    }

    const choice = document.getElementById("hasMartyrs").value;

    if (choice === "") {
        alert("⚠️ يرجى الإجابة على السؤال: هل يوجد شهداء؟");
        document.getElementById("hasMartyrs").focus();
        return;
    }

    // الانتقال السريع بدون إنترنت إذا كان الخيار "لا"
    if (choice === "no") {
        window.location.href = "student.html";
        return;
    }

    const cards = document.querySelectorAll("#martyrsContainer > .martyr-card");

    if (cards.length === 0) {
        alert("⚠️ اخترت 'نعم' ولكنك لم تضف أي شهيد.");
        return;
    }

    const martyrs = [];
    const usedIds = new Set();
    const today = new Date().toISOString().split("T")[0];

    // تم تغيير forEach إلى for loop العادية لكي يعمل الفلديشن والـ return بشكل صحيح!
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];

        // 1. التحقق من الحقول المطلوبة
        const requiredInputs = card.querySelectorAll("input[required], select[required]");
        for (let input of requiredInputs) {
            if (input.value.trim() === "") {
                let label = input.previousElementSibling ? input.previousElementSibling.innerText : "هذا الحقل";
                alert(`في (الشهيد رقم ${i + 1}): يرجى تعبئة ${label}`);
                input.style.border = "2px solid red";
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                input.focus();
                return; // الآن الـ return ستوقف العملية بالكامل
            } else {
                input.style.border = "";
            }
        }

        const vName = card.querySelector(".mName").value.trim();
        const idInp = card.querySelector(".mId");
        const vId = idInp.value.trim();
        const dateInp = card.querySelector(".mDate");
        const vDate = dateInp.value;
        const vRel = card.querySelector(".mRel").value;

        // 2. التحقق من رقم الهوية
        if (!/^\d{9}$/.test(vId)) {
            alert(`في (الشهيد رقم ${i + 1}): رقم الهوية يجب أن يكون 9 أرقام.`);
            idInp.style.border = "2px solid red";
            idInp.focus();
            return;
        }

        // 3. منع التكرار داخل نفس الفورم
        if (usedIds.has(vId)) {
            alert(`في (الشهيد رقم ${i + 1}): رقم الهوية مكرر!`);
            idInp.style.border = "2px solid red";
            idInp.focus();
            return;
        }
        usedIds.add(vId);

        // 4. فحص التاريخ
        if (vDate > today) {
            alert(`في (الشهيد رقم ${i + 1}): تاريخ الاستشهاد لا يمكن أن يكون في المستقبل.`);
            dateInp.style.border = "2px solid red";
            dateInp.focus();
            return;
        }

        martyrs.push({
            name: vName,
            id: vId,
            date: vDate,
            rel: vRel
        });
    }

    // ==========================================
    // 6️⃣ كل شيء سليم -> إرسال للسيرفر
    // ==========================================
    const btn = document.getElementById("submitBtn");
    const oldText = btn.innerText;
    btn.innerText = "جاري حفظ بيانات الشهداء ⏳...";
    btn.disabled = true;

    const payload = {
        action: "saveMartyrs",
        husbandId: generalData.husbandId,
        martyrs: martyrs
    };

    fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        // فحص حالة النجاح بناءً على السكربت الخاص بك
        if (data.status === "ok") {
            window.location.href = "student.html";
        } else if (data.status === "error") {
            if (data.msg === "DUPLICATE") {
                alert("⚠️ عذراً، هذا الشهيد مسجل مسبقاً في قاعدة البيانات!");
            } else if (data.msg === "FAMILY_NOT_FOUND") {
                alert("❌ خطأ: لم يتم العثور على العائلة الأساسية في قاعدة البيانات.");
            } else {
                alert("❌ خطأ من الخادم: " + data.msg);
            }
            btn.innerText = oldText;
            btn.disabled = false;
        }
    })
    .catch(err => {
        console.error(err);
        alert("❌ حدث خطأ في الاتصال بالسيرفر. يرجى التأكد من الإنترنت والمحاولة.");
        btn.innerText = oldText;
        btn.disabled = false;
    });
}