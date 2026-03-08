const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxbbV0r7l0BYNDmdkvvOUbBDmHL6E0XBX_7d75jaF2n4TcAYPnj4akUU21Y-nwQFZ2pOg/exec";
let originalData = {};
// قفل التواريخ المستقبلية للحقول الثابتة عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    const today = new Date().toISOString().split("T")[0];
    const husbandBirth = document.getElementById("husbandBirth");
    const wifeBirth = document.getElementById("wifeBirth");

    if (husbandBirth) husbandBirth.setAttribute("max", today);
    if (wifeBirth) wifeBirth.setAttribute("max", today);
});
// ==========================================
// 1️⃣ دوال مساعدة
// ==========================================
function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
}

function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || "";
}

function isValidId(id) {
    return /^\d{9}$/.test(id);
}

// دالة التحكم في المرض (عامة للاستخدام في جميع الأقسام)
function toggleIllness(selectId, inputId) {
    const selectEl = typeof selectId === 'string' ? document.getElementById(selectId) : selectId;
    const inputEl = typeof inputId === 'string' ? document.getElementById(inputId) : inputId;

    if (selectEl.value === "نعم") {
        inputEl.disabled = false;
        inputEl.required = true;
    } else {
        inputEl.disabled = true;
        inputEl.required = false;
        inputEl.value = "";
        inputEl.style.border = "";
    }
}

// ==========================================
// 2️⃣ دالة البحث وجلب البيانات
// ==========================================
async function fetchData() {
    const id = getVal("searchId");
    const msg = document.getElementById("msg");
    const formSection = document.getElementById("updateFormSection");
    const btn = document.getElementById("searchBtn");

    if (!isValidId(id)) {
        alert("❌ يرجى إدخال رقم هوية صحيح (9 أرقام).");
        return;
    }

    msg.style.display = "block";
    msg.innerText = "جاري البحث في قاعدة البيانات ⏳...";
    msg.style.color = "#2196F3";
    formSection.style.display = "none";
    btn.disabled = true;

    try {
        const response = await fetch(`${SCRIPT_URL}?action=getAllData&id=${id}`);
        const data = await response.json();

        if (data.found) {
            msg.style.display = "none";
            formSection.style.display = "block";
            originalData = data;
            populateForm(data);
            alert("✅ تم جلب البيانات بنجاح. يمكنك التعديل الآن والتنقل بين الأقسام.");
        } else {
            msg.innerText = "❌ الرقم غير موجود في السجلات.";
            msg.style.color = "red";
        }
    } catch (error) {
        console.error(error);
        msg.innerText = "❌ حدث خطأ في الاتصال بالسيرفر.";
        msg.style.color = "red";
    } finally {
        btn.disabled = false;
    }
}

// ==========================================
// 3️⃣ تعبئة النموذج بالبيانات القادمة
// ==========================================
function populateForm(data) {
    const f = data.family;

    // 1. القسم العام
    setVal("husbandId", f.husbandId);
    setVal("husbandName", f.husbandName);
    setVal("husbandBirth", f.husbandBirth);
    setVal("status", f.status);
    setVal("phone", f.phone);
    setVal("altPhone", f.altPhone);
    setVal("wifeName", f.wifeName);
    setVal("wifeId", f.wifeId);
    setVal("wifeBirth", f.wifeBirth);
    setVal("familyCount", f.familyCount);
    setVal("maleCount", f.maleCount);
    setVal("femaleCount", f.femaleCount);
    setVal("address", f.address);
    setVal("displacement", f.displacement);
    setVal("work", f.work);
    setVal("medicalNeeds", f.medicalNeeds);

    // تفعيل الأمراض برمجياً إذا كانت "نعم"
    setVal("husbandIll", f.husbandIll);
    toggleIllness('husbandIll', 'husbandIllType');
    setVal("husbandIllType", f.husbandIllType);

    setVal("wifeIll", f.wifeIll);
    toggleIllness('wifeIll', 'wifeIllType');
    setVal("wifeIllType", f.wifeIllType);

    // 2. تفريغ وتعبئة القوائم الديناميكية
    document.getElementById("childrenContainer").innerHTML = "";
    if (data.children) data.children.forEach(child => addChildRow(child));

    document.getElementById("injuredContainer").innerHTML = "";
    if (data.injured) data.injured.forEach(item => addInjuredRow(item));

    document.getElementById("martyrsContainer").innerHTML = "";
    if (data.martyrs) data.martyrs.forEach(item => addMartyrRow(item));

    document.getElementById("studentContainer").innerHTML = "";
    if (data.students) data.students.forEach(item => addStudentRow(item));

    // إرجاع المستخدم للخطوة الأولى دائماً عند بحث جديد
    for (let i = 1; i <= 5; i++) {
        document.getElementById(`step${i}`).style.display = i === 1 ? "block" : "none";
    }
}

// ==========================================
// 4️⃣ دوال إنشاء الصفوف الديناميكية (مع توافق الأمراض)
// ==========================================
function addChildRow(data = {}) {
    const container = document.getElementById("childrenContainer");
    const div = document.createElement("div");
    const today = new Date().toISOString().split("T")[0];
    div.className = "child-row";
    div.style.cssText = "border: 2px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 8px;";

    div.innerHTML = `
        <h4 style="margin-top:0; border-bottom:1px solid #ccc; padding-bottom:5px;">👤 بيانات الابن</h4>
        <label>الاسم رباعي:</label> <input type="text" class="cName" value="${data.name || ''}" required>
        <label>الهوية:</label> <input type="text" class="cId" inputmode="numeric" value="${data.id || ''}" required>
        <label>الجنس:</label> 
        <select class="cGender" required>
            <option value="ذكر" ${data.gender === 'ذكر' ? 'selected' : ''}>ذكر</option>
            <option value="أنثى" ${data.gender === 'أنثى' ? 'selected' : ''}>أنثى</option>
        </select>
        <label>الميلاد:</label> <input type="date" class="cBirth" value="${data.birth || ''}" required max="${today}">        <label>مريض؟:</label> 
        <select class="cIll" required onchange="toggleIllness(this, this.nextElementSibling.nextElementSibling)">
            <option value="لا" ${data.ill === 'لا' ? 'selected' : ''}>لا</option>
            <option value="نعم" ${data.ill === 'نعم' ? 'selected' : ''}>نعم</option>
        </select>
        <label>نوع المرض:</label> <input type="text" class="cIllType" value="${data.illType || ''}" ${data.ill === 'نعم' ? 'required' : 'disabled'}>
        <button type="button" class="btn-delete" onclick="this.parentElement.remove()" style="background:#ff4d4d; margin-top:10px;">🗑️ حذف</button>
    `;
    container.appendChild(div);
}

function addInjuredRow(data = {}) {
    const container = document.getElementById("injuredContainer");
    const div = document.createElement("div");
    const today = new Date().toISOString().split("T")[0];
    div.className = "injured-row";
    div.style.cssText = "border: 2px solid #ff9800; padding: 15px; margin-bottom: 15px; border-radius: 8px;";

    div.innerHTML = `
        <h4 style="margin-top:0; border-bottom:1px solid #ffcc80; padding-bottom:5px; color:#e65100;">🩹 بيانات المصاب</h4>
        <label>الاسم:</label> <input type="text" class="iName" value="${data.name || ''}" required>
        <label>الهوية:</label> <input type="text" class="iId" inputmode="numeric" value="${data.id || ''}" required>
        <label>الجوال:</label> <input type="text" class="iPhone" inputmode="numeric" value="${data.phone || ''}" required>
        <label>نوع الإصابة:</label> <input type="text" class="iType" value="${data.type || ''}" required>
       <label>تاريخ الإصابة:</label> <input type="date" class="iDate" value="${data.date || ''}" required max="${today}">
        <button type="button" class="btn-delete" onclick="this.parentElement.remove()" style="background:#ff4d4d; margin-top:10px;">🗑️ حذف</button>
    `;
    container.appendChild(div);
}

function addMartyrRow(data = {}) {
    const container = document.getElementById("martyrsContainer");
    const div = document.createElement("div");
    const today = new Date().toISOString().split("T")[0];
    div.className = "martyr-row";
    div.style.cssText = "border: 2px solid #9e9e9e; padding: 15px; margin-bottom: 15px; border-radius: 8px;";

    div.innerHTML = `
        <h4 style="margin-top:0; border-bottom:1px solid #bdbdbd; padding-bottom:5px; color:#424242;">🕊️ بيانات الشهيد</h4>
        <label>الاسم:</label> <input type="text" class="mName" value="${data.name || ''}" required>
        <label>الهوية:</label> <input type="text" class="mId" inputmode="numeric" value="${data.id || ''}" required>
        <label>تاريخ الاستشهاد:</label> <input type="date" class="mDate" value="${data.date || ''}" required max="${today}">
        <label>صلة القرابة:</label> 
        <select class="mRel" required>
            <option value="أب" ${data.rel === 'أب' ? 'selected' : ''}>أب</option>
            <option value="أم" ${data.rel === 'أم' ? 'selected' : ''}>أم</option>
            <option value="زوج/ة" ${data.rel === 'زوج/ة' ? 'selected' : ''}>زوج/ة</option>
            <option value="ابن/ة" ${data.rel === 'ابن/ة' ? 'selected' : ''}>ابن/ة</option>
            <option value="أخ/أخت" ${data.rel === 'أخ/أخت' ? 'selected' : ''}>أخ/أخت</option>
            <option value="أقارب" ${data.rel === 'أقارب' ? 'selected' : ''}>أقارب</option>
        </select>
        <button type="button" class="btn-delete" onclick="this.parentElement.remove()" style="background:#ff4d4d; margin-top:10px;">🗑️ حذف</button>
    `;
    container.appendChild(div);
}

function addStudentRow(data = {}) {
    const container = document.getElementById("studentContainer");
    const div = document.createElement("div");
    div.className = "student-row";
    div.style.cssText = "border: 2px solid #4CAF50; padding: 15px; margin-bottom: 15px; border-radius: 8px;";

    div.innerHTML = `
        <h4 style="margin-top:0; border-bottom:1px solid #a5d6a7; padding-bottom:5px; color:#2e7d32;">🎓 بيانات الطالب</h4>
        <label>الاسم:</label> <input type="text" class="sName" value="${data.name || ''}" required>
        <label>الهوية:</label> <input type="text" class="sId" inputmode="numeric" value="${data.id || ''}" required>
        <label>الجوال:</label> <input type="text" class="sPhone" inputmode="numeric" value="${data.phone || ''}" required>
        <label>الجامعة:</label> <input type="text" class="sUniv" value="${data.univ || ''}" required>
        <label>الرقم الجامعي:</label> <input type="text" class="sUid" value="${data.uId || ''}" required>
        <label>التخصص:</label> <input type="text" class="sMajor" value="${data.major || ''}" required>
        <label>المستوى:</label> 
        <select class="sLevel" required>
            <option value="${data.level || ''}" selected hidden>${data.level || 'اختر'}</option>
            <option value="دبلوم">دبلوم</option>
            <option value="سنة أولى">سنة أولى</option>
            <option value="سنة ثانية">سنة ثانية</option>
            <option value="سنة ثالثة">سنة ثالثة</option>
            <option value="سنة رابعة">سنة رابعة</option>
            <option value="سنة خامسة">سنة خامسة</option>
            <option value="سنة سادسة">سنة سادسة</option>
            <option value="دراسات عليا">دراسات عليا</option>
        </select>
        <button type="button" class="btn-delete" onclick="this.parentElement.remove()" style="background:#ff4d4d; margin-top:10px;">🗑️ حذف</button>
    `;
    container.appendChild(div);
}

// ==========================================
// 5️⃣ فلديشن الخطوات والتنقل
// ==========================================
function validateStep(stepNum) {
    const currentSection = document.getElementById(`step${stepNum}`);

    // 1. فحص الحقول الفارغة
    const requiredInputs = currentSection.querySelectorAll("input[required], select[required]");
    for (let input of requiredInputs) {
        if (input.value.trim() === "") {
            alert("⚠️ يرجى تعبئة جميع الحقول الإجبارية باللون الأحمر قبل الانتقال.");
            input.style.border = "2px solid red";
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            input.focus();
            return false;
        } else {
            input.style.border = "";
        }
    }

    // 2. 🔴 فحص التواريخ المستقبلية (الكود السحري)
    const today = new Date().toISOString().split("T")[0];
    const dateInputs = currentSection.querySelectorAll("input[type='date']");
    for (let dateInput of dateInputs) {
        if (dateInput.value && dateInput.value > today) {
            alert("❌ خطأ: لا يمكن إدخال تاريخ في المستقبل!");
            dateInput.style.border = "2px solid red";
            dateInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            dateInput.focus();
            return false;
        } else {
            dateInput.style.border = "";
        }
    }

    // 3. فلديشن مخصص للخطوة الأولى (الأساسية)
    if (stepNum === 1) {
        const phone = getVal("phone");
        const wifeId = getVal("wifeId");

        if (!/^05\d{8}$/.test(phone)) {
            alert("❌ رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام.");
            return false;
        }
        if (!isValidId(wifeId)) {
            alert("❌ رقم هوية الزوجة غير صحيح.");
            return false;
        }

        const total = Number(getVal("familyCount"));
        const male = Number(getVal("maleCount"));
        const female = Number(getVal("femaleCount"));
        if (male + female !== total) {
            alert("❌ عدد الذكور والإناث لا يساوي العدد الكلي لأفراد الأسرة.");
            return false;
        }
    }

    return true; // إذا نجح الفحص
}

function nextStep(current) {
    if (!validateStep(current)) return; // لا ينتقل إذا كان هناك خطأ
    document.getElementById(`step${current}`).style.display = "none";
    document.getElementById(`step${current + 1}`).style.display = "block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStep(current) {
    document.getElementById(`step${current}`).style.display = "none";
    document.getElementById(`step${current - 1}`).style.display = "block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// 6️⃣ الحفظ النهائي
// ==========================================
async function submitUpdates() {
    if (!validateStep(5)) return; // فحص الخطوة الأخيرة قبل الحفظ

    const btn = document.querySelector("button[onclick='submitUpdates()']");
    const originalText = btn.innerText;
    btn.innerText = "جاري رفع التعديلات للسيرفر ⏳...";
    btn.disabled = true;

    try {
        const husbandData = {
            husbandId: getVal("husbandId"),
            husbandName: getVal("husbandName"),
            husbandBirth: getVal("husbandBirth"),
            status: getVal("status"),
            phone: getVal("phone"),
            altPhone: getVal("altPhone"),
            husbandIll: getVal("husbandIll"),
            husbandIllType: getVal("husbandIllType"),
            wifeName: getVal("wifeName"),
            wifeId: getVal("wifeId"),
            wifeBirth: getVal("wifeBirth"),
            wifeIll: getVal("wifeIll"),
            wifeIllType: getVal("wifeIllType"),
            familyCount: getVal("familyCount"),
            maleCount: getVal("maleCount"),
            femaleCount: getVal("femaleCount"),
            address: getVal("address"),
            displacement: getVal("displacement"),
            work: getVal("work"),
            medicalNeeds: getVal("medicalNeeds")
        };

        const children = Array.from(document.querySelectorAll("#childrenContainer .child-row")).map(row => ({
            name: row.querySelector(".cName").value,
            id: row.querySelector(".cId").value,
            gender: row.querySelector(".cGender").value,
            birth: row.querySelector(".cBirth").value,
            ill: row.querySelector(".cIll").value,
            illType: row.querySelector(".cIllType").value
        }));

        const injured = Array.from(document.querySelectorAll("#injuredContainer .injured-row")).map(row => ({
            name: row.querySelector(".iName").value,
            id: row.querySelector(".iId").value,
            phone: row.querySelector(".iPhone").value,
            type: row.querySelector(".iType").value,
            date: row.querySelector(".iDate").value
        }));

        const martyrs = Array.from(document.querySelectorAll("#mart शहीيدContainer .martyr-row")).map(row => ({
            name: row.querySelector(".mName").value,
            id: row.querySelector(".mId").value,
            date: row.querySelector(".mDate").value,
            rel: row.querySelector(".mRel").value
        }));

        const students = Array.from(document.querySelectorAll("#studentContainer .student-row")).map(row => ({
            name: row.querySelector(".sName").value,
            id: row.querySelector(".sId").value,
            phone: row.querySelector(".sPhone").value,
            uId: row.querySelector(".sUid").value,
            major: row.querySelector(".sMajor").value,
            level: row.querySelector(".sLevel").value,
            univ: row.querySelector(".sUniv").value
        }));

        const payload = {
            action: "updateAll",
            husbandId: husbandData.husbandId,
            husband: husbandData,
            children: children,
            injured: injured,
            martyrs: martyrs,
            students: students
        };

        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" }, // تم التعديل لتجنب CORS
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.status === "success") {
            alert("✅ تم تحديث بيانات العائلة بنجاح.");
            window.location.reload();
        } else {
            throw new Error(result.msg || "فشل التحديث من السيرفر");
        }

    } catch (error) {
        console.error(error);
        alert("❌ حدث خطأ أثناء الحفظ: " + error.message);
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}