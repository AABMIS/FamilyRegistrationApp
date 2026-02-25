// ⚠️ تأكد من وضع الرابط الجديد هنا
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyrH0GCZRFtb8CID1ddBuyxE6v4Gg8xu25Si7NeHKeRtfTTD5ljq-MZkNHYdU5kiP6Buw/exec";

let studentCount = 0;
const maxStudents = 10;

// إظهار/إخفاء القسم
function toggleStudent() {
    const choice = document.getElementById("hasStudent").value;
    document.getElementById("studentSection").style.display = (choice === "yes") ? "block" : "none";
}

// إضافة طالب جديد
function addStudent() {
    if (studentCount >= maxStudents) {
        alert("الحد الأقصى 10 طلاب فقط");
        return;
    }
    studentCount++;

    const container = document.getElementById("studentContainer");
    const div = document.createElement("div");

    // تنسيق البطاقة
    div.style.border = "1px solid #ccc";
    div.style.padding = "15px";
    div.style.marginBottom = "15px";
    div.style.borderRadius = "8px";
    div.style.backgroundColor = "#fdfdfd";

    div.innerHTML = `
        <h4 style="margin-top:0;">الطالب رقم ${studentCount}</h4>
        
        <label>اسم الطالب رباعي</label>
        <input type="text" class="sName" placeholder="الاسم كما في الهوية" required>

        <label>رقم الهوية</label>
        <input type="number" class="sId" placeholder="9 أرقام" required>

        <label>رقم الجوال</label>
        <input type="number" class="sPhone" placeholder="رقم للتواصل" required>

        <label>الرقم الجامعي</label>
        <input type="text" class="sUnivId" required>

        <label>التخصص</label>
        <input type="text" class="sMajor" required>

        <label>المستوى الدراسي</label>
        <select class="sLevel" required>
            <option value="">اختر</option>
            <option>سنة أولى</option>
            <option>سنة ثانية</option>
            <option>سنة ثالثة</option>
            <option>سنة رابعة</option>
            <option>سنة خامسة</option>
            <option>ماجستير/دكتوراه</option>
        </select>

        <label>اسم الجامعة</label>
        <input type="text" class="sUnivName" required>
        
        <button type="button" class="btn-delete" onclick="this.parentElement.remove(); studentCount--;" style="background-color:#ff4d4d; margin-top:10px;">🗑️ حذف</button>
    `;
    container.appendChild(div);
}

// دالة الحفظ النهائي
function saveStudent() {

    const rawData = localStorage.getItem("generalData");

    if (!rawData) {
        alert("⚠️ بيانات رب الأسرة مفقودة");
        return;
    }

    const generalData = JSON.parse(rawData);

    const choice = document.getElementById("hasStudent").value;
    const container = document.querySelectorAll("#studentContainer > div");

    if (choice === "") {
        alert("⚠️ اختر نعم أو لا أولاً");
        return;
    }

    if (choice === "no") {
        finishRegistration();
        return;
    }

    if (choice === "yes" && container.length === 0) {
        alert("⚠️ يجب إضافة طالب واحد على الأقل");
        return;
    }

    const students = [];
    const usedIds = new Set();

    let hasError = false;

    container.forEach(div => {

        const nameInp = div.querySelector(".sName");
        const idInp = div.querySelector(".sId");
        const phoneInp = div.querySelector(".sPhone");
        const uIdInp = div.querySelector(".sUnivId");
        const majorInp = div.querySelector(".sMajor");
        const levelInp = div.querySelector(".sLevel");
        const univInp = div.querySelector(".sUnivName");

        const vName = nameInp.value.trim();
        const vId = idInp.value.trim();
        const vPhone = phoneInp.value.trim();
        const vUid = uIdInp.value.trim();
        const vMajor = majorInp.value.trim();
        const vLevel = levelInp.value;
        const vUniv = univInp.value.trim();

        [nameInp, idInp, phoneInp, uIdInp, majorInp, levelInp, univInp]
            .forEach(el => el.style.border = "1px solid #ccc");

        if (
            !vName ||
            !vId ||
            !vPhone ||
            !vUid ||
            !vMajor ||
            !vLevel ||
            !vUniv
        ) {
            hasError = true;

            if (!vName) nameInp.style.border = "1px solid red";
            if (!vId) idInp.style.border = "1px solid red";
            if (!vPhone) phoneInp.style.border = "1px solid red";
            if (!vUid) uIdInp.style.border = "1px solid red";
            if (!vMajor) majorInp.style.border = "1px solid red";
            if (!vLevel) levelInp.style.border = "1px solid red";
            if (!vUniv) univInp.style.border = "1px solid red";
        }

        if (!/^\d{9}$/.test(vId)) {
            idInp.style.border = "1px solid red";
            hasError = true;
        }

        if (!/^05\d{8}$/.test(vPhone)) {
            phoneInp.style.border = "1px solid red";
            hasError = true;
        }

        if (usedIds.has(vId)) {
            alert("❌ يوجد تكرار في رقم هوية الطلاب");
            idInp.style.border = "1px solid red";
            hasError = true;
        }

        const today = new Date().toISOString().split("T")[0];

        students.push({
            name: vName,
            id: vId,
            phone: vPhone,
            uId: vUid,
            major: vMajor,
            level: vLevel,
            univ: vUniv
        });

        usedIds.add(vId);
    });

    if (hasError) {
        alert("⚠️ يرجى تعبئة جميع بيانات الطلاب بشكل صحيح");
        return;
    }

    const btn = document.querySelector(".btn-submit");
    const oldText = btn.innerText;

    btn.innerText = "جاري الحفظ...";
    btn.disabled = true;

    const payload = {
        action: "saveStudent",
        husbandName: generalData.husbandName,
        husbandId: generalData.husbandId,
        students: students
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
                finishRegistration()
            }

            btn.innerText = oldText;
            btn.disabled = false;

        })
        .catch(err => {
            alert("خطأ في الاتصال");
            btn.innerText = oldText;
            btn.disabled = false;
        });
}

// دالة الإنهاء وتنظيف الذاكرة
function finishRegistration() {
    alert("✅ تم تسجيل العائلة بنجاح!\nشكراً لتعاونكم.");
    localStorage.clear(); // 🧹 تنظيف الذاكرة بالكامل
    window.location.href = "index.html"; // العودة للصفحة الرئيسية
}