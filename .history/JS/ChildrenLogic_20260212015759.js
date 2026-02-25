const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzMsMmEoxviek7_7CE75m50mqcn7YMHWHMpYdSr9HPVE2RxW5nnWDFtrDt4oJDTovwo6g/exec";

let childCount = 0;
const maxChildren = 15;

// إظهار/إخفاء القسم
function toggleChildren() {
    const choice = document.getElementById("hasChildren").value;
    document.getElementById("childrenSection").style.display = (choice === "yes") ? "block" : "none";
}

// إضافة ابن جديد
function addChild() {
    if (childCount >= maxChildren) {
        alert("الحد الأقصى 15 ابن فقط");
        return;
    }
    childCount++;

    const container = document.getElementById("childrenContainer");
    const div = document.createElement("div");

    // تنسيق البطاقة
    div.className = "child-card";
    div.style.border = "1px solid #ccc";
    div.style.padding = "15px";
    div.style.marginBottom = "15px";
    div.style.borderRadius = "8px";
    div.style.backgroundColor = "#fff";

    div.innerHTML = `
        <h4 style="margin-top:0;">الابن رقم ${childCount}</h4>

        <label>اسم الابن رباعي</label>
        <input type="text" class="childName" required>

        <label>رقم هوية الابن</label>
        <input type="text" class="childId" placeholder="9 أرقام" inputmode="numeric" required>

        <label>جنس الابن</label>
        <select class="childGender" required>
            <option value="ذكر">ذكر</option>
            <option value="أنثى">أنثى</option>
        </select>

        <label>تاريخ الميلاد</label>
        <input type="date" class="childBirth" required>

        <label>هل يعاني من أمراض؟</label>
        <select class="childIll" required>
            <option value="لا">لا</option>
            <option value="نعم">نعم</option>
        </select>

        <label>نوع المرض (إن وجد)</label>
        <input type="text" class="childIllType">

        <button type="button" class="btn-delete" onclick="this.parentElement.remove(); childCount--;" style="background-color:#ff4d4d; margin-top:10px;">🗑️ حذف</button>
    `;

    container.appendChild(div);
}

// الحفظ والإرسال
function saveAll() {
    // 1. التأكد من وجود البيانات العامة
    const storedData = localStorage.getItem("generalData");
    if (!storedData) {
        alert("⚠️ خطأ: البيانات العامة مفقودة! يرجى العودة للبداية.");
        return;
    }
    const generalData = JSON.parse(storedData);

    if (!/^\d{9}$/.test(generalData.husbandId)) {
        alert("خطأ في بيانات رب الأسرة");
        return;
    }

    const choice = document.getElementById("hasChildren").value;
    const container = document.querySelectorAll("#childrenContainer > div");

    // 2. التحقق من الاختيار
    if (choice === "") {
        alert("⚠️ يرجى تحديد الخيار (نعم / لا) أولاً.");
        return;
    }
    // 3. تجميع البيانات والتحقق من النواقص
    const children = [];
    let isDataIncomplete = false;

    if (choice === "yes") {
        if (container.length === 0) {
            alert("⚠️ اخترت 'نعم' ولكن لم تضف أي ابن.");
            return;
        }

        const usedIds = new Set();

        container.forEach(div => {
            const nameInp = div.querySelector(".childName");
            const idInp = div.querySelector(".childId");
            const genderInp = div.querySelector(".childGender");
            const birthInp = div.querySelector(".childBirth");
            const illInp = div.querySelector(".childIll");
            const illTypeInp = div.querySelector(".childIllType");

            const vName = nameInp.value.trim();
            const vId = idInp.value.trim();
            const vGender = genderInp.value;
            const vBirth = birthInp.value;
            const vIll = illInp.value;
            const vIllType = illTypeInp.value.trim();

            // تنظيف الألوان
            [nameInp, idInp, genderInp, birthInp, illInp].forEach(el => el.style.border = "1px solid #ccc");

            // التحقق من الحقول الإجبارية
            if (!vName || !vId || !vGender || !vBirth || !vIll) {
                isDataIncomplete = true;
                if (!vName) nameInp.style.border = "1px solid red";
                if (!vId) idInp.style.border = "1px solid red";
                if (!vGender) genderInp.style.border = "1px solid red";
                if (!vBirth) birthInp.style.border = "1px solid red";
                if (!vIll) illInp.style.border = "1px solid red";
            }
            // التحقق من هوية الابن

            if (!/^\d{9}$/.test(vId)) {
                isDataIncomplete = true;
                idInp.style.border = "1px solid red";
            }
            // منع تكرار رقم هوية الأبناء داخل نفس العائلة
            if (usedIds.has(vId)) {
                alert("❌ يوجد تكرار في رقم هوية أحد الأبناء");
                idInp.style.border = "1px solid red";
                isDataIncomplete = true;
            }
            usedIds.add(vId);
            // منع إدخال نوع مرض بدون اختيار "نعم"
            if (vIll === "نعم" && !vIllType) {
                illTypeInp.style.border = "1px solid red";
                isDataIncomplete = true;
            }
            // منع عمر غير منطقي (تاريخ الميلاد في المستقبل)
            const today = new Date().toISOString().split("T")[0];
            if (vBirth > today) {
                birthInp.style.border = "1px solid red";
                isDataIncomplete = true;
            }


            children.push({
                name: vName,
                id: vId,
                gender: vGender,
                birth: vBirth,
                ill: vIll,
                illType: vIllType
            });
        });
    }

    if (isDataIncomplete) {
        alert("⚠️ يرجى تعبئة كافة الحقول المطلوبة.");
        return;
    }

    // 4. الإرسال
    const btn = document.querySelector(".btn-submit");
    const oldText = btn.innerText;
    btn.innerText = "جاري الحفظ...";
    btn.disabled = true;

    // ملاحظة: نرسل husbandId الموجود في generalData لضمان الربط السليم
    const payload = {
        action: "registerFamily",
        husband: generalData,
        husbandId: generalData.husbandId,
        children: children
    };

    fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", 
        body: JSON.stringify(payload)
    })
        .then(() => {
            alert("✅ تم إرسال البيانات بنجاح).");
            window.location.href = "injured.html";
        })
        .catch(err => {
            console.error(err);
            alert("❌ حدث خطأ أثناء محاولة الإرسال.");
            btn.innerText = oldText;
            btn.disabled = false;
        });
}