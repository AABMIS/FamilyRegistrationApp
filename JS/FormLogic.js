const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxbbV0r7l0BYNDmdkvvOUbBDmHL6E0XBX_7d75jaF2n4TcAYPnj4akUU21Y-nwQFZ2pOg/exec";

// 2️⃣ دالة مساعدة لتعبئة الحقول (للاستخدام عند جلب البيانات القديمة)
function setValue(elementId, value) {
    const el = document.getElementById(elementId);
    if (el) el.value = value || "";
}

// 3️⃣ دالة مساعدة لجلب القيمة بأمان (للاستخدام عند الانتقال للتالي)
// تمنع توقف النظام إذا كان الحقل غير موجود
function getVal(id) {
    const element = document.getElementById(id);
    if (element) {
        return element.value.trim();
    }
    return ""; // يرجع نص فارغ بدل الخطأ
}
// ==========================================
// 4️⃣ دالة قيود على رقم الهوية 
// ==========================================
function isValidId(id) {
    return /^\d{9}$/.test(id);
}

let idVerified = false;
// ==========================================
// 5️⃣ دالة الفحص (checkId)
// ==========================================
async function checkId() {
    const id = document.getElementById("husbandId").value.trim();
    const message = document.getElementById("message");
    const restForm = document.getElementById("restForm");
    const nextBtnDiv = document.getElementById("nextSection");

    idVerified = false;
    // إخفاء الفورم وتصفير الرسائل
    restForm.style.display = "none";
    if (nextBtnDiv) nextBtnDiv.style.display = "none";
    message.textContent = "";

    if (!isValidId(id)) {
        message.textContent = "يرجى إدخال رقم هوية صحيح (9 أرقام أرقام فقط)";
        message.style.color = "red";
        return;
    }


    const btn = document.querySelector("button[onclick='checkId()']");
    const originalText = btn.innerText;
    btn.innerText = "جاري البحث...";
    btn.disabled = true;

    try {
        const response = await fetch(`${SCRIPT_URL}?action=getAllData&id=${id}`);
        const data = await response.json();

        console.log("نتائج الفحص:", data);

        // فحص الشهداء
        const checkResp = await fetch(`${SCRIPT_URL}?action=check&id=${id}`);
        const checkStatus = await checkResp.json();

        if (checkStatus.martyr) {
            message.textContent = "❌ لا يمكن التسجيل، هذا الرقم مسجل في كشف الشهداء.";
            message.style.color = "red";
            idVerified = false;
            return;
        }

        if (data.found) {
            // الحالة أ: موجود في الجديد
            if (data.source === "new") {
                message.textContent = "⚠️ هذا الشخص مسجل مسبقا.";
                message.style.color = "orange";
                idVerified = false;
                return;
            }

            // الحالة ب: موجود في القديم
            if (data.source === "old") {
                message.textContent = "✅ الرقم يسمح له بالتسجيل، يمكنك استكمال البيانات.";
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
            // الحالة ج: غير موجود (مرفوض حسب طلبك السابق)
            message.textContent = "❌ الرقم غير مسموح له بالتسجيل. راجع الإدارة.";
            message.style.color = "red";
            idVerified = false;
        }

    } catch (error) {
        console.error(error);
        message.textContent = "خطأ في الاتصال بالسيرفر.";
        message.style.color = "red";
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// ==========================================
// 6️⃣ دالة الانتقال للأبناء (goToChildren) - النسخة الآمنة
// ==========================================
function goToChildren() {
    try {
        // نستخدم getVal بدلاً من .value مباشرة لتجنب الأخطاء
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

        // حفظ البيانات في المتصفح للانتقال للصفحة التالية
        if (!isValidId(generalData.husbandId)) {
            alert("خطأ في البيانات، أعد المحاولة");
            return;
        }

        localStorage.setItem("generalData", JSON.stringify(generalData));

        window.location.href = "children.html";

    } catch (error) {
        console.error("Error collecting data:", error);
        alert("حدث خطأ غير متوقع، سيتم نقلك للصفحة التالية.");
    }
}

// ==========================================
// 6️⃣ دالة التحقق قبل الانتقال (validateAndGo)
// ==========================================
function validateAndGo() {
    if (!idVerified) {
        alert("يجب التحقق من رقم الهوية أولاً");
        return;
    }

    const restForm = document.getElementById("restForm");
    // نفحص فقط الحقول الظاهرة والمطلوبة
    const inputs = restForm.querySelectorAll("input[required], select[required]");

    for (let input of inputs) {
        if (input.value.trim() === "") {
            // معرفة اسم الحقل لتوضيح الرسالة
            let label = input.previousElementSibling?.innerText || "حقل مطلوب";
            alert("يرجى تعبئة: " + label);
            input.focus();
            return;
        }
    }
    // ==========================================
    //  التحقق من رقم الجوال والجوال البديل 
    // ==========================================
    const phone = getVal("phone");
    const alt = getVal("altPhone");

    if (!/^05\d{8}$/.test(phone)) {
        alert("رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام");
        return;
    }

    if (alt && !/^05\d{8}$/.test(alt)) {
        alert("رقم الجوال البديل غير صحيح");
        return;
    }


    // ==========================================
    // التجقق من  عدد الذكور وعدد الاناث حسب عدد الكلي للاسؤة
    // ==========================================
    const total = Number(getVal("familyCount"));
    const male = Number(getVal("maleCount"));
    const female = Number(getVal("femaleCount"));
    const today = new Date().toISOString().split("T")[0];

    if (male + female !== total) {
        alert("عدد الذكور والإناث يجب أن يساوي عدد أفراد العائلة بالضبط");
        return;
    }

    if (total <= 0 || male < 0 || female < 0) {
        alert("الأعداد يجب أن تكون أرقام صحيحة موجبة");
        return;
    }
    // ==========================================
    // التجقق من رقم الهوية
    // ==========================================

    if (!/^\d{9}$/.test(getVal("husbandId"))) {
        alert("رقم الهوية غير صحيح");
        return;
    }
    // ==========================================
    //   التحقق من رقم هوية الزوجة
    // ==========================================

    if (!isValidId(getVal("wifeId"))) {
        alert("رقم هوية الزوجة غير صحيح (9 أرقام)");
        return;
    }

    if (getVal("husbandId") === getVal("wifeId")) {
        alert("لا يمكن أن يكون رقم هوية الزوجة نفس رقم الزوج");
        return;
    }
    // ==========================================
    //   منع إدخال نوع مرض بدون اختيار نعم
    // ==========================================

    if (getVal("husbandIll") === "نعم" && !getVal("husbandIllType")) {
        alert("اكتب نوع مرض الزوج");
        return;
    }

    if (getVal("wifeIll") === "نعم" && !getVal("wifeIllType")) {
        alert("اكتب نوع مرض الزوجة");
        return;
    }
   // ==========================================
    //   منع إدخال تاريخ ميلاد مستقبلي
    // ==========================================

    if (getVal("husbandBirth") > today) {
        alert("تاريخ ميلاد الزوج غير صحيح");
        return;
    }

    if (getVal("wifeBirth") > today) {
        alert("تاريخ ميلاد الزوجة غير صحيح");
        return;
    }
    goToChildren();
}