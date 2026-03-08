const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxbbV0r7l0BYNDmdkvvOUbBDmHL6E0XBX_7d75jaF2n4TcAYPnj4akUU21Y-nwQFZ2pOg/exec";
let idVerified = false;
// بمجرد تحميل الصفحة، نقوم بقفل التواريخ المستقبلية
document.addEventListener("DOMContentLoaded", () => {
    // الحصول على تاريخ اليوم بصيغة YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];

    // تعيين الحد الأقصى لتاريخ ميلاد الزوج
    const husbandBirth = document.getElementById("husbandBirth");
    if (husbandBirth) husbandBirth.setAttribute("max", today);

    // تعيين الحد الأقصى لتاريخ ميلاد الزوجة
    const wifeBirth = document.getElementById("wifeBirth");
    if (wifeBirth) wifeBirth.setAttribute("max", today);
});
// ==========================================
// 1️⃣ دوال مساعدة (Helpers)
// ==========================================
function setValue(elementId, value) {
    const el = document.getElementById(elementId);
    if (el) el.value = value || "";
}

function getVal(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : "";
}

function isValidId(id) {
    return /^\d{9}$/.test(id);
}

// ==========================================
// 2️⃣ دالة تفعيل/إلغاء حقول المرض الديناميكية
// ==========================================
function toggleIllnessType(selectId, inputId) {
    const selectEl = document.getElementById(selectId);
    const inputEl = document.getElementById(inputId);

    if (selectEl.value === "نعم") {
        inputEl.disabled = false;
        inputEl.required = true;
        inputEl.focus();
    } else {
        inputEl.disabled = true;
        inputEl.required = false;
        inputEl.value = ""; // تفريغ الحقل إذا تم تغيير الرأي إلى "لا"
        inputEl.style.border = ""; // إزالة أي علامة خطأ سابقة
    }
}

// ==========================================
// 3️⃣ دالة الفحص عبر السيرفر (checkId)
// ==========================================
async function checkId() {
    const id = getVal("husbandId");
    const message = document.getElementById("message");
    const restForm = document.getElementById("restForm");
    const nextBtnDiv = document.getElementById("nextSection");
    const btn = document.getElementById("checkBtn");

    // تصفير الحالة
    idVerified = false;
    restForm.style.display = "none";
    if (nextBtnDiv) nextBtnDiv.style.display = "none";
    message.textContent = "";

    if (!isValidId(id)) {
        message.textContent = "❌ يرجى إدخال رقم هوية صحيح (9 أرقام فقط).";
        message.style.color = "red";
        return;
    }

    const originalText = btn.innerText;
    btn.innerText = "جاري البحث...";
    btn.disabled = true;

    try {
        const response = await fetch(`${SCRIPT_URL}?action=getAllData&id=${id}`);
        const data = await response.json();

        const checkResp = await fetch(`${SCRIPT_URL}?action=check&id=${id}`);
        const checkStatus = await checkResp.json();

        if (checkStatus.martyr) {
            message.textContent = "❌ لا يمكن التسجيل، هذا الرقم مسجل في كشف الشهداء.";
            message.style.color = "red";
            return;
        }

        if (data.found) {
            if (data.source === "new") {
                message.textContent = "⚠️ عذراً، هذا الشخص مسجل مسبقاً في النظام الجديد.";
                message.style.color = "orange";
                return;
            }
            if (data.source === "old") {
                message.textContent = "✅ الرقم مسموح له بالتسجيل، يرجى استكمال البيانات.";
                message.style.color = "green";
                idVerified = true;

                restForm.style.display = "block";
                if (nextBtnDiv) nextBtnDiv.style.display = "block";

                // تعبئة البيانات المتوفرة
                const h = data.family;
                setValue("husbandName", h.husbandName);
                setValue("phone", h.phone);
                setValue("altPhone", h.altPhone);
                setValue("wifeName", h.wifeName);
                setValue("wifeId", h.wifeId);
                setValue("familyCount", h.familyCount);
            }
        } else {
            message.textContent = "❌ الرقم غير مدرج في الكشوفات الأساسية. راجع الإدارة.";
            message.style.color = "red";
        }
    } catch (error) {
        console.error(error);
        message.textContent = "❌ حدث خطأ في الاتصال بالخادم، حاول مرة أخرى.";
        message.style.color = "red";
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// ==========================================
// 4️⃣ الفلديشن الصارم قبل الانتقال
// ==========================================
function validateAndGo() {
    if (!idVerified) {
        alert("يجب التحقق من رقم الهوية أولاً عبر الزر المخصص.");
        return;
    }

    const restForm = document.getElementById("restForm");

    // 1. فحص جميع الحقول التي تحمل وسم required
    const requiredInputs = restForm.querySelectorAll("input[required], select[required]");
    for (let input of requiredInputs) {
        if (input.value.trim() === "") {
            let label = input.previousElementSibling ? input.previousElementSibling.innerText : "هذا الحقل";
            alert("يرجى تعبئة: " + label);
            input.style.border = "2px solid red"; // تمييز الحقل الفارغ باللون الأحمر
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            input.focus();
            return; // إيقاف العملية فوراً
        } else {
            input.style.border = ""; // إزالة اللون الأحمر إذا تم التعبئة
        }
    }

    // 2. التحقق من صحة أرقام الجوالات
    const phone = getVal("phone");
    const alt = getVal("altPhone");

    if (!/^05\d{8}$/.test(phone)) {
        alert("رقم الجوال الأساسي يجب أن يبدأ بـ 05 ويتكون من 10 أرقام.");
        document.getElementById("phone").focus();
        return;
    }

    if (alt !== "" && !/^05\d{8}$/.test(alt)) {
        alert("رقم الجوال البديل غير صحيح، يجب أن يبدأ بـ 05 ويتكون من 10 أرقام.");
        document.getElementById("altPhone").focus();
        return;
    }

    // 3. التحقق من الهويات وتواريخ الميلاد
    const husbandId = getVal("husbandId");
    const wifeId = getVal("wifeId");
    const today = new Date().toISOString().split("T")[0];

    if (!isValidId(wifeId)) {
        alert("رقم هوية الزوجة غير صحيح (يجب أن يكون 9 أرقام).");
        document.getElementById("wifeId").focus();
        return;
    }

    if (husbandId === wifeId) {
        alert("خطأ: لا يمكن أن يكون رقم هوية الزوج والزوجة متطابقين.");
        document.getElementById("wifeId").focus();
        return;
    }

    if (getVal("husbandBirth") > today || getVal("wifeBirth") > today) {
        alert("خطأ: لا يمكن إدخال تاريخ ميلاد في المستقبل.");
        return;
    }

    // 4. التحقق الرياضي من أعداد أفراد الأسرة
    const total = Number(getVal("familyCount"));
    const male = Number(getVal("maleCount"));
    const female = Number(getVal("femaleCount"));

    if (total <= 0 || male < 0 || female < 0) {
        alert("أعداد أفراد الأسرة يجب أن تكون أرقاماً موجبة.");
        return;
    }

    if (male + female !== total) {
        alert(`يوجد خطأ في الحساب: عدد الذكور (${male}) + الإناث (${female}) لا يساوي العدد الكلي (${total}).`);
        document.getElementById("familyCount").focus();
        return;
    }

    // إذا وصلت الكود إلى هنا، فكل شيء سليم 100%
    saveAndProceed();
}

// ==========================================
// 5️⃣ حفظ البيانات والانتقال للصفحة التالية
// ==========================================
function saveAndProceed() {
    try {
        const generalData = {
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

        localStorage.setItem("generalData", JSON.stringify(generalData));
        window.location.href = "children.html";

    } catch (error) {
        console.error("Error saving data:", error);
        alert("حدث خطأ أثناء حفظ البيانات مؤقتاً في المتصفح. تأكد من إعدادات المتصفح.");
    }
}