const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzMsMmEoxviek7_7CE75m50mqcn7YMHWHMpYdSr9HPVE2RxW5nnWDFtrDt4oJDTovwo6g/exec";

let injuredCount = 0;
const maxInjured = 8;

function toggleInjured() {
    const choice = document.getElementById("hasInjured").value;
    document.getElementById("injuredSection").style.display =
        choice === "yes" ? "block" : "none";
}

function addInjured() {
    if (injuredCount >= maxInjured) {
        alert("الحد الأقصى 8 مصابين فقط");
        return;
    }

    injuredCount++;

    const container = document.getElementById("injuredContainer");
    const div = document.createElement("div");

    div.style.border = "1px solid #ccc";
    div.style.padding = "15px";
    div.style.marginBottom = "15px";

    div.innerHTML = `
        <h4>المصاب رقم ${injuredCount}</h4>

        <label>اسم المصاب</label>
        <input type="text" class="injuredName" required>

        <label>هوية المصاب</label>
        <input type="text" class="injuredId" required>

        <label>رقم الجوال</label>
        <input type="text" class="injuredPhone" required>

        <label>نوع الإصابة</label>
        <input type="text" class="injuredType" required>

        <label>تاريخ الإصابة</label>
        <input type="date" class="injuredDate" required>
    `;

    container.appendChild(div);
}
function saveInjured() {
    // 1. ✅ التعديل هنا: جلب رقم الهوية من داخل الكائن generalData
    const storedData = localStorage.getItem("generalData");
    if (!storedData) {
        alert("⚠️ خطأ: لا توجد بيانات للزوج! يرجى العودة للصفحة الأولى وتعبئة البيانات.");
        return;
    }
    const generalData = JSON.parse(storedData);
    const husbandId = generalData.husbandId; // الآن حصلنا على الرقم الصحيح

    const choice = document.getElementById("hasInjured").value;
    const container = document.querySelectorAll("#injuredContainer > div");

    // 2. التحقق من اختيار القائمة
    if (choice === "") {
        alert("⚠️ يرجى تحديد الخيار (نعم / لا) من القائمة أولاً.");
        document.getElementById("hasInjured").focus();
        return;
    }

    // 3. التحقق من اختيار "نعم" دون بيانات
    if (choice === "yes" && container.length === 0) {
        alert("⚠️ اخترت 'نعم' ولكن لم تضف مصابين.\nأضف مصاباً أو غير الخيار إلى 'لا'.");
        return;
    }

    const injured = [];
    let isDataIncomplete = false;

    // 4. تجميع البيانات فقط إذا كان الخيار نعم
    if (choice === "yes") {
        container.forEach(div => {
            const nameInp = div.querySelector(".injuredName");
            const idInp = div.querySelector(".injuredId");
            const phoneInp = div.querySelector(".injuredPhone");
            const typeInp = div.querySelector(".injuredType");
            const dateInp = div.querySelector(".injuredDate");

            // تنظيف القيم
            const valName = nameInp.value.trim();
            const valId = idInp.value.trim();
            const valPhone = phoneInp.value.trim();
            const valType = typeInp.value.trim();
            const valDate = dateInp.value;

            // إعادة تعيين الألوان
            [nameInp, idInp, phoneInp, typeInp, dateInp].forEach(inp => inp.style.border = "1px solid #ccc");

            // فحص الفراغات
            if (!valName || !valId || !valPhone || !valType || !valDate) {
                isDataIncomplete = true;
                if (!valName) nameInp.style.border = "1px solid red";
                if (!valId) idInp.style.border = "1px solid red";
                if (!valPhone) phoneInp.style.border = "1px solid red";
                if (!valType) typeInp.style.border = "1px solid red";
                if (!valDate) dateInp.style.border = "1px solid red";
            }
            if (!/^[0-9]{9}$/.test(valId)) {
                idInp.style.border = "1px solid red";
                alert("⚠️ رقم هوية المصاب يجب أن يكون 9 أرقام");
                isDataIncomplete = true;
            }
            if (!/^[0-9]{7,12}$/.test(valPhone)) {
                phoneInp.style.border = "1px solid red";
                alert("⚠️ رقم الجوال غير صحيح");
                isDataIncomplete = true;
            }
            if (injured.some(x => x.id === valId)) {
                idInp.style.border = "1px solid red";
                alert("⚠️ لا يمكن إدخال نفس المصاب مرتين");
                isDataIncomplete = true;
            }


            injured.push({
                name: valName,
                id: valId,
                phone: valPhone,
                type: valType,
                date: valDate
            });
        });
    }

    if (isDataIncomplete) {
        alert("⚠️ يرجى تعبئة كافة الحقول المطلوبة باللون الأحمر.");
        return;
    }

    // =================================================
    // ✅ الحفظ والإرسال
    // =================================================

    const btn = document.querySelector("button[onclick='saveInjured()']");
    const oldText = btn.innerText;
    btn.innerText = "جاري الحفظ...";
    btn.disabled = true;

    // لاحظ: نرسل husbandId المستخرج بشكل صحيح
    const payload = {
        action: "saveInjured",
        husbandId: husbandId,
        injured: choice === "yes" ? injured : []
    };

    if (!husbandId || !/^[0-9]{9}$/.test(String(husbandId))) {
        alert("⚠️ رقم هوية رب الأسرة غير صالح");
        return;
    }

    fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // 🔹 مهم لجوجل سكريبت
        body: JSON.stringify(payload)
    })
        .then(() => {
            alert("✅ تم إرسال بيانات الجرحى بنجاح.");
            window.location.href = "martyrs.html";
        })
        .catch(err => {
            console.error(err);
            alert("❌ حدث خطأ أثناء محاولة الإرسال.");
            btn.innerText = oldText;
            btn.disabled = false;
        });
}