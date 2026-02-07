const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzMsMmEoxviek7_7CE75m50mqcn7YMHWHMpYdSr9HPVE2RxW5nnWDFtrDt4oJDTovwo6g/exec";

// متغير لتخزين البيانات الأصلية (لمقارنة التغييرات إن أردت لاحقاً)
let originalData = {};

// ==========================================
// 1️⃣ دالة البحث وجلب البيانات
// ==========================================
async function fetchData() {
    const id = document.getElementById("searchId").value.trim();
    const msg = document.getElementById("msg");
    const formSection = document.getElementById("updateFormSection");

    if (id.length < 9) {
        alert("يرجى إدخال رقم هوية صحيح (9 أرقام)");
        return;
    }

    msg.style.display = "block";
    msg.innerText = "جاري البحث...";
    formSection.style.display = "none";

    try {
        const response = await fetch(`${SCRIPT_URL}?action=getAllData&id=${id}`);
        const data = await response.json();

        if (data.found) {
            msg.style.display = "none";
            formSection.style.display = "block";
            originalData = data; // حفظ نسخة

            // تعبئة البيانات
            populateForm(data);
            alert("✅ تم جلب البيانات بنجاح، يمكنك التعديل الآن.");
        } else {
            msg.innerText = "❌ الرقم غير موجود في السجلات.";
            msg.style.color = "red";
        }
    } catch (error) {
        console.error(error);
        msg.innerText = "حدث خطأ في الاتصال بالسيرفر.";
        msg.style.color = "red";
    }
}

// ==========================================
// 2️⃣ دالة تعبئة النموذج (Populate Form)
// ==========================================
function populateForm(data) {
    const f = data.family;

    // 1. تعبئة بيانات الأب (القسم العام)
    setVal("husbandId", f.husbandId);
    setVal("husbandName", f.husbandName);
    setVal("husbandBirth", f.husbandBirth);
    setVal("status", f.status);
    setVal("phone", f.phone);
    setVal("altPhone", f.altPhone);
    setVal("husbandIll", f.husbandIll);
    setVal("husbandIllType", f.husbandIllType);
    setVal("wifeName", f.wifeName);
    setVal("wifeId", f.wifeId);
    setVal("wifeBirth", f.wifeBirth);
    setVal("wifeIll", f.wifeIll);
    setVal("wifeIllType", f.wifeIllType);
    setVal("familyCount", f.familyCount);
    setVal("maleCount", f.maleCount);
    setVal("femaleCount", f.femaleCount);
    setVal("address", f.address);
    setVal("displacement", f.displacement);
    setVal("work", f.work);
    setVal("medicalNeeds", f.medicalNeeds);

    // 2. تعبئة الأبناء
    const childrenContainer = document.getElementById("childrenContainer");
    childrenContainer.innerHTML = ""; // تنظيف القديم
    if (data.children && data.children.length > 0) {
        data.children.forEach(child => addChildRow(child));
    } else {
        // إضافة صف فارغ إذا لم يوجد أبناء
        // addChildRow(); 
    }

    // 3. تعبئة الجرحى
    const injuredContainer = document.getElementById("injuredContainer");
    injuredContainer.innerHTML = "";
    if (data.injured && data.injured.length > 0) {
        data.injured.forEach(item => addInjuredRow(item));
    }

    // 4. تعبئة الشهداء
    const martyrsContainer = document.getElementById("martyrsContainer");
    martyrsContainer.innerHTML = "";
    if (data.martyrs && data.martyrs.length > 0) {
        data.martyrs.forEach(item => addMartyrRow(item));
    }

    // 5. تعبئة الطلاب
    const studentContainer = document.getElementById("studentContainer");
    studentContainer.innerHTML = "";
    if (data.students && data.students.length > 0) {
        data.students.forEach(item => addStudentRow(item));
    }
}

// دالة مساعدة لتعيين القيمة
function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || "";
}

// ==========================================
// 3️⃣ دوال إضافة الصفوف (ديناميكية)
// ==========================================

// --- إضافة ابن ---
function addChildRow(data = {}) {
    const container = document.getElementById("childrenContainer");
    const div = document.createElement("div");
    div.className = "child-row border-box";
    div.innerHTML = `
        <h4>بيانات الابن</h4>
        <label>الاسم:</label> <input type="text" class="cName" value="${data.name || ''}">
        <label>الهوية:</label> <input type="number" class="cId" value="${data.id || ''}">
        <label>الجنس:</label> 
        <select class="cGender">
            <option value="ذكر" ${data.gender === 'ذكر' ? 'selected' : ''}>ذكر</option>
            <option value="أنثى" ${data.gender === 'أنثى' ? 'selected' : ''}>أنثى</option>
        </select>
        <label>الميلاد:</label> <input type="date" class="cBirth" value="${data.birth || ''}">
        <label>مريض؟:</label> 
        <select class="cIll">
            <option value="لا" ${data.ill === 'لا' ? 'selected' : ''}>لا</option>
            <option value="نعم" ${data.ill === 'نعم' ? 'selected' : ''}>نعم</option>
        </select>
        <label>نوع المرض:</label> <input type="text" class="cIllType" value="${data.illType || ''}">
        <button type="button" class="btn-delete" onclick="this.parentElement.remove()">🗑️ حذف</button>
    `;
    container.appendChild(div);
}

// --- إضافة جريح ---
function addInjuredRow(data = {}) {
    const container = document.getElementById("injuredContainer");
    const div = document.createElement("div");
    div.className = "injured-row border-box";
    div.innerHTML = `
        <h4>بيانات المصاب</h4>
        <label>الاسم:</label> <input type="text" class="iName" value="${data.name || ''}">
        <label>الهوية:</label> <input type="number" class="iId" value="${data.id || ''}">
        <label>الجوال:</label> <input type="number" class="iPhone" value="${data.phone || ''}">
        <label>نوع الإصابة:</label> <input type="text" class="iType" value="${data.type || ''}">
        <label>تاريخ الإصابة:</label> <input type="date" class="iDate" value="${data.date || ''}">
        <button type="button" class="btn-delete" onclick="this.parentElement.remove()">🗑️ حذف</button>
    `;
    container.appendChild(div);
}

// --- إضافة شهيد ---
function addMartyrRow(data = {}) {
    const container = document.getElementById("martyrsContainer");
    const div = document.createElement("div");
    div.className = "martyr-row border-box";
    div.innerHTML = `
        <h4>بيانات الشهيد</h4>
        <label>الاسم:</label> <input type="text" class="mName" value="${data.name || ''}">
        <label>الهوية:</label> <input type="number" class="mId" value="${data.id || ''}">
        <label>تاريخ الاستشهاد:</label> <input type="date" class="mDate" value="${data.date || ''}">
        <label>صلة القرابة:</label> <input type="text" class="mRel" value="${data.rel || ''}">
        <button type="button" class="btn-delete" onclick="this.parentElement.remove()">🗑️ حذف</button>
    `;
    container.appendChild(div);
}

// --- إضافة طالب ---
function addStudentRow(data = {}) {
    const container = document.getElementById("studentContainer");
    const div = document.createElement("div");
    div.className = "student-row border-box";
    div.innerHTML = `
        <h4>بيانات الطالب</h4>
        <label>الاسم:</label> <input type="text" class="sName" value="${data.name || ''}">
        <label>الهوية:</label> <input type="number" class="sId" value="${data.id || ''}">
        <label>الجوال:</label> <input type="number" class="sPhone" value="${data.phone || ''}">
        <label>الرقم الجامعي:</label> <input type="text" class="sUid" value="${data.uId || ''}">
        <label>التخصص:</label> <input type="text" class="sMajor" value="${data.major || ''}">
        <label>المستوى:</label> <input type="text" class="sLevel" value="${data.level || ''}">
        <label>الجامعة:</label> <input type="text" class="sUniv" value="${data.univ || ''}">
        <button type="button" class="btn-delete" onclick="this.parentElement.remove()">🗑️ حذف</button>
    `;
    container.appendChild(div);
}

// ==========================================
// 4️⃣ دالة التنقل بين الخطوات (Next/Prev)
// ==========================================
function nextStep(current) {
    document.getElementById(`step${current}`).style.display = "none"; // إخفاء الحالي
    document.getElementById(`step${current + 1}`).style.display = "block"; // إظهار التالي
}

function prevStep(current) {
    document.getElementById(`step${current}`).style.display = "none";
    document.getElementById(`step${current - 1}`).style.display = "block";
}

// ==========================================
// 5️⃣ دالة الحفظ النهائي (Submit Updates)
// ==========================================
async function submitUpdates() {
    const btn = document.querySelector("button[onclick='submitUpdates()']");
    btn.innerText = "جاري الحفظ...";
    btn.disabled = true;

    try {
        // 1. تجميع بيانات الأب
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

        // 2. تجميع الأبناء
        const children = Array.from(document.querySelectorAll("#childrenContainer .child-row")).map(row => ({
            name: row.querySelector(".cName").value,
            id: row.querySelector(".cId").value,
            gender: row.querySelector(".cGender").value,
            birth: row.querySelector(".cBirth").value,
            ill: row.querySelector(".cIll").value,
            illType: row.querySelector(".cIllType").value
        }));

        // 3. تجميع الجرحى
        const injured = Array.from(document.querySelectorAll("#injuredContainer .injured-row")).map(row => ({
            name: row.querySelector(".iName").value,
            id: row.querySelector(".iId").value,
            phone: row.querySelector(".iPhone").value,
            type: row.querySelector(".iType").value,
            date: row.querySelector(".iDate").value
        }));

        // 4. تجميع الشهداء
        const martyrs = Array.from(document.querySelectorAll("#martyrsContainer .martyr-row")).map(row => ({
            name: row.querySelector(".mName").value,
            id: row.querySelector(".mId").value,
            date: row.querySelector(".mDate").value,
            rel: row.querySelector(".mRel").value
        }));

        // 5. تجميع الطلاب
        const students = Array.from(document.querySelectorAll("#studentContainer .student-row")).map(row => ({
            name: row.querySelector(".sName").value,
            id: row.querySelector(".sId").value,
            phone: row.querySelector(".sPhone").value,
            uId: row.querySelector(".sUid").value,
            major: row.querySelector(".sMajor").value,
            level: row.querySelector(".sLevel").value,
            univ: row.querySelector(".sUniv").value
        }));

        // 6. الإرسال
        const payload = {
            action: "updateAll",
            husbandId: husbandData.husbandId,
            husband: husbandData,
            children: children,
            injured: injured,
            martyrs: martyrs,
            students: students
        };

        const response = await await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify(payload)
        });
        alert("✅ تم تعديل البيانات بنجاح.");
         window.location.href = "index.html"; // العودة للصفحة الرئيسية


    } catch (error) {
        console.error(error);
        alert("❌ حدث خطأ أثناء الحفظ: " + error.message);
        btn.innerText = "💾 حفظ التعديلات النهائية";
        btn.disabled = false;
    }
}

// دالة مساعدة لجلب القيم
function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
}
