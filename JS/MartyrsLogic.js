const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyrH0GCZRFtb8CID1ddBuyxE6v4Gg8xu25Si7NeHKeRtfTTD5ljq-MZkNHYdU5kiP6Buw/exec";

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

    const rawData = localStorage.getItem("generalData");

    if (!rawData) {
        alert("⚠️ بيانات رب الأسرة مفقودة!");
        return;
    }

    const generalData = JSON.parse(rawData);

    const choice = document.getElementById("hasMartyrs").value;
    const container = document.querySelectorAll("#martyrsContainer > div");

    if (choice === "") {
        alert("⚠️ اختر نعم أو لا أولاً");
        return;
    }

    if (choice === "no") {
        window.location.href = "student.html";
        return;
    }

    if (choice === "yes" && container.length === 0) {
        alert("⚠️ يجب إضافة شهيد واحد على الأقل");
        return;
    }

    const martyrs = [];
    const usedIds = new Set();
    const today = new Date().toISOString().split("T")[0];

    let hasError = false;

    container.forEach(div => {

        const nameInp = div.querySelector(".mName");
        const idInp = div.querySelector(".mId");
        const dateInp = div.querySelector(".mDate");
        const relInp = div.querySelector(".mRel");

        const vName = nameInp.value.trim();
        const vId = idInp.value.trim();
        const vDate = dateInp.value;
        const vRel = relInp.value;

        [nameInp, idInp, dateInp, relInp].forEach(el =>
            el.style.border = "1px solid #ccc"
        );

        if (
            !vName ||
            !vId ||
            !vDate ||
            !vRel ||
            !/^\d{9}$/.test(vId) ||
            vDate > today
        ) {
            hasError = true;

            if (!vName) nameInp.style.border = "1px solid red";
            if (!vId || !/^\d{9}$/.test(vId)) idInp.style.border = "1px solid red";
            if (!vDate || vDate > today) dateInp.style.border = "1px solid red";
            if (!vRel) relInp.style.border = "1px solid red";

            return;
        }

        if (usedIds.has(vId)) {
            alert("❌ يوجد تكرار في رقم هوية أحد الشهداء");
            hasError = true;
            idInp.style.border = "1px solid red";
            return;
        }

        usedIds.add(vId);

        martyrs.push({
            name: vName,
            id: vId,
            date: vDate,
            rel: vRel,
            phone: generalData.phone
        });

    });

    if (hasError) {
        alert("⚠️ يجب تعبئة جميع بيانات الشهداء بشكل كامل وصحيح");
        return;
    }

    const btn = document.querySelector(".btn-submit");
    const oldText = btn.innerText;

    btn.innerText = "جاري الحفظ...";
    btn.disabled = true;

    const payload = {
        action: "saveMartyrs",
        husbandName: generalData.husbandName,
        husbandId: generalData.husbandId,
        martyrs: martyrs
    };

    fetch(SCRIPT_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                alert("✅ تم إرسال البيانات بنجاح.");
                window.location.href = "student.html";
                return;
            }

            btn.innerText = oldText;
            btn.disabled = false;

        })
        .catch(() => {
            alert("❌ خطأ في الاتصال");
            btn.innerText = oldText;
            btn.disabled = false;
        });
}