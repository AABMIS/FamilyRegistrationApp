const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxbbV0r7l0BYNDmdkvvOUbBDmHL6E0XBX_7d75jaF2n4TcAYPnj4akUU21Y-nwQFZ2pOg/exec";

let injuredCount = 0;
const maxInjured = 8;
let generalData = null;

// عند تحميل الصفحة، نتحقق من وجود بيانات رب الأسرة
document.addEventListener("DOMContentLoaded", () => {
    const storedData = localStorage.getItem("generalData");
    if (!storedData) {
        alert("⚠️ خطأ: لا توجد بيانات لرب الأسرة! يرجى العودة للصفحة الأولى وتعبئة البيانات.");
        window.location.href = "index.html";
        return;
    }
    generalData = JSON.parse(storedData);
});

// ==========================================
// 1️⃣ إظهار أو إخفاء قسم المصابين
// ==========================================
function toggleInjured() {
    const choice = document.getElementById("hasInjured").value;
    const section = document.getElementById("injuredSection");

    if (choice === "yes") {
        section.style.display = "block";
        // إذا اختار نعم ولم يضف أحداً بعد، نضيف له بطاقة أولى تلقائياً
        if (injuredCount === 0) addInjured();
    } else {
        section.style.display = "none";
    }
}

// ==========================================
// 2️⃣ إضافة بطاقة مصاب ديناميكية
// ==========================================
function addInjured() {
    if (injuredCount >= maxInjured) {
        alert("⚠️ الحد الأقصى المسموح به هو 8 مصابين فقط.");
        return;
    }

    injuredCount++;

    const container = document.getElementById("injuredContainer");
    const today = new Date().toISOString().split("T")[0];
    const div = document.createElement("div");
    div.className = "injured-card";
    div.style.border = "2px solid #ff9800";
    div.style.padding = "20px";
    div.style.marginBottom = "20px";
    div.style.borderRadius = "8px";
    div.style.backgroundColor = "#fff9f0"; // لون مميز لقسم المصابين

    div.innerHTML = `
        <h3 style="margin-top:0; color:#e65100; border-bottom: 2px solid #ffcc80; padding-bottom: 10px;">🩹 المصاب رقم ${injuredCount}</h3>

        <label>اسم المصاب رباعي</label>
        <input type="text" class="injuredName" required placeholder="ادخل اسم المصاب">

        <label>رقم هوية المصاب</label>
        <input type="text" class="injuredId" placeholder="9 أرقام" inputmode="numeric" required>

        <label>رقم الجوال</label>
        <input type="text" class="injuredPhone" placeholder="مثال: 0590000000" inputmode="numeric" required>

        <label>نوع الإصابة ومكانها</label>
        <input type="text" class="injuredType" required placeholder="مثال: شظايا في القدم اليمنى">

        <label>تاريخ الإصابة</label>
        <input type="date" class="injuredDate" required max="${today}>

        <button type="button" class="btn-delete" onclick="removeInjured(this)" style="background-color:#ff4d4d; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer; margin-top:15px;">🗑️ حذف المصاب</button>
    `;

    container.appendChild(div);
}

// ==========================================
// 3️⃣ إزالة مصاب مع إعادة الترتيب
// ==========================================
function removeInjured(btn) {
    btn.parentElement.remove();
    injuredCount--;
    // لا تقلق بشأن إعادة الترقيم في الشاشة، المهم هو البيانات المرسلة
}

// ==========================================
// 4️⃣ الفلديشن الصارم والحفظ
// ==========================================
function saveInjured() {
    if (!generalData || !generalData.husbandId) {
        alert("⚠️ خطأ: رقم هوية رب الأسرة مفقود.");
        return;
    }

    const choice = document.getElementById("hasInjured").value;

    if (choice === "") {
        alert("⚠️ يرجى الإجابة على السؤال: هل يوجد مصابون؟");
        document.getElementById("hasInjured").focus();
        return;
    }

    // إذا اختار "لا"، ننتقل مباشرة للشهداء بدون تضييع وقت في الاتصال بالسيرفر!
    if (choice === "no") {
        window.location.href = "martyrs.html";
        return;
    }

    const cards = document.querySelectorAll("#injuredContainer > .injured-card");

    if (cards.length === 0) {
        alert("⚠️ اخترت 'نعم' ولكنك لم تضف أي مصاب! يرجى إضافة مصاب أو تغيير الإجابة إلى 'لا'.");
        return;
    }

    const injured = [];
    const usedIds = new Set();
    const today = new Date().toISOString().split("T")[0];

    // الفلديشن الصارم لكل مصاب
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];

        // التحقق من الحقول الفارغة
        const requiredInputs = card.querySelectorAll("input[required]");
        for (let input of requiredInputs) {
            if (input.value.trim() === "") {
                let label = input.previousElementSibling ? input.previousElementSibling.innerText : "هذا الحقل";
                alert(`في (المصاب رقم ${i + 1}): يرجى تعبئة ${label}`);
                input.style.border = "2px solid red";
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                input.focus();
                return;
            } else {
                input.style.border = "";
            }
        }

        const vName = card.querySelector(".injuredName").value.trim();
        const idInp = card.querySelector(".injuredId");
        const vId = idInp.value.trim();
        const phoneInp = card.querySelector(".injuredPhone");
        const vPhone = phoneInp.value.trim();
        const vType = card.querySelector(".injuredType").value.trim();
        const dateInp = card.querySelector(".injuredDate");
        const vDate = dateInp.value;

        // فحص الهوية
        if (!/^\d{9}$/.test(vId)) {
            alert(`في (المصاب رقم ${i + 1}): رقم الهوية يجب أن يتكون من 9 أرقام.`);
            idInp.style.border = "2px solid red";
            idInp.focus();
            return;
        }

        // فحص تكرار الهوية داخل نفس الفورم
        if (usedIds.has(vId)) {
            alert(`في (المصاب رقم ${i + 1}): رقم الهوية مكرر!`);
            idInp.style.border = "2px solid red";
            idInp.focus();
            return;
        }
        usedIds.add(vId);

        // فحص رقم الجوال
        if (!/^05\d{8}$/.test(vPhone)) {
            alert(`في (المصاب رقم ${i + 1}): رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام.`);
            phoneInp.style.border = "2px solid red";
            phoneInp.focus();
            return;
        }

        // فحص التاريخ (يجب ألا يكون مستقبلياً)
        if (vDate > today) {
            alert(`في (المصاب رقم ${i + 1}): تاريخ الإصابة غير منطقي (لا يمكن أن يكون في المستقبل).`);
            dateInp.style.border = "2px solid red";
            dateInp.focus();
            return;
        }

        injured.push({
            name: vName,
            id: vId,
            phone: vPhone,
            type: vType,
            date: vDate
        });
    }

    // =========================================================
    // 5️⃣ كل شيء سليم -> إرسال للسيرفر
    // =========================================================
    const btn = document.getElementById("submitBtn");
    const oldText = btn.innerText;
    btn.innerText = "جاري حفظ بيانات المصابين ⏳...";
    btn.disabled = true;

    const payload = {
        action: "saveInjured",
        husbandId: generalData.husbandId,
        injured: injured
    };

    fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
    })
        .then(response => response.json())
        .then(data => {
            // فحص الردود بناءً على ملف Google Apps Script الخاص بك
            if (data.status === "ok") {
                // نجاح
                window.location.href = "martyrs.html";
            } else if (data.status === "error") {
                if (data.msg === "DUPLICATE") {
                    alert("⚠️ خطأ: أحد المصابين الذين أدخلتهم مسجل مسبقاً في قاعدة البيانات!");
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