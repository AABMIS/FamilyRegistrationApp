const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzMsMmEoxviek7_7CE75m50mqcn7YMHWHMpYdSr9HPVE2RxW5nnWDFtrDt4oJDTovwo6g/exec";

let martyrCount = 0;
const maxMartyrs = 10;

// إظهار/إخفاء القسم
function toggleMartyrs() {
    const choice = document.getElementById("hasMartyrs").value;
    const section = document.getElementById("martyrsSection");
    section.style.display = (choice === "yes") ? "block" : "none";
}

// إضافة شهيد جديد
function addMartyr() {
    if (martyrCount >= maxMartyrs) {
        alert("الحد الأقصى 10 شهداء فقط");
        return;
    }
    martyrCount++;

    const container = document.getElementById("martyrsContainer");
    const div = document.createElement("div");
    div.classList.add("card-item");
    div.style.marginBottom = "15px";
    div.style.padding = "10px";
    div.style.border = "1px solid #ddd";

    div.innerHTML = `
        <h4>الشهيد رقم ${martyrCount}</h4>
        
        <label>اسم الشهيد رباعي</label>
        <input type="text" class="mName" placeholder="الاسم رباعي">

        <label>رقم هوية الشهيد</label>
        <input type="number" class="mId" placeholder="9 أرقام">

        <label>تاريخ الاستشهاد</label>
        <input type="date" class="mDate">

        <label>صلة القرابة</label>
        <select class="mRel">
            <option value="">اختر</option>
            <option>أب</option>
            <option>أم</option>
            <option>زوج/ة</option>
            <option>ابن/ة</option>
            <option>أخ/أخت</option>
            <option> اقارب</option>
        </select>
    `;
    container.appendChild(div);
}

function saveMartyrs() {
    // 1. جلب بيانات رب الأسرة من الذاكرة
    const rawData = localStorage.getItem("generalData");
    if (!rawData) {
        alert("⚠️ خطأ: بيانات رب الأسرة مفقودة! يرجى العودة للبداية.");
        window.location.href = "index.html"; // أو register.html
        return;
    }
    const generalData = JSON.parse(rawData);

    // 2. التحقق من الاختيارات
    const choice = document.getElementById("hasMartyrs").value;
    const container = document.querySelectorAll("#martyrsContainer > div");

    if (choice === "") {
        alert("⚠️ يرجى تحديد الخيار (نعم / لا) أولاً.");
        return;
    }

    // الانتقال للطلاب إذا اختار "لا"
    if (choice === "no") {
        window.location.href = "student.html";
        return;
    }

    // التحقق من إضافة شهداء فعلياً
    if (choice === "yes" && container.length === 0) {
        alert("⚠️ اخترت 'نعم' ولكن لم تضف أي شهيد.");
        return;
    }

    // 3. تجميع بيانات الشهداء
    const martyrs = [];
    let isDataIncomplete = false;

    container.forEach(div => {
        const nameInp = div.querySelector(".mName");
        const idInp = div.querySelector(".mId");
        const dateInp = div.querySelector(".mDate");
        const relInp = div.querySelector(".mRel");

        const valName = nameInp.value.trim();
        const valId = idInp.value.trim();
        const valDate = dateInp.value;
        const valRel = relInp.value;

        // تنظيف الحدود
        [nameInp, idInp, dateInp, relInp].forEach(el => el.style.border = "1px solid #ccc");

        if (!valName || !valId || !valDate || !valRel) {
            isDataIncomplete = true;
            if (!valName) nameInp.style.border = "1px solid red";
            if (!valId) idInp.style.border = "1px solid red";
            if (!valDate) dateInp.style.border = "1px solid red";
            if (!valRel) relInp.style.border = "1px solid red";
        }
        if (!/^[0-9]{9}$/.test(valId)) {
            idInp.style.border = "1px solid red";
            alert("⚠️ رقم هوية الشهيد يجب أن يكون 9 أرقام");
            isDataIncomplete = true;
        }

        martyrs.push({
            name: valName,
            id: valId,
            date: valDate,
            rel: valRel,
            phone: generalData.phone // إضافة رقم جوال رب الأسرة لكل شهيد (اختياري ولكنه مفيد)
        });
    });

    if (isDataIncomplete) {
        alert("⚠️ يرجى تعبئة جميع الحقول المطلوبة باللون الأحمر.");
        return;
    }

    // 4. الإرسال للسيرفر
    const btn = document.querySelector(".btn-submit"); // تأكد أن الزر يحمل هذا الكلاس
    const oldText = btn.innerText;
    btn.innerText = "جاري الحفظ...";
    btn.disabled = true;

    const payload = {
        action: "saveMartyrs",
        husbandName: generalData.husbandName, // ✅ الاسم الصحيح المتوافق مع السكربت
        husbandId: generalData.husbandId,     // ✅ الاسم الصحيح المتوافق مع السكربت
        martyrs: martyrs
    };

    fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(payload)
    })
        .then(() => {
            alert("✅ تم إرسال بيانات الشهداء بنجاح.");
            window.location.href = "student.html";
        })
        .catch(err => {
            console.error(err);
            alert("❌ حدث خطأ أثناء محاولة الإرسال.");
            btn.innerText = oldText;
            btn.disabled = false;
        });

}